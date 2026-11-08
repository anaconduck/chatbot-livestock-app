import "server-only";
import dns from "node:dns";
import { getServerEnv } from "@/lib/env";
import type { ChatSource } from "@/types";

// Paksa Node.js menggunakan jalur IPv4 terlebih dahulu agar tidak nyangkut (hang) pada jaringan IPv6 lokal
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

/**
 * Jalur 1: Gemini Interactions API (`/v1beta/interactions`) — direkomendasikan Google untuk `gemini-3.8-flash`
 */
async function callGeminiInteractionsApi(
  apiKey: string,
  query: string
): Promise<{ answer: string; sources: ChatSource[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.8-flash",
          system_instruction: SYSTEM_INSTRUCTION,
          input: query,
        }),
      }
    );

    const rawBody = await res.text();
    if (!res.ok) {
      throw new Error(parseErrorMessage(res.status, rawBody));
    }

    const data = JSON.parse(rawBody);
    let extractedText = "";

    if (typeof data?.output_text === "string" && data.output_text.trim()) {
      extractedText = data.output_text.trim();
    } else if (Array.isArray(data?.outputs)) {
      extractedText = data.outputs
        .filter((o: { type?: string; text?: string }) => o?.type === "text" || typeof o?.text === "string")
        .map((o: { text?: string }) => o.text || "")
        .join("\n")
        .trim();
    } else if (Array.isArray(data?.steps)) {
      const texts: string[] = [];
      for (const step of data.steps) {
        if (typeof step?.text === "string") texts.push(step.text);
        const parts = step?.content?.parts || step?.output?.parts || [];
        if (Array.isArray(parts)) {
          for (const p of parts) {
            if (!p?.thought && typeof p?.text === "string") {
              texts.push(p.text);
            }
          }
        }
      }
      extractedText = texts.join("\n").trim();
    }

    if (!extractedText) {
      throw new Error("Respons Interactions API kosong.");
    }

    return {
      answer: cleanGeminiText(extractedText),
      sources: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Jalur 2: Gemini generateContent API (`/v1beta/models/gemini-3.8-flash:generateContent`) dengan thinkingLevel LOW
 */
async function callGeminiGenerateContent(
  apiKey: string,
  query: string
): Promise<{ answer: string; sources: ChatSource[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
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
          maxOutputTokens: 1200,
          thinkingConfig: {
            thinkingLevel: "low",
          },
        },
      }),
    });

    const rawBody = await res.text();
    if (!res.ok) {
      throw new Error(parseErrorMessage(res.status, rawBody));
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
      throw new Error("Respons kosong dari Gemini generateContent.");
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

  try {
    // Jalankan Interactions API & generateContent (thinkingLevel LOW) secara paralel, ambil yang paling cepat selesai
    const result = await Promise.any([
      callGeminiInteractionsApi(cleanKey, payload.query),
      callGeminiGenerateContent(cleanKey, payload.query),
    ]);

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
