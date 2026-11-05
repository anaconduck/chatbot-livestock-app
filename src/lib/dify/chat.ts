import "server-only";
import { difyClient } from "./client";
import { getServerEnv } from "@/lib/env";
import type { DifyChatMessagePayload, DifyChatResponse } from "./types";

export async function sendChatMessage(payload: DifyChatMessagePayload): Promise<{
  answer: string;
  conversation_id: string;
  message_id: string;
  sources: Array<{ title: string; snippet?: string; url?: string }>;
}> {
  const env = getServerEnv();

  // If mock mode is active or client is not configured, return realistic poultry domain mock response
  if (env.DIFY_MOCK_MODE || !difyClient.isConfigured) {
    const q = payload.query.toLowerCase();
    let answer =
      "Berdasarkan literatur agribisnis peternakan yang tersedia di TanyaTernak, manajemen pakan, biosekuriti, dan mikroklimat kandang closed-house sangat krusial untuk menjaga rasio FCR optimal dan meminimalkan resiko stres panas (heat stress).";

    if (q.includes("pakan") || q.includes("nutrisi")) {
      answer =
        "Formulasi pakan ayam petelur (layer) memerlukan rasio protein kasar 16-18% dan kalsium minimal 3.5-4.0% pada fase puncak produksi guna mencegah kerabang telur tipis. Suplementasi kalsit dan asam amino esensial seperti metionin sangat disarankan.";
    } else if (q.includes("penyakit") || q.includes("vaksin") || q.includes("biosekuriti")) {
      answer =
        "Pencegahan penyakit utama unggas seperti Newcastle Disease (ND) dan Avian Influenza (AI) bertumpu pada biosekuriti 3 zona ketat (zona merah, kuning, dan hijau) serta jadwal vaksinasi teratur sesuai umur flok.";
    } else if (q.includes("suhu") || q.includes("kandang") || q.includes("amonia")) {
      answer =
        "Suhu ideal kandang closed-house fase layer adalah 20-24°C dengan kelembaban 60-70%. Kadar gas amonia wajib dijaga di bawah 20 ppm menggunakan sistem ventilasi cross/tunnel ventilation yang terkontrol.";
    }

    return {
      answer: `[Simulasi ChickAI Assistant] ${answer}`,
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: [
        {
          title: "Optimasi Formulasi Pakan Layer Fase Puncak (2025)",
          snippet: "Studi efisiensi ransum pakan unggas petelur dengan kalsium organik mikron.",
        },
        {
          title: "Protokol Biosekuriti Tiga Zona Kandang Modern (2025)",
          snippet: "Panduan zonasi merah, kuning, dan hijau guna mitigasi patogen.",
        },
      ],
    };
  }

  // Real Dify Cloud API call
  const response = await difyClient.fetchChat("/chat-messages", {
    method: "POST",
    body: JSON.stringify({
      inputs: payload.inputs || {},
      query: payload.query,
      response_mode: payload.response_mode || "blocking",
      conversation_id: payload.conversation_id || "",
      user: payload.user,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dify API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as DifyChatResponse;
  const sources = (data.metadata?.retriever_resources || []).map((res) => ({
    title: res.document_name || res.title,
    snippet: res.content?.slice(0, 160),
  }));

  return {
    answer: data.answer,
    conversation_id: data.conversation_id,
    message_id: data.message_id || data.id,
    sources,
  };
}
