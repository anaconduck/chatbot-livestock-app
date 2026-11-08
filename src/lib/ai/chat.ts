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

function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cari referensi artikel berbahasa Indonesia dari Wikipedia API (Gratis tanpa API Key)
 */
async function searchWikipediaIndonesia(query: string): Promise<ChatSource[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=1&format=json&srlimit=2`;

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "TanyaTernakBot/1.0 (https://tanyaternak.id)" },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.query?.search || [];

    return results.map((item: { title: string; snippet: string }) => ({
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
 * Cari publikasi & jurnal ilmiah internasional/nasional dari OpenAlex API (Gratis tanpa API Key)
 */
async function searchOpenAlexJournals(query: string): Promise<ChatSource[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const searchQuery =
      query.toLowerCase().includes("ternak") ||
      query.toLowerCase().includes("ayam") ||
      query.toLowerCase().includes("pakan") ||
      query.toLowerCase().includes("unggas") ||
      query.toLowerCase().includes("sapi") ||
      query.toLowerCase().includes("kambing")
        ? query
        : `${query} peternakan`;

    const url = `https://api.openalex.org/works?search=${encodeURIComponent(
      searchQuery
    )}&per-page=2&select=title,doi,primary_location,publication_year,authorships`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "mailto:info@tanyaternak.id" },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    return results
      .filter((work: { title?: string }) => Boolean(work?.title))
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
 * Referensi web otoritatif bidang peternakan sesuai topik pertanyaan
 */
function getCuratedWebReferences(query: string): ChatSource[] {
  const q = query.toLowerCase();

  if (q.includes("pakan") || q.includes("nutrisi") || q.includes("kalsium") || q.includes("protein") || q.includes("ransum")) {
    return [
      {
        title: "Jurnal Ilmu Nutrisi dan Teknologi Pakan (IPB / SINTA)",
        snippet:
          "Standar kebutuhan protein kasar, energi metabolis, asam amino esensial, dan mineral makro-mikro pada ransum ternak.",
        url: "https://journal.ipb.ac.id/index.php/jurnalintp",
        sourceName: "journal.ipb.ac.id",
      },
      {
        title: "Jurnal Ilmu-Ilmu Peternakan (JIIP) — Fakultas Peternakan Universitas Brawijaya",
        snippet:
          "Riset formulasi pakan lokal, kecernaan nutrisi, dan efisiensi konversi pakan (FCR) pada budidaya peternakan tropis.",
        url: "https://jiip.ub.ac.id/",
        sourceName: "jiip.ub.ac.id",
      },
    ];
  }

  if (q.includes("penyakit") || q.includes("vaksin") || q.includes("biosekuriti") || q.includes("virus") || q.includes("bakteri") || q.includes("nd") || q.includes("ai")) {
    return [
      {
        title: "Merck Veterinary Manual — Poultry & Livestock Management",
        snippet:
          "Panduan klinis internasional pencegahan penyakit infeksius, tata laksana vaksinasi, dan sanitasi biosekuriti.",
        url: "https://www.merckvetmanual.com/poultry",
        sourceName: "merckvetmanual.com",
      },
      {
        title: "Direktorat Jenderal Peternakan dan Kesehatan Hewan (Ditjen PKH Kementan RI)",
        snippet:
          "Pedoman nasional pengendalian penyakit hewan menular strategis dan penerapan biosekuriti 3 zona di Indonesia.",
        url: "https://ditjenpkh.pertanian.go.id/",
        sourceName: "ditjenpkh.pertanian.go.id",
      },
    ];
  }

  if (q.includes("suhu") || q.includes("kandang") || q.includes("closed") || q.includes("ventilasi") || q.includes("amonia") || q.includes("kelembaban")) {
    return [
      {
        title: "FAO Animal Production and Health — Livestock Housing & Climate Control",
        snippet:
          "Standar pengendalian suhu efektif, kelembaban udara, kecepatan angin (tunnel ventilation), dan batas gas amonia.",
        url: "https://www.fao.org/animal-production/en",
        sourceName: "fao.org",
      },
      {
        title: "Jurnal Ilmu-Ilmu Peternakan (JIIP) — Fakultas Peternakan Universitas Brawijaya",
        snippet:
          "Kajian mikroklimat kandang tropis, mitigasi cekaman panas (heat stress), dan manajemen kepadatan ternak.",
        url: "https://jiip.ub.ac.id/",
        sourceName: "jiip.ub.ac.id",
      },
    ];
  }

  return [
    {
      title: "Jurnal Ilmu-Ilmu Peternakan (JIIP) — Fakultas Peternakan Universitas Brawijaya",
      snippet:
        "Portal publikasi ilmiah riset produksi ternak, nutrisi, reproduksi, dan sosial ekonomi peternakan Indonesia.",
      url: "https://jiip.ub.ac.id/",
      sourceName: "jiip.ub.ac.id",
    },
    {
      title: "Badan Perakitan dan Modernisasi Pertanian (BRMP / Litbang Kementan RI)",
      snippet:
        "Referensi teknologi budidaya peternakan, manajemen pemeliharaan, dan agribisnis peternakan nasional.",
      url: "https://pertanian.go.id/",
      sourceName: "pertanian.go.id",
    },
  ];
}

/**
 * Gabungkan hasil pencarian internet (OpenAlex + Wikipedia + Referensi Otoritatif) tanpa duplikasi
 */
async function gatherInternetSources(query: string): Promise<ChatSource[]> {
  const [wikiSources, openAlexSources] = await Promise.all([
    searchWikipediaIndonesia(query),
    searchOpenAlexJournals(query),
  ]);

  const curated = getCuratedWebReferences(query);
  const combined = [...openAlexSources, ...wikiSources, ...curated];

  const seenUrls = new Set<string>();
  const uniqueSources: ChatSource[] = [];

  for (const src of combined) {
    const key = src.url || src.title;
    if (!seenUrls.has(key)) {
      seenUrls.add(key);
      uniqueSources.push(src);
    }
    if (uniqueSources.length >= 4) break;
  }

  return uniqueSources;
}

function buildSystemInstruction(sources: ChatSource[]): string {
  const sourcesContext = sources
    .map(
      (s, i) =>
        `[${i + 1}] Judul: ${s.title}\nSumber: ${s.sourceName || s.url}\nRingkasan: ${s.snippet || "-"}`
    )
    .join("\n\n");

  return `Anda adalah ChickAI Assistant, asisten virtual pintar dari platform TanyaTernak (Fakultas Peternakan Universitas Brawijaya).
