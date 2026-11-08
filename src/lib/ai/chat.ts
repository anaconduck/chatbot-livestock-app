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
 * Bersihkan kata tanya ("apa itu", "bagaimana", dll.) & perbaiki salah ketik umum (misal "boiler" -> "broiler")
 * agar pencarian referensi jurnal & Wikipedia akurat dan tidak melenceng
 */
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
 * Cari referensi artikel berbahasa Indonesia dari Wikipedia API (Gratis & Terfilter Topik Peternakan)
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
    )}&utf8=1&format=json&srlimit=4`;

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
    )}&per-page=5&select=title,doi,primary_location,publication_year,authorships,abstract_inverted_index`;

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

function buildSystemInstruction(sources: ChatSource[] = []): string {
  const sourcesBlock =
    sources.length > 0
      ? `\nKonteks referensi pendukung:\n` +
        sources
          .map(
            (s, i) =>
              `[${i + 1}] Judul: ${s.title} (${s.sourceName || s.url})`
          )
          .join("\n") +
        "\n"
      : "";

  return `Anda adalah ChickAI Assistant, asisten virtual pintar dari platform TanyaTernak (Fakultas Peternakan Universitas Brawijaya).
Tugas Anda adalah menjawab pertanyaan pengguna seputar peternakan secara akurat, jelas, ramah, dan terstruktur dalam Bahasa Indonesia.
${sourcesBlock}
Aturan jawaban:
1. Pahami maksud pertanyaan pengguna secara cerdas meskipun terdapat salah ketik (typo), singkatan, atau bahasa sehari-hari peternak.
2. Langsung jawab inti pertanyaan pengguna di kalimat pertama (misalnya pengertian/definisi langsung, cara mengatasi, atau langkah praktis) sesuai apa yang ditanyakan.
3. Gunakan teks polos yang rapi dengan poin bernomor (1, 2, 3) tanpa simbol bintang markdown (**).
4. JANGAN menyalin atau menuliskan daftar judul jurnal/publikasi di dalam isi teks jawaban, dan JANGAN menuliskan "Referensi Sumber:" di akhir jawaban.
5. Di baris paling akhir setelah jawaban selesai, WAJIB tuliskan satu baris khusus dengan format persis:
[KATA_KUNCI: <2-4 kata kunci ilmiah peternakan yang sudah dikoreksi dari typo>]`;
}

function extractGeminiKeywordAndCleanAnswer(raw: string): {
  cleanAnswer: string;
  correctedKeyword: string | null;
} {
  let correctedKeyword: string | null = null;
  const keywordMatch = raw.match(/\[KATA_KUNCI\s*:\s*([^\]]+)\]/i);
  if (keywordMatch && keywordMatch[1]) {
    correctedKeyword = keywordMatch[1].trim();
  }

  const cleanAnswer = raw
    .replace(/\[KATA_KUNCI\s*:[^\]]*\]/gi, "")
    .replace(
      /\n*(?:Referensi Sumber|Sumber Referensi|Daftar Referensi|Referensi)\s*:[\s\S]*$/i,
      ""
    )
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .trim();

  return { cleanAnswer, correctedKeyword };
}

/**
 * Panggil satu endpoint Gemini secara cepat (tanpa thinking delay)
 */
async function callSingleGeminiEndpoint(
  endpoint: string,
  cleanKey: string,
  query: string
): Promise<{ answer: string; extraSources: ChatSource[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": cleanKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemInstruction() }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: query }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 750,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      throw new Error("Empty response");
    }

    return { answer: text, extraSources: [] };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Google Gemini API — memanggil endpoint tercepat secara paralel
 */
async function tryGeminiApi(
  query: string,
  apiKey: string
): Promise<{ answer: string; extraSources: ChatSource[] } | null> {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey) return null;

  const isVertexExpressKey = cleanKey.startsWith("AQ.");
  const candidates = isVertexExpressKey
    ? [
        callSingleGeminiEndpoint(
          `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.0-flash-001:generateContent?key=${encodeURIComponent(
            cleanKey
          )}`,
          cleanKey,
          query
        ),
        callSingleGeminiEndpoint(
          `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            cleanKey
          )}`,
          cleanKey,
          query
        ),
      ]
    : [
        callSingleGeminiEndpoint(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
            cleanKey
          )}`,
          cleanKey,
          query
        ),
        callSingleGeminiEndpoint(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            cleanKey
          )}`,
          cleanKey,
          query
        ),
      ];

  try {
    return await Promise.any(candidates);
  } catch {
    return null;
  }
}

/**
 * Cadangan lokal apabila GEMINI_API_KEY belum terpasang atau kuota harian habis
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
    q.includes("boiler") ||
    q.includes("pedaging") ||
    q.includes("doc") ||
    q.includes("panen") ||
    q.includes("bobot")
  ) {
    return (
      "Ayam Broiler (sering disebut ayam boiler / ayam ras pedaging) adalah galur ayam hasil seleksi genetik unggul yang memiliki laju pertumbuhan sangat cepat dan efisiensi konversi pakan tinggi sehingga siap dipanen pada umur 28–35 hari.\n\n" +
      "Kunci keberhasilan pemeliharaan ayam broiler meliputi:\n" +
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

  // Jalankan panggilan Google Gemini AI & pencarian referensi internet secara PARALEL (bersamaan)
  const [geminiResult, initialSources] = await Promise.all([
    tryGeminiApi(payload.query, env.GEMINI_API_KEY),
    gatherInternetSources(payload.query),
  ]);

  if (geminiResult) {
    const { cleanAnswer, correctedKeyword } = extractGeminiKeywordAndCleanAnswer(
      geminiResult.answer
    );

    // Jika input pengguna memiliki typo sehingga pencarian awal kurang pas,
    // gunakan kata kunci hasil koreksi Gemini untuk mengambil referensi yang akurat
    let finalSources = initialSources;
    if (
      correctedKeyword &&
      initialSources.length <= 2 &&
      correctedKeyword.toLowerCase() !== normalizeLivestockQuery(payload.query)
    ) {
      const refinedSources = await gatherInternetSources(correctedKeyword);
      if (refinedSources.length > 0) {
        finalSources = refinedSources;
      }
    }

    return {
      answer: cleanAnswer,
      conversation_id: payload.conversation_id || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      sources: [...geminiResult.extraSources, ...finalSources].slice(0, 4),
    };
  }

  // Fallback lokal instan jika GEMINI_API_KEY belum terpasang atau kuota harian habis
  return {
    answer: synthesizeAnswerWithInternetSources(payload.query, initialSources),
    conversation_id: payload.conversation_id || `conv-${Date.now()}`,
    message_id: `msg-${Date.now()}`,
    sources: initialSources,
  };
}

