import "server-only";
import { getServerEnv } from "@/lib/env";
import type { ChatSource } from "@/types";

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

let cachedDynamicModel: string | null = null;

/**
 * Cari otomatis nama model Flash gratis yang aktif di akun Google AI Studio jika model default berubah versi
 */
async function discoverAvailableFlashModel(apiKey: string): Promise<string | null> {
  if (cachedDynamicModel) return cachedDynamicModel;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey
      )}`,
      { headers: { "x-goog-api-key": apiKey } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const models: Array<{
      name?: string;
      supportedGenerationMethods?: string[];
    }> = data?.models || [];

    const flashModel = models.find(
      (m) =>
        m.name &&
        m.name.includes("gemini") &&
        m.name.includes("flash") &&
        !m.name.includes("image") &&
        !m.name.includes("tts") &&
        !m.name.includes("audio") &&
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes("generateContent")
    );

    if (flashModel?.name) {
      cachedDynamicModel = flashModel.name.replace(/^models\//, "");
      return cachedDynamicModel;
    }
    return null;
  } catch {
    return null;
  }
}

async function callGeminiModel(
  modelName: string,
  apiKey: string,
  query: string
): Promise<{ answer: string; sources: ChatSource[] }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
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
        maxOutputTokens: 1500,
      },
    }),
  });

  const rawBody = await res.text();
  if (!res.ok) {
    let errDetail = `HTTP ${res.status}`;
    try {
      const parsedErr = JSON.parse(rawBody);
      if (parsedErr?.error?.message) {
        errDetail = `${res.status}: ${parsedErr.error.message}`;
      }
    } catch {
      // ignore
    }
    throw new Error(errDetail);
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
    throw new Error("Respons kosong dari Gemini API.");
  }

  const groundingChunks =
    data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundedSources: ChatSource[] = [];

  for (const chunk of groundingChunks) {
    if (chunk?.web?.uri && chunk?.web?.title) {
      let host = "Sumber Web";
      try {
        host = new URL(chunk.web.uri).hostname.replace(/^www\./, "");
      } catch {
        // ignore
      }
      groundedSources.push({
        title: chunk.web.title,
        url: chunk.web.uri,
        sourceName: host,
        snippet: `Referensi dari ${host}`,
      });
    }
  }

  return {
    answer: cleanGeminiText(text),
    sources: groundedSources.slice(0, 4),
  };
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
    // 1. Panggil langsung model terbaru sesuai instruksi Google AI Studio (`gemini-3.8-flash`)
    const result = await callGeminiModel(
      "gemini-3.8-flash",
      cleanKey,
      payload.query
    );

    return {
      answer: result.answer,
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: result.sources,
    };
  } catch (firstErr: unknown) {
    // 2. Jika nama versi model berubah, deteksi otomatis model Flash gratis yang tersedia di akun
    try {
      const discoveredModel = await discoverAvailableFlashModel(cleanKey);
      if (discoveredModel && discoveredModel !== "gemini-3.8-flash") {
        const fallbackResult = await callGeminiModel(
          discoveredModel,
          cleanKey,
          payload.query
        );
        return {
          answer: fallbackResult.answer,
          conversation_id: payload.conversation_id || `conv-${Date.now()}`,
          message_id: `msg-${Date.now()}`,
          sources: fallbackResult.sources,
        };
      }
    } catch {
      // ignore and report primary error
    }

    const errorMsg =
      firstErr instanceof Error
        ? firstErr.message
        : "Gagal terhubung ke Google Gemini API.";

    return {
      answer: `[Status Gemini API Error]: ${errorMsg}`,
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: [],
    };
  }
}
