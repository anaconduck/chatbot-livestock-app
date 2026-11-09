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

function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLivestockQuery(rawQuery: string): string {
  const cleaned = rawQuery
    .toLowerCase()
    .replace(/\bboiler\b/g, "broiler")
    .replace(/\bpetelor\b/g, "petelur")
    .replace(
      /\b(apa|apakah|itu|yang|dimaksud|dengan|pengertian|arti|bagaimana|gimana|cara|kenapa|mengapa|tolong|jelaskan|sebutkan|tentang)\b/g,
      " "
    )
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || rawQuery.trim();
}

/**
 * Referensi web otoritatif bidang peternakan sesuai topik pertanyaan (Fapet UB, IPB, FAO, Ditjen PKH, Merck)
 */
function getCuratedWebReferences(query: string): ChatSource[] {
  const q = query.toLowerCase();

  if (
    q.includes("pakan") ||
    q.includes("nutrisi") ||
    q.includes("kalsium") ||
    q.includes("protein") ||
    q.includes("ransum") ||
    q.includes("fcr")
  ) {
    return [
      {
        title: "Jurnal Ilmu Nutrisi dan Teknologi Pakan (JINTP) — IPB University",
        snippet:
          "Standar formulasi ransum unggas, kecernaan nutrisi pakan, dan efisiensi konversi pakan (FCR).",
        url: "https://journal.ipb.ac.id/index.php/jurnalintp",
        sourceName: "journal.ipb.ac.id",
      },
      {
        title:
          "Jurnal Ilmu-Ilmu Peternakan (JIIP) — Fakultas Peternakan Universitas Brawijaya",
        snippet:
          "Riset nutrisi unggas tropis, pakan lokal alternatif, dan performa produksi ternak.",
        url: "https://jiip.ub.ac.id/",
        sourceName: "jiip.ub.ac.id",
      },
    ];
  }

  if (
    q.includes("penyakit") ||
    q.includes("vaksin") ||
    q.includes("biosekuriti") ||
    q.includes("nd") ||
    q.includes("ai") ||
    q.includes("tetelo") ||
    q.includes("flu burung") ||
    q.includes("gumboro") ||
    q.includes("coryza") ||
    q.includes("snot")
  ) {
    return [
      {
        title: "Merck Veterinary Manual — Poultry Diseases & Management",
        snippet:
          "Panduan klinis patologi unggas, protokol vaksinasi terjadwal, dan tata laksana biosekuriti kandang.",
        url: "https://www.merckvetmanual.com/poultry",
        sourceName: "merckvetmanual.com",
      },
      {
        title:
          "Direktorat Jenderal Peternakan dan Kesehatan Hewan (Ditjen PKH Kementan RI)",
        snippet:
          "Pedoman pencegahan dan pengendalian penyakit unggas menular strategis serta biosekuriti 3 zona.",
        url: "https://ditjenpkh.pertanian.go.id/",
        sourceName: "ditjenpkh.pertanian.go.id",
      },
    ];
  }

  if (
    q.includes("suhu") ||
    q.includes("kandang") ||
    q.includes("closed") ||
    q.includes("amonia") ||
    q.includes("ventilasi") ||
    q.includes("panas") ||
    q.includes("heat stress") ||
    q.includes("kelembaban") ||
    q.includes("brooding")
  ) {
    return [
      {
        title: "FAO Animal Production and Health — Poultry Housing & Climate Control",
        snippet:
          "Standar mikroklimat kandang, ventilasi tunnel, mitigasi heat stress, dan kontrol amonia.",
        url: "https://www.fao.org/animal-production/en",
        sourceName: "fao.org",
      },
      {
        title:
          "Jurnal Ilmu-Ilmu Peternakan (JIIP) — Fakultas Peternakan Universitas Brawijaya",
        snippet:
          "Manajemen mikroklimat kandang closed house dan kenyamanan termal ternak unggas tropis.",
        url: "https://jiip.ub.ac.id/",
        sourceName: "jiip.ub.ac.id",
      },
    ];
  }

  if (
    q.includes("smart") ||
    q.includes("iot") ||
    q.includes("sensor") ||
    q.includes("otomatis") ||
    q.includes("digital")
  ) {
    return [
      {
        title: "Smart Poultry & Precision Livestock Farming — Poultry Science Literature",
        snippet:
          "Penerapan sensor IoT, kontrol otomatis mikroklimat kandang, dan sistem pemantauan presisi.",
        url: "https://www.sciencedirect.com/journal/poultry-science",
        sourceName: "sciencedirect.com",
      },
      {
        title:
          "Jurnal Ilmu-Ilmu Peternakan (JIIP) — Fakultas Peternakan Universitas Brawijaya",
        snippet:
          "Inovasi teknologi digital dan otomatisasi budidaya peternakan modern.",
        url: "https://jiip.ub.ac.id/",
        sourceName: "jiip.ub.ac.id",
      },
    ];
  }

  return [
    {
      title:
        "Jurnal Ilmu-Ilmu Peternakan (JIIP) — Fakultas Peternakan Universitas Brawijaya",
      snippet:
        "Publikasi ilmiah terakreditasi riset agribisnis dan teknologi peternakan modern Fapet UB.",
      url: "https://jiip.ub.ac.id/",
      sourceName: "jiip.ub.ac.id",
    },
    {
      title:
        "Direktorat Jenderal Peternakan dan Kesehatan Hewan (Ditjen PKH Kementan RI)",
      snippet:
        "Informasi dan regulasi tata laksana budidaya peternakan nasional.",
      url: "https://ditjenpkh.pertanian.go.id/",
      sourceName: "ditjenpkh.pertanian.go.id",
    },
  ];
}

