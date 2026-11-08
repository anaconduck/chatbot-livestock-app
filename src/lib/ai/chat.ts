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
 * Rekonstruksi abstrak jurnal dari abstract_inverted_index milik OpenAlex
 */
function reconstructOpenAlexAbstract(
  invertedIndex?: Record<string, number[]>
): string {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";
  const wordsByPos: string[] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        wordsByPos[pos] = word;
      }
    }
  }
  const text = wordsByPos.filter(Boolean).join(" ").trim();
  if (text.length <= 280) return text;
  return text.slice(0, 280).replace(/\s+\S*$/, "") + "...";
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
      query.toLowerCase().includes("poultry") ||
      query.toLowerCase().includes("sapi") ||
      query.toLowerCase().includes("kambing")
        ? query
        : `${query} peternakan`;

    const url = `https://api.openalex.org/works?search=${encodeURIComponent(
      searchQuery
    )}&per-page=2&select=title,doi,primary_location,publication_year,authorships,abstract_inverted_index`;

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
          abstract_inverted_index?: Record<string, number[]>;
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
          const abstractText = reconstructOpenAlexAbstract(
            work.abstract_inverted_index
          );

          return {
            title: `${work.title}${year}`,
            author: authorName,
            snippet:
              abstractText ||
              `Publikasi ilmiah oleh ${authorName} pada ${journalName}.`,
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
1. Langsung jawab inti pertanyaan pengguna di kalimat pertama (misalnya pengertian/definisi langsung, cara mengatasi, atau langkah praktis) sesuai apa yang ditanyakan.
2. Gunakan teks polos yang rapi dengan poin bernomor (1, 2, 3) tanpa simbol bintang markdown (**).
3. JANGAN menyalin atau menuliskan daftar judul jurnal/publikasi di dalam isi teks jawaban, dan JANGAN menuliskan "Referensi Sumber:" di akhir jawaban, karena daftar link referensi sudah ditampilkan secara otomatis di bagian khusus di bawah pesan.`;
}

function cleanAnswerText(raw: string): string {
  return raw
    .replace(/\n*(?:Referensi Sumber|Sumber Referensi|Daftar Referensi|Referensi)\s*:[\s\S]*$/i, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .trim();
}

/**
 * Opsi 1: Google Gemini API (Mendukung Google AI Studio Key `AIza...` & Vertex AI Express Mode Key `AQ....`)
 */
async function tryGeminiApi(
  query: string,
  sources: ChatSource[],
  apiKey: string
): Promise<{ answer: string; extraSources: ChatSource[] } | null> {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey) return null;

  const isVertexExpressKey = cleanKey.startsWith("AQ.");
  const endpoints = isVertexExpressKey
    ? [
        `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
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

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 14000);

      const res = await fetch(endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": cleanKey,
        },
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
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 900,
          },
        }),
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text || "")
          .join("")
          .trim() || "";

      if (!text) continue;

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
      continue;
    }
  }

  return null;
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
 * Opsi 3: Layanan AI Publik Gratis Tanpa API Key (Pollinations AI Multi-Endpoint)
 */
async function tryFreePublicAi(
  query: string,
  sources: ChatSource[]
): Promise<string | null> {
  const systemPrompt = buildSystemInstruction(sources);

  // Percobaan 3A: Endpoint OpenAI-compatible POST
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; TanyaTernak/1.0)",
      },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.4,
      }),
    });
    clearTimeout(timeout);

    if (res.ok) {
      const rawText = await res.text();
      try {
        const data = JSON.parse(rawText);
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 25) return content;
      } catch {
        // Jika respons langsung berupa plain text
        if (
          rawText &&
          rawText.trim().length > 25 &&
          !rawText.trim().startsWith("<")
        ) {
          return rawText.trim();
        }
      }
    }
  } catch {
    // lanjut ke percobaan 3B
  }

  // Percobaan 3B: Endpoint Root POST Pollinations
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; TanyaTernak/1.0)",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        model: "openai",
      }),
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = (await res.text()).trim();
      if (text.length > 25 && !text.startsWith("<") && !text.startsWith("{")) {
        return text;
      }
    }
  } catch {
    // lanjut ke fallback
  }

  return null;
}

