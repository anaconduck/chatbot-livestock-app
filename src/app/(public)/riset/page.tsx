"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import type { KnowledgeDocument } from "@/types";
import {
  Search,
  Lightbulb,
  BookOpen,
  User,
  ExternalLink,
  Inbox,
  Loader2,
} from "lucide-react";

export default function RisetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hapus sisa data simulasi lama di browser jika ada
    if (typeof window !== "undefined") {
      localStorage.removeItem("tanyaternak_riset_documents");
      const cachedDocs = sessionStorage.getItem("tanyaternak_riset_cache");
      if (cachedDocs) {
        try {
          const parsed = JSON.parse(cachedDocs);
          if (Array.isArray(parsed)) {
            setDocuments(parsed);
            setIsLoading(false);
          }
        } catch {
          // ignore
        }
      }
    }

    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/documents", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.documents)) {
            setDocuments(data.documents);
            if (typeof window !== "undefined") {
              sessionStorage.setItem(
                "tanyaternak_riset_cache",
                JSON.stringify(data.documents)
              );
            }
          }
        }
      } catch {
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredAll = documents.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author &&
        item.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const funFacts = filteredAll.filter((d) => d.content_type === "FUN_FACT");
  const journals = filteredAll.filter((d) => d.content_type !== "FUN_FACT");

  const getCategoryBadgeClass = (category: string, idx: number) => {
    const lower = category.toLowerCase();
    if (lower.includes("penyakit") || lower.includes("vaksin") || lower.includes("kesehatan")) {
      return "bg-[#EAF5EA] text-[#2E7D32] border-[#C8E6C9]";
    }
    if (lower.includes("nutrisi") || lower.includes("pakan")) {
      return "bg-[#FFF3D6] text-[#966318] border-[#F3DB9A]";
    }
    if (lower.includes("kandang") || lower.includes("iot")) {
      return "bg-[#F2E9DF] text-[#4A2D1B] border-[#DFCFC0]";
    }
    const palette = [
      "bg-[#FFF3D6] text-[#966318] border-[#F3DB9A]",
      "bg-[#EAF5EA] text-[#2E7D32] border-[#C8E6C9]",
      "bg-[#F2E9DF] text-[#4A2D1B] border-[#DFCFC0]",
    ];
    return palette[idx % palette.length];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-14 sm:pb-20 space-y-12">
        {/* HEADER SECTION */}
        <Reveal>
          <section className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#361D10] tracking-tight">
              Pusat Riset dan Edukasi
            </h1>

            <p className="text-base sm:text-lg text-[#6C5D53] max-w-3xl leading-relaxed">
              Eksplorasi wawasan biologis (Fun Fact) serta kumpulan referensi jurnal ilmiah terverifikasi untuk mendukung inovasi peternakan modern.
            </p>
          </section>
        </Reveal>

        {/* SEARCH BOX SECTION */}
        <Reveal delayMs={100}>
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[#8A7A70] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik fun fact, judul jurnal, atau penulis..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-[#E2D5C7] text-sm text-[#361D1B] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none shadow-xs"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-3.5 rounded-xl bg-white border border-[#E2D5C7] hover:border-[#4A2D1B] text-[#4A2D1B] text-sm font-semibold transition-all shrink-0 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </section>
        </Reveal>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#6C5D53]">
            <Loader2 className="w-7 h-7 animate-spin text-[#DE992B]" />
            <span className="text-xs font-semibold">
              Memuat konten Riset & Edukasi...
            </span>
          </div>
        ) : (
          <>
            {/* BAGIAN 1: FUN FACT (DENGAN FOTO ATAU TANPA FOTO) */}
            <section className="space-y-6 pt-2">
              <Reveal delayMs={120}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A86F15] mb-1">
                      <Lightbulb className="w-4 h-4 text-[#DE992B]" />
                      WAWASAN BIOLOGIS & FUN FACT
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#361D10]">
                      Tahukah Anda? Fakta Unik Seputar Peternakan
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-[#7A695E]">
                    {funFacts.length} Fun Fact
                  </span>
                </div>
              </Reveal>

              {funFacts.length === 0 ? (
                <div className="bg-[#FFFCF7] rounded-3xl p-10 border border-[#E5D7C6] text-center space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF4EB] text-[#DE992B] flex items-center justify-center mx-auto">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-[#361D10]">
                    Belum Ada Konten Fun Fact
                  </p>
                  <p className="text-xs text-[#8C7A70] max-w-md mx-auto">
                    Konten Fun Fact akan tampil di sini setelah ditambahkan melalui panel Admin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {funFacts.map((fact, idx) => (
                    <Reveal key={fact.id} delayMs={(idx % 3) * 100}>
                      <div
                        className={`interactive-card bg-gradient-to-b from-[#FFFCF7] to-[#FAF4EB]/90 rounded-3xl overflow-hidden border border-[#E2D4C3] hover:border-[#DE992B]/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group ${
                          !fact.image_url ? "border-t-4 border-t-[#DE992B]" : ""
                        }`}
                      >
                        {/* Tampilkan gambar hanya jika Fun Fact memiliki foto */}
                        {fact.image_url && (
                          <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EAE2D7] border-b border-[#E6D8C7]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={fact.image_url}
                              alt={fact.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#361D10]/40 via-transparent to-transparent opacity-60" />
                            <div className="absolute top-3.5 right-3.5">
                              <span className="px-2.5 py-1 rounded-md bg-[#361D10]/90 text-[10px] font-extrabold text-[#FAF7F2] shadow-xs uppercase tracking-wider backdrop-blur-xs">
                                Fun Fact #{String(idx + 1).padStart(2, "0")}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(
                                  fact.category,
                                  idx
                                )}`}
                              >
                                {fact.category}
                              </span>
                              {!fact.image_url && (
                                <span className="px-2 py-0.5 rounded-md bg-[#F2E9DF] text-[10px] font-bold text-[#4A2D1B]">
                                  Fun Fact #{String(idx + 1).padStart(2, "0")}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold text-[#361D10] group-hover:text-[#965A2E] transition-colors leading-snug">
                              {fact.title}
                            </h3>

                            <p className="text-xs text-[#5F4F45] leading-relaxed whitespace-pre-line">
                              {fact.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </section>

            {/* BAGIAN 2: JURNAL ILMIAH (TANPA FOTO, LINK LANGSUNG) */}
            <section className="space-y-6 pt-4">
              <Reveal delayMs={150}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A86F15] mb-1">
                      <BookOpen className="w-4 h-4 text-[#DE992B]" />
                      REFERENSI & PUBLIKASI ILMIAH
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#361D10]">
                      Jurnal Ilmiah Peternakan
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-[#7A695E]">
                    {journals.length} Jurnal Ilmiah
                  </span>
                </div>
              </Reveal>

              {journals.length === 0 ? (
                <div className="bg-[#FFFCF7] rounded-3xl p-10 border border-[#E5D7C6] text-center space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF4EB] text-[#DE992B] flex items-center justify-center mx-auto">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-[#361D10]">
                    Belum Ada Jurnal Ilmiah
                  </p>
                  <p className="text-xs text-[#8C7A70] max-w-md mx-auto">
                    Daftar link jurnal ilmiah akan tampil di sini setelah ditambahkan melalui panel Admin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {journals.map((journal, idx) => (
                    <Reveal key={journal.id} delayMs={(idx % 2) * 100}>
                      <div className="interactive-card bg-[#FFFCF7] rounded-3xl overflow-hidden border border-[#E2D4C3] hover:border-[#DE992B]/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group">
                        <div className="p-6 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF5EA] text-[#2E7D32] border border-[#C8E6C9] text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                                Jurnal Ilmiah
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(
                                  journal.category,
                                  idx
                                )}`}
                              >
                                {journal.category}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-[#361D10] group-hover:text-[#965A2E] transition-colors leading-snug pt-0.5">
                            {journal.title}
                          </h3>

                          <p className="text-xs text-[#5F4F45] leading-relaxed whitespace-pre-line">
                            {journal.description}
                          </p>
                        </div>

                        <div className="px-6 py-3.5 bg-[#F6EFE4] border-t border-[#E6D8C7] flex items-center justify-between gap-3">
                          <div className="text-xs text-[#5A483E] flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-lg bg-[#FFF5E5] border border-[#F3DB9A] flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-[#DE992B]" />
                            </div>
                            <span className="font-semibold truncate">
                              {journal.author || "Tim Riset TanyaTernak"}
                            </span>
                          </div>

                          {journal.source_url && (
                            <a
                              href={journal.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                            >
                              <span>Buka Jurnal</span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#DE992B]" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