/**
 * Cari publikasi & jurnal ilmiah dari OpenAlex API (Gratis tanpa API key)
 */
async function searchOpenAlexJournals(query: string): Promise<ChatSource[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);

    const cleanKeywords = normalizeLivestockQuery(query);
    const searchQuery =
      cleanKeywords.includes("ternak") ||
      cleanKeywords.includes("ayam") ||
      cleanKeywords.includes("broiler") ||
      cleanKeywords.includes("pakan") ||
      cleanKeywords.includes("unggas") ||
      cleanKeywords.includes("poultry") ||
      cleanKeywords.includes("sapi") ||
      cleanKeywords.includes("kambing")
        ? cleanKeywords
        : `${cleanKeywords} peternakan`;

    const url = `https://api.openalex.org/works?search=${encodeURIComponent(
      searchQuery
    )}&per-page=3&select=title,doi,primary_location,publication_year,authorships`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "mailto:info@tanyaternak.id" },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    const nonTechnicalWords = [
      "sak emkm",
      "akuntansi",
      "human capital",
      "komitmen organisasi",
      "kinerja karyawan",
      "strategi pemasaran",
      "pajak",
      "keuangan",
    ];

    return results
      .filter((work: { title?: string }) => {
        if (!work?.title) return false;
        const lowerTitle = work.title.toLowerCase();
        return !nonTechnicalWords.some((w) => lowerTitle.includes(w));
      })
      .slice(0, 2)
      .map(
        (work: {
          title: string;
          doi?: string;
          publication_year?: number;
          primary_location?: {
            landing_page_url?: string;
            source?: { display_name?: string };
          };
          authorships?: Array<{ author?: { display_name?: string } }>;
        }) => {
          const authorName =
            work.authorships?.[0]?.author?.display_name || "Peneliti Akademik";
          const journalName =
            work.primary_location?.source?.display_name || "Jurnal Ilmiah Terindeks";
          const year = work.publication_year ? ` (${work.publication_year})` : "";
          const targetUrl =
            work.doi ||
            work.primary_location?.landing_page_url ||
            `https://scholar.google.com/scholar?q=${encodeURIComponent(work.title)}`;

          return {
            title: `${work.title}${year}`,
            author: authorName,
            snippet: `Publikasi ilmiah oleh ${authorName} pada ${journalName}.`,
            url: targetUrl,
            sourceName: journalName,
          };
        }
      );
  } catch {
    return [];
  }
}

