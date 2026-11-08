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

async function callGeminiEndpoint(
  endpoint: string,
  apiKey: string,
  query: string
): Promise<{ answer: string; sources: ChatSource[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

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
          maxOutputTokens: 800,
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
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("")
        .trim() || "";

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

  const isVertexExpressKey = cleanKey.startsWith("AQ.");
  const endpoints = isVertexExpressKey
    ? [
        `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.0-flash-001:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
      ]
    : [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
      ];

  try {
    const result = await Promise.any(
      endpoints.map((ep) => callGeminiEndpoint(ep, cleanKey, payload.query))
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
      errorMsg = err.errors[0]?.message || errorMsg;
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
