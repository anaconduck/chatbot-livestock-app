import "server-only";
import dns from "node:dns";
import { getServerEnv } from "@/lib/env";
import type { ChatSource } from "@/types";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // ignore
}

export interface ChatRequestPayload {
  query: string;
  conversation_id?: string;
  user: string;
}

export interface ChatResponsePayload {
  answer: string;
  conversation_id: string;
  message_id: string;
  sources: ChatSource[];
}

const SYSTEM_INSTRUCTION = `Anda adalah ChickAI Assistant, asisten virtual pintar dari platform TanyaTernak (Fakultas Peternakan Universitas Brawijaya).
Tugas Anda adalah menjawab pertanyaan pengguna seputar peternakan (unggas, ayam broiler, ayam petelur, sapi, kambing, domba, pakan, nutrisi, kandang, penyakit, biosekuriti, dan smart farming/IoT) secara akurat, jelas, ramah, dan terstruktur dalam Bahasa Indonesia.

Aturan jawaban:
1. Pahami maksud pertanyaan pengguna secara cerdas meskipun terdapat salah ketik (typo), singkatan, atau bahasa sehari-hari peternak.
2. Langsung jawab inti pertanyaan pengguna di kalimat pertama (misalnya pengertian/definisi langsung, cara mengatasi, atau langkah praktis) sesuai apa yang ditanyakan.
3. Gunakan teks polos yang rapi dengan poin bernomor (1, 2, 3) tanpa simbol bintang markdown (**).`;

function cleanGeminiText(raw: string): string {
  return raw
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .trim();
}

function parseErrorMessage(status: number, rawBody: string): string {
  try {
    const parsed = JSON.parse(rawBody);
    if (parsed?.error?.message) {
      return `${status}: ${parsed.error.message}`;
    }
  } catch {
    // ignore
  }
  return `HTTP ${status}`;
}

let cachedAvailableModels: string[] | null = null;

/**
 * Ambil daftar model resmi dari Google AI Studio yang aktif untuk API Key ini
 */
async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  if (cachedAvailableModels && cachedAvailableModels.length > 0) {
    return cachedAvailableModels;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        signal: controller.signal,
        headers: { "x-goog-api-key": apiKey },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const models: Array<{
      name?: string;
      supportedGenerationMethods?: string[];
    }> = data?.models || [];

    const textModels = models
      .filter((m) => {
        const n = (m.name || "").toLowerCase();
        const methods = m.supportedGenerationMethods || [];
        return (
          methods.includes("generateContent") &&
          (n.includes("gemini") || n.includes("gemma")) &&
          !n.includes("embedding") &&
          !n.includes("imagen") &&
          !n.includes("image") &&
          !n.includes("tts") &&
          !n.includes("audio") &&
          !n.includes("vision") &&
          !n.includes("aqa")
        );
      })
      .map((m) => (m.name || "").replace(/^models\//, ""));

    // Urutkan agar model flash-lite / flash yang paling ringan & jarang antre (503) berada di urutan teratas
    textModels.sort((a, b) => {
      const score = (name: string) => {
        if (name.includes("3.8") && name.includes("lite")) return 1;
        if (name.includes("flash-lite")) return 2;
        if (name.includes("3.8-flash")) return 3;
        if (name.includes("3.5-flash")) return 4;
        if (name.includes("flash")) return 5;
        if (name.includes("gemma-3-27b")) return 6;
        if (name.includes("pro")) return 7;
        return 8;
      };
      return score(a) - score(b);
    });

    if (textModels.length > 0) {
      cachedAvailableModels = textModels;
    }
    return textModels;
  } catch {
    return [];
  }
}

async function callSingleGeminiModel(
  modelName: string,
  apiKey: string,
  query: string
): Promise<{ answer: string; sources: ChatSource[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);

  const isGemma = modelName.toLowerCase().startsWith("gemma");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const payload = isGemma
    ? {
        contents: [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nPertanyaan: ${query}` }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
        },
      }
    : {
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: query }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
        },
      };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await res.text();
    if (!res.ok) {
      throw new Error(`[${modelName}] ${parseErrorMessage(res.status, rawBody)}`);
    }

    const data = JSON.parse(rawBody);
    const parts: Array<{ text?: string; thought?: boolean }> =
      data?.candidates?.[0]?.content?.parts || [];
    const text =
      parts
        .filter((p) => !p.thought)
        .map((p) => p.text || "")
        .join("")
        .trim() ||
      parts
        .map((p) => p.text || "")
        .join("")
        .trim();

    if (!text) {
      throw new Error(`[${modelName}] Respons kosong.`);
    }

    return {
      answer: cleanGeminiText(text),
      sources: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendChatMessage(
  payload: ChatRequestPayload
): Promise<ChatResponsePayload> {
  const env = getServerEnv();
  const cleanKey = (env.GEMINI_API_KEY || "").trim();

  if (!cleanKey) {
    return {
      answer:
        "GEMINI_API_KEY belum terdeteksi di server. Pastikan GEMINI_API_KEY sudah dimasukkan ke .env.local (atau Environment Variables di Vercel) lalu lakukan redeploy.",
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: [],
    };
  }

  // Ambil daftar model resmi Google yang tersedia di akun ini
  const discoveredModels = await getAvailableGeminiModels(cleanKey);
  const candidateModels =
    discoveredModels.length > 0
      ? discoveredModels.slice(0, 4)
      : ["gemini-3.8-flash-lite", "gemini-3.8-flash", "gemma-3-27b-it"];

  try {
    // Panggil kandidat model Google secara paralel sehingga jika `gemini-3.8-flash` sedang penuh (503 High Demand),
    // model pendamping resmi di akun Google AI Studio Anda langsung menjawab dalam 1-2 detik!
    const result = await Promise.any(
      candidateModels.map((model) =>
        callSingleGeminiModel(model, cleanKey, payload.query)
      )
    );

    return {
      answer: result.answer,
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: result.sources,
    };
  } catch (err: unknown) {
    let errorMsg = "Gagal terhubung ke Google Gemini API.";
    if (err instanceof AggregateError && err.errors?.length > 0) {
      errorMsg = err.errors
        .map((e: Error) => e?.message)
        .filter(Boolean)
        .join(" | ");
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }

    return {
      answer: `[Status Gemini API Error]: ${errorMsg}`,
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: [],
    };
  }
}