/**
 * Cari artikel ensiklopedia peternakan dari Wikipedia Indonesia
 */
async function searchWikipediaIndonesia(query: string): Promise<ChatSource[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const cleanKeywords = normalizeLivestockQuery(query);
    const wikiQuery =
      cleanKeywords.includes("ternak") ||
      cleanKeywords.includes("ayam") ||
      cleanKeywords.includes("sapi") ||
      cleanKeywords.includes("kambing") ||
      cleanKeywords.includes("unggas")
        ? cleanKeywords
        : `${cleanKeywords} peternakan`;

    const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      wikiQuery
    )}&utf8=1&format=json&srlimit=3`;

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "TanyaTernakBot/1.0 (https://tanyaternak.id)" },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const results: Array<{ title: string; snippet: string }> =
      data?.query?.search || [];

    const irrelevantWords = [
      "orak-arik",
      "masakan",
      "resep",
      "goreng",
      "kuliner",
      "pabrik gula",
      "lokomotif",
      "uap",
      "film",
      "lagu",
      "album",
      "sinetron",
    ];
    const relevantWords = [
      "ternak",
      "ayam",
      "unggas",
      "broiler",
      "sapi",
      "kambing",
      "domba",
      "pakan",
      "kandang",
      "penyakit",
      "vaksin",
      "hewan",
      "telur",
      "pertanian",
      "nutrisi",
      "biologi",
    ];

    return results
      .filter((item) => {
        const combined = `${item.title} ${stripHtmlTags(item.snippet)}`.toLowerCase();
        const hasIrrelevant = irrelevantWords.some((w) => combined.includes(w));
        const hasRelevant = relevantWords.some((w) => combined.includes(w));
        return !hasIrrelevant && hasRelevant;
      })
      .slice(0, 1)
      .map((item) => ({
        title: `${item.title} — Ensiklopedia Wikipedia`,
        snippet: stripHtmlTags(item.snippet),
        url: `https://id.wikipedia.org/wiki/${encodeURIComponent(
          item.title.replace(/ /g, "_")
        )}`,
        sourceName: "id.wikipedia.org",
      }));
  } catch {
    return [];
  }
}

/**
 * Kumpulkan referensi ilmiah & internet secara cepat dan aman tanpa memodifikasi jawaban AI
 */
async function gatherInternetSources(query: string): Promise<ChatSource[]> {
  try {
    const [openAlex, wiki] = await Promise.all([
      searchOpenAlexJournals(query),
      searchWikipediaIndonesia(query),
    ]);
    const curated = getCuratedWebReferences(query);
    const combined = [...openAlex, ...wiki, ...curated];

    const seen = new Set<string>();
    const unique: ChatSource[] = [];
    for (const s of combined) {
      const key = s.url || s.title;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
      if (unique.length >= 3) break;
    }
    return unique;
  } catch {
    return getCuratedWebReferences(query).slice(0, 2);
  }
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
      sources: groundedSources,
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
    // Panggil kandidat model Google dan kumpulkan referensi internet secara PARALEL
    // Jawaban teks murni 100% dari Gemini, referensi tampil sebagai tautan di bawahnya
    const [result, internetSources] = await Promise.all([
      Promise.any(
        candidateModels.map((model) =>
          callSingleGeminiModel(model, cleanKey, payload.query)
        )
      ),
      gatherInternetSources(payload.query),
    ]);

    const allSources = [...(result.sources || []), ...(internetSources || [])];
    const seenUrls = new Set<string>();
    const mergedSources: ChatSource[] = [];
    for (const src of allSources) {
      const key = src.url || src.title;
      if (!seenUrls.has(key)) {
        seenUrls.add(key);
        mergedSources.push(src);
      }
      if (mergedSources.length >= 3) break;
    }

    return {
      answer: result.answer,
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: mergedSources,
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