Tugas Anda adalah menjawab pertanyaan pengguna seputar peternakan secara akurat, jelas, ramah, dan terstruktur dalam Bahasa Indonesia.

Gunakan wawasan ilmiah serta konteks referensi internet berikut sebagai rujukan pendukung:
${sourcesContext}

Aturan jawaban:
1. Berikan penjelasan yang langsung menjawab inti pertanyaan dengan poin-poin praktis.
2. Gunakan teks polos yang rapi tanpa simbol bintang markdown (**).
3. JANGAN menuliskan bagian "Referensi Sumber:" atau daftar tautan di akhir jawaban teks, karena daftar referensi sudah ditampilkan secara terpisah di bawah kotak pesan.`;
}

function cleanAnswerText(raw: string): string {
  return raw
    .replace(/\n*(?:Referensi Sumber|Sumber Referensi|Daftar Referensi|Referensi)\s*:[\s\S]*$/i, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .trim();
}

/**
 * Opsi 1: Google Gemini API (Gratis hingga 1.500 req/hari + Google Search Grounding)
 */
async function tryGeminiApi(
  query: string,
  sources: ChatSource[],
  apiKey: string
): Promise<{ answer: string; extraSources: ChatSource[] } | null> {
  if (!apiKey || apiKey.trim() === "") return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        apiKey.trim()
      )}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemInstruction(sources) }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: query }],
            },
          ],
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 900,
          },
        }),
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("")
        .trim() || "";

    if (!text) return null;

    // Ekstrak sumber internet langsung dari Google Search Grounding jika tersedia
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
          snippet: `Referensi web terindeks dari ${host}`,
        });
      }
    }

    return { answer: text, extraSources: groundedSources };
  } catch {
    return null;
  }
}

/**
 * Opsi 2: Groq Cloud Free API (Llama 3.3 70B)
 */
async function tryGroqApi(
  query: string,
  sources: ChatSource[],
  apiKey: string
): Promise<string | null> {
  if (!apiKey || apiKey.trim() === "") return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: buildSystemInstruction(sources) },
          { role: "user", content: query },
        ],
        temperature: 0.4,
        max_tokens: 900,
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Opsi 3: Layanan AI Publik Gratis Tanpa API Key (Pollinations OpenAI-Compatible Endpoint)
 */
async function tryFreePublicAi(
  query: string,
  sources: ChatSource[]
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: buildSystemInstruction(sources) },
          { role: "user", content: query },
        ],
        temperature: 0.4,
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content && content.length > 20 ? content : null;
  } catch {
    return null;
  }
}

/**
 * Opsi 4 (Cadangan Otomatis): Sintesis langsung dari hasil pencarian internet + basis pengetahuan
 */
function synthesizeAnswerWithInternetSources(
  query: string,
  sources: ChatSource[]
): string {
  const q = query.toLowerCase();

  if (q.includes("pakan") || q.includes("nutrisi") || q.includes("kalsium") || q.includes("protein") || q.includes("ransum")) {
    return (
      "Dalam manajemen nutrisi dan pakan peternakan, keseimbangan antara energi metabolis, protein kasar, asam amino esensial (metionin & lisin), serta mineral makro sangat menentukan performa produksi:\n\n" +
      "1. Kebutuhan Protein & Energi: Ayam petelur (layer) fase produksi membutuhkan sekitar 16–18% protein kasar dengan energi metabolis 2.750–2.850 kkal/kg, sedangkan ayam pedaging (broiler) fase starter membutuhkan 21–23% protein kasar.\n" +
      "2. Kalsium & Fosfor: Pada fase puncak produksi telur, kadar kalsium ransum wajib dijaga pada kisaran 3,8–4,2% dengan fosfor tersedia 0,40–0,45% untuk mencegah kerabang telur tipis atau retak.\n" +
      "3. Manajemen Pemberian: Pastikan ukuran partikel pakan seragam dan ketersediaan air minum bersih selalu mencukupi (2 kali lipat konsumsi pakan)."
    );
  }

  if (q.includes("penyakit") || q.includes("vaksin") || q.includes("biosekuriti") || q.includes("nd") || q.includes("ai") || q.includes("virus")) {
    return (
      "Pengendalian penyakit dan kesehatan ternak bertumpu pada kombinasi protokol biosekuriti berjenjang dan program vaksinasi terjadwal:\n\n" +
      "1. Biosekuriti 3 Zona: Pisahkan secara ketat Zona Merah (area luar), Zona Kuning (area transisi/sanitasi kendaraan & staf), dan Zona Hijau (area kandang produksi).\n" +
      "2. Mitigasi Penyakit Utama (ND, AI, IB, Coryza): Lakukan vaksinasi sesuai titer antibodi dan umur ternak, disertai desinfeksi rutin kandang serta masa istirahat kandang (downtime) minimal 14 hari antar siklus.\n" +
      "3. Isolasi Dini: Ternak yang menunjukkan gejala klinis (lesu, penurunan nafsu makan, gangguan pernapasan) harus segera dipisahkan ke kandang karantina."
    );
  }

  if (q.includes("suhu") || q.includes("kandang") || q.includes("closed") || q.includes("amonia") || q.includes("ventilasi")) {
    return (
      "Pengaturan mikroklimat kandang (khususnya sistem closed-house di iklim tropis) bertujuan menjaga ternak tetap berada pada zona nyaman (thermoneutral zone):\n\n" +
      "1. Suhu & Kelembaban Efektif: Suhu optimal ternak dewasa berkisar antara 20–25°C dengan kelembaban relatif (RH) 60–70%.\n" +
      "2. Kecepatan Angin (Wind Speed): Gunakan tunnel ventilation dengan kecepatan angin 2,0–2,5 m/detik untuk memberikan efek dingin (wind chill effect) saat suhu lingkungan meningkat.\n" +
      "3. Kualitas Udara: Jaga kadar amonia (NH3) di bawah 20 ppm dan karbon dioksida (CO2) di bawah 3.000 ppm dengan menjaga sekam (litter) tetap kering."
    );
  }

  const snippetSummary = sources
    .filter((s) => s.snippet)
    .slice(0, 2)
    .map((s) => `• ${s.title}: ${s.snippet}`)
    .join("\n");

  return (
    `Berikut adalah penjelasan mengenai "${query}" berdasarkan literatur peternakan dan penelusuran referensi internet:\n\n` +
    (snippetSummary ? `${snippetSummary}\n\n` : "") +
    "Dalam praktik peternakan modern, keberhasilan pemeliharaan ditentukan oleh tiga pilar utama: bibit unggul (breeding), nutrisi pakan berimbang (feeding), serta tata laksana manajemen kandang dan kesehatan (management)."
  );
}

export async function sendChatMessage(
  payload: ChatRequestPayload
): Promise<ChatResponsePayload> {
  const env = getServerEnv();
  const internetSources = await gatherInternetSources(payload.query);

  // 1. Coba Gemini API jika GEMINI_API_KEY diatur (Gratis + Google Search Grounding)
  const geminiResult = await tryGeminiApi(
    payload.query,
    internetSources,
    env.GEMINI_API_KEY
  );
  if (geminiResult) {
    const mergedSources = [...geminiResult.extraSources, ...internetSources].slice(
      0,
      4
    );
    return {
      answer: cleanAnswerText(geminiResult.answer),
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: mergedSources,
    };
  }

  // 2. Coba Groq API jika GROQ_API_KEY diatur (Gratis Llama 3.3 70B)
  const groqAnswer = await tryGroqApi(
    payload.query,
    internetSources,
    env.GROQ_API_KEY
  );
  if (groqAnswer) {
    return {
      answer: cleanAnswerText(groqAnswer),
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: internetSources,
    };
  }

  // 3. Coba Free Public AI tanpa perlu API Key
  const publicAiAnswer = await tryFreePublicAi(payload.query, internetSources);
  if (publicAiAnswer) {
    return {
      answer: cleanAnswerText(publicAiAnswer),
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: internetSources,
    };
  }

  // 4. Fallback sintesis langsung dengan hasil pencarian internet
  return {
    answer: synthesizeAnswerWithInternetSources(payload.query, internetSources),
    conversation_id: payload.conversation_id || `conv-${Date.now()}`,
    message_id: `msg-${Date.now()}`,
    sources: internetSources,
  };
}