/**
 * Opsi 4 (Cadangan Otomatis): Jawaban langsung yang komprehensif dan sesuai topik pertanyaan
 */
function synthesizeAnswerWithInternetSources(
  query: string,
  sources: ChatSource[]
): string {
  const q = query.toLowerCase();

  if (
    q.includes("smart poultry") ||
    q.includes("smart farming") ||
    q.includes("iot") ||
    q.includes("internet of things") ||
    q.includes("sensor") ||
    q.includes("otomatis") ||
    q.includes("digital")
  ) {
    return (
      "Smart Poultry (Peternakan Unggas Cerdas) adalah sistem manajemen peternakan modern yang mengintegrasikan teknologi Internet of Things (IoT), sensor otomatis, dan analitik data untuk memantau serta mengendalikan kondisi kandang secara real-time.\n\n" +
      "Komponen dan manfaat utama Smart Poultry meliputi:\n" +
      "1. Pemantauan Mikroklimat Otomatis: Sensor suhu, kelembaban udara (RH), kecepatan angin, dan gas berbahaya (seperti amonia/NH3 dan CO2) terhubung langsung ke sistem kontrol kipas (exhaust fan) dan cooling pad di kandang closed-house.\n" +
      "2. Otomatisasi Pakan & Minum: Distribusi pakan (automatic feeder) dan air minum (nipple drinker) diatur secara presisi sehingga mengurangi pakan tercecer dan memperbaiki rasio konversi pakan (FCR).\n" +
      "3. Deteksi Dini Kesehatan & Performa: Memantau pertambahan bobot badan harian, konsumsi air, serta mendeteksi gejala stres panas (heat stress) atau penyakit lebih cepat melalui dashboard aplikasi.\n" +
      "4. Efisiensi Biaya & Produktivitas: Menurunkan angka kematian (mortalitas) ternak, menghemat tenaga kerja operasional, dan menjaga keseragaman (uniformity) panen."
    );
  }

  if (
    q.includes("pakan") ||
    q.includes("nutrisi") ||
    q.includes("kalsium") ||
    q.includes("protein") ||
    q.includes("ransum") ||
    q.includes("fcr")
  ) {
    return (
      "Manajemen nutrisi dan pakan peternakan berfokus pada keseimbangan antara energi metabolis, protein kasar, asam amino esensial (metionin dan lisin), serta mineral makro-mikro:\n\n" +
      "1. Kebutuhan Protein & Energi: Ayam petelur (layer) fase produksi membutuhkan sekitar 16–18% protein kasar dengan energi metabolis 2.750–2.850 kkal/kg, sedangkan ayam pedaging (broiler) fase starter membutuhkan 21–23% protein kasar dan fase finisher 19–20%.\n" +
      "2. Kalsium & Fosfor: Pada fase produksi telur, kadar kalsium ransum wajib dijaga pada kisaran 3,8–4,2% dengan fosfor tersedia 0,40–0,45% agar kerabang telur kuat dan tidak mudah retak.\n" +
      "3. Efisiensi Pakan (FCR): Pastikan ukuran partikel pakan seragam, tempat pakan tidak terisi terlalu penuh (maksimal 1/3 tinggi tempat pakan), dan air minum bersih selalu tersedia 2 kali lipat konsumsi pakan."
    );
  }

  if (
    q.includes("penyakit") ||
    q.includes("vaksin") ||
    q.includes("biosekuriti") ||
    q.includes("nd") ||
    q.includes("tetelo") ||
    q.includes("flu burung") ||
    q.includes("gumboro") ||
    q.includes("snot") ||
    q.includes("coryza") ||
    q.includes("virus") ||
    q.includes("bakteri") ||
    q.includes("sakit")
  ) {
    return (
      "Pengendalian penyakit dan kesehatan ternak bertumpu pada protokol biosekuriti berjenjang serta program vaksinasi terjadwal:\n\n" +
      "1. Biosekuriti 3 Zona: Pisahkan secara ketat Zona Merah (area luar), Zona Kuning (area transisi/sanitasi kendaraan & petugas), dan Zona Hijau (area kandang produksi).\n" +
      "2. Pencegahan Penyakit Utama (ND/Tetelo, AI/Flu Burung, Gumboro, Coryza/Snot): Lakukan vaksinasi sesuai jadwal umur ternak, desinfeksi rutin kandang, dan terapkan masa istirahat kandang (downtime) minimal 14 hari antar siklus.\n" +
      "3. Penanganan Ternak Sakit: Segera pisahkan ternak yang tampak lesu, nafsu makan turun, atau mengalami gangguan pernapasan ke kandang isolasi, lalu berikan vitamin/elektrolit dan terapi sesuai diagnosis."
    );
  }

  if (
    q.includes("suhu") ||
    q.includes("kandang") ||
    q.includes("closed") ||
    q.includes("amonia") ||
    q.includes("ventilasi") ||
    q.includes("panas") ||
    q.includes("heat stress") ||
    q.includes("brooding")
  ) {
    return (
      "Pengaturan mikroklimat kandang bertujuan menjaga ternak tetap berada pada zona nyaman (thermoneutral zone) agar tidak mengalami cekaman panas (heat stress):\n\n" +
      "1. Suhu Optimal berdasarkan Umur: Fase brooding (DOC umur 1–7 hari) membutuhkan suhu hangat 32–34°C, lalu diturunkan bertahap hingga mencapai suhu nyaman ayam dewasa pada 20–25°C dengan kelembaban relatif (RH) 60–70%.\n" +
      "2. Sirkulasi Udara & Ventilasi: Pada kandang closed-house, gunakan tunnel ventilation dengan kecepatan angin 2,0–2,5 m/detik untuk memberikan efek sejuk (wind chill effect).\n" +
      "3. Pengendalian Gas Amonia: Jaga kadar amonia (NH3) di bawah 20 ppm dengan memastikan sekam (litter) tetap kering, tidak menggumpal, dan tidak ada kebocoran saluran air minum."
    );
  }

  if (
    q.includes("telur") ||
    q.includes("layer") ||
    q.includes("petelur") ||
    q.includes("bertelur")
  ) {
    return (
      "Manajemen ayam petelur (layer) dan kualitas telur sangat dipengaruhi oleh pencahayaan, nutrisi kalsium, dan suhu penyimpanan:\n\n" +
      "1. Program Pencahayaan: Ayam petelur fase produksi membutuhkan total pencahayaan 16 jam per hari (cahaya alami + lampu tambahan) dengan intensitas 10–20 lux untuk merangsang hormon reproduksi pembentuk telur.\n" +
      "2. Kualitas Kerabang & Isi Telur: Berikan asupan kalsium (grit kulit kerang/batu kapur) terutama pada sore hari karena proses pembentukan kerabang berlangsung di malam hari.\n" +
      "3. Penyimpanan Telur: Simpan telur segar dengan posisi ujung tumpul di atas pada suhu 10–18°C dan kelembaban 75–80% agar rongga udara tidak cepat membesar dan kualitas putih/kuning telur tetap terjaga."
    );
  }

  if (
    q.includes("broiler") ||
    q.includes("pedaging") ||
    q.includes("doc") ||
    q.includes("panen") ||
    q.includes("bobot")
  ) {
    return (
      "Pemeliharaan ayam pedaging (broiler) berfokus pada pencapaian bobot panen optimal dan efisiensi konversi pakan (FCR) dalam waktu singkat (28–35 hari):\n\n" +
      "1. Manajemen Fase Starter (Minggu 1–2): Fokus pada keberhasilan brooding (suhu 32–34°C), pencapaian bobot minggu pertama minimal 4,5 kali bobot DOC awal, dan perkembangan saluran pencernaan.\n" +
      "2. Manajemen Kepadatan (Density): Atur kepadatan sekitar 8–10 ekor/m² pada kandang terbuka (open house) atau 14–16 ekor/m² pada kandang tertutup (closed house) agar ruang makan dan oksigen merata.\n" +
      "3. Pemantauan Bobot & FCR: Lakukan penimbangan sampel rutin setiap minggu untuk memastikan keseragaman (uniformity) di atas 80% dan FCR terjaga di kisaran 1,4–1,6."
    );
  }

  if (
    q.includes("sapi") ||
    q.includes("kambing") ||
    q.includes("domba") ||
    q.includes("ruminansia") ||
    q.includes("hijauan") ||
    q.includes("silase") ||
    q.includes("perah")
  ) {
    return (
      "Manajemen pemeliharaan ternak ruminansia (sapi potong, sapi perah, kambing, dan domba) menitikberatkan pada keseimbangan pakan hijauan dan konsentrat serta kesehatan rumen:\n\n" +
      "1. Komposisi Pakan (Hijauan & Konsentrat): Berikan hijauan segar atau silase sebesar 10% dari bobot badan (atau rasio bahan kering 60% hijauan : 40% konsentrat) untuk menjaga aktivitas mikroba rumen.\n" +
      "2. Pengolahan Pakan Awetan: Manfaatkan teknologi silase (fermentasi hijauan anaerob) dan amoniasi/fermentasi jerami agar ketersediaan pakan tetap stabil sepanjang musim kemarau.\n" +
      "3. Kesehatan & Reproduksi: Lakukan pemberian obat cacing berkala setiap 3–4 bulan, perawatan kuku, sanitasi kandang, serta deteksi birahi tepat waktu untuk keberhasilan Inseminasi Buatan (IB)."
    );
  }

  if (
    q.includes("welfare") ||
    q.includes("kesejahteraan") ||
    q.includes("stres") ||
    q.includes("perilaku")
  ) {
    return (
      "Kesejahteraan hewan (Animal Welfare) dalam peternakan modern mengacu pada prinsip Lima Kebebasan (Five Freedoms) untuk menjamin ternak hidup sehat dan produktif:\n\n" +
      "1. Bebas dari Lapar & Haus: Akses mudah terhadap air minum bersih dan pakan bernutrisi seimbang setiap saat.\n" +
      "2. Bebas dari Ketidaknyamanan Lingkungan: Kandang memiliki suhu, kelembaban, ventilasi, dan alas (litter) yang nyaman serta ruang gerak yang proporsional.\n" +
      "3. Bebas dari Rasa Sakit, Cedera, Penyakit & Stres: Penanganan ternak dilakukan secara tenang (low-stress handling) sejak pemeliharaan hingga pemanenan, disertai pencegahan penyakit yang terukur."
    );
  }

  // Cek apakah ada ringkasan ensiklopedia/ilmiah dari Wikipedia atau abstrak yang bisa dirangkum secara natural
  const wikiSource = sources.find(
    (s) => s.sourceName === "id.wikipedia.org" && s.snippet && s.snippet.length > 40
  );
  if (wikiSource) {
    return (
      `${wikiSource.snippet}\n\n` +
      "Dalam konteks agribisnis dan peternakan modern, penerapan prinsip ini dikombinasikan dengan manajemen bibit unggul (breeding), formulasi nutrisi berimbang (feeding), serta pengendalian lingkungan kandang dan kesehatan ternak (management) untuk menghasilkan produktivitas yang optimal."
    );
  }

  return (
    `Dalam dunia peternakan modern, topik mengenai "${query}" berkaitan erat dengan upaya meningkatkan efisiensi produksi, kesehatan ternak, dan keberlanjutan usaha peternakan.\n\n` +
    "Secara praktis, penerapannya mencakup tiga aspek utama:\n" +
    "1. Manajemen Pemeliharaan & Lingkungan (Management): Menjaga kondisi mikroklimat kandang (suhu, kelembaban, dan sirkulasi udara) serta kebersihan sanitasi agar ternak bebas dari stres.\n" +
    "2. Nutrisi & Efisiensi Pakan (Feeding): Menyediakan pakan dengan kandungan protein, energi, vitamin, dan mineral yang sesuai dengan fase pertumbuhan atau produksi ternak.\n" +
    "3. Kesehatan & Biosekuriti (Health): Menerapkan pencegahan penyakit melalui biosekuriti terpadu, vaksinasi tepat jadwal, dan pemantauan kondisi harian ternak."
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

