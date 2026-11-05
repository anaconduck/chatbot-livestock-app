"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import {
  Bot,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-7 sm:pt-9 lg:pt-11 pb-8 sm:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 animate-fade-up">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#361D10] leading-[1.18] tracking-tight">
                Konsultasi & Riset Peternakan Unggas Berbasis{" "}
                <span className="text-[#DE992B]">
                  Dokumen Ilmiah
                </span>
              </h1>

              {/* Mobile Hero Media (Placed directly under title on mobile view) */}
              <div className="lg:hidden relative animate-fade-in my-5">
                <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-lg aspect-4/3 group interactive-card">
                  <Image
                    src="/images/farm/modern-poultry-farm.jpg"
                    alt="Modern Poultry Farm"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-semibold drop-shadow-md">
                    Kandang Closed-House Modern Berstandar Ilmiah
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#6A5A50] leading-relaxed max-w-2xl">
                Tingkatkan efisiensi pakan, kendalikan mikroklimat kandang closed-house,
                dan perkuat biosekuriti peternakan ayam Anda bersama TanyaTernak.
                Didukung repositori jurnal ilmiah dan panduan veteriner terverifikasi.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/chat"
                  className="interactive-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white font-bold text-sm shadow-md active:scale-95"
                >
                  <Bot className="w-5 h-5 text-[#DE992B]" />
                  <span>Mulai Bertanya</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/about"
                  className="interactive-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#DCD0C1] hover:border-[#4A2D1B] text-[#4A2D1B] font-bold text-sm shadow-xs"
                >
                  <span>Pelajari Lebih Lanjut</span>
                </Link>
              </div>
            </div>

            {/* Desktop Right Hero Media */}
            <div className="hidden lg:block lg:col-span-5 relative animate-fade-in lg:mt-2">
              <div className="hidden sm:block absolute -inset-1 bg-gradient-to-r from-[#DE992B]/20 to-[#4A2D1B]/15 rounded-3xl blur-lg opacity-60 pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl aspect-4/3 group interactive-card">
                <Image
                  src="/images/farm/modern-poultry-farm.jpg"
                  alt="Modern Poultry Farm"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold drop-shadow-md">
                  Kandang Closed-House Modern Berstandar Ilmiah
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="pt-10 sm:pt-12 pb-12 sm:pb-14 bg-white/70 border-y border-[#E9DDD0] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4EB] border border-[#F3E2CB] text-[11px] font-bold text-[#966318] uppercase tracking-wider">
                  FITUR UTAMA TANYATERNAK
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#361D10]">
                  Solusi Cerdas untuk Setiap Aspek Peternakan Anda
                </h2>
                <p className="text-sm text-[#6C5D53]">
                  Menggabungkan kapabilitas model RAG modern dengan dokumen keilmuan unggas pilihan.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Reveal delayMs={100}>
                <div className="interactive-card bg-[#FAF7F2] rounded-3xl p-7 border border-[#E8DCCF] shadow-xs space-y-4 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF3D6] text-[#DE992B] border border-[#F3DB9A] flex items-center justify-center shadow-xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#361D10]">
                    Formulasi Nutrisi & Pakan
                  </h3>
                  <p className="text-xs text-[#6B5B51] leading-relaxed">
                    Hitung kebutuhan asam amino, energi metabolis, dan imbangan kalsium-fosfor untuk ayam ras petelur (layer) maupun pedaging (broiler) sesuai fase pertumbuhan.
                  </p>
                </div>
              </Reveal>

              <Reveal delayMs={200}>
                <div className="interactive-card bg-[#FAF7F2] rounded-3xl p-7 border border-[#E8DCCF] shadow-xs space-y-4 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF5EA] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#361D10]">
                    Biosekuriti & Pengendalian Penyakit
                  </h3>
                  <p className="text-xs text-[#6B5B51] leading-relaxed">
                    Panduan sanitasi tiga zona kandang, jadwal vaksinasi berkala, serta identifikasi awal gejala klinis penyakit unggas seperti ND, AI, IB, dan Coryza.
                  </p>
                </div>
              </Reveal>

              <Reveal delayMs={300}>
                <div className="interactive-card bg-[#FAF7F2] rounded-3xl p-7 border border-[#E8DCCF] shadow-xs space-y-4 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0EAE1] text-[#4A2D1B] border border-[#D5C7B7] flex items-center justify-center shadow-xs">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#361D10]">
                    Manajemen Kandang Closed-House
                  </h3>
                  <p className="text-xs text-[#6B5B51] leading-relaxed">
                    Optimalkan kecepatan angin (wind speed), evaporative cooling pad, dan pembuangan gas amonia menggunakan standar mikroklimat tropis Indonesia.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="pt-10 sm:pt-12 pb-8 sm:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14 overflow-hidden">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE8DF] border border-[#DFD3C4] text-[11px] font-bold text-[#6D4226] uppercase tracking-wider">
                ALUR KERJA
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#361D10]">
                Bagaimana TanyaTernak Bekerja
              </h2>
              <p className="text-sm text-[#6C5D53]">
                Tiga langkah mudah untuk mendapatkan insight ilmiah secara instan
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delayMs={100}>
              <div className="interactive-card bg-white rounded-3xl p-7 border border-[#E8DCCF] text-center space-y-4 h-full shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-[#361D10] text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-xs">
                  1
                </div>
                <h4 className="font-bold text-base text-[#361D10]">Ketik Pertanyaan</h4>
                <p className="text-xs text-[#6B5B51] leading-relaxed">
                  Tulis kendala pakan, penurunan produksi, atau ventilasi kandang dalam bahasa sehari-hari.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={200}>
              <div className="interactive-card bg-white rounded-3xl p-7 border border-[#E8DCCF] text-center space-y-4 h-full shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-[#DE992B] text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-xs">
                  2
                </div>
                <h4 className="font-bold text-base text-[#361D10]">Analisis Literatur RAG</h4>
                <p className="text-xs text-[#6B5B51] leading-relaxed">
                  AI mencari dan mencocokkan bab relevan dari puluhan buku dan dokumen ilmiah terindeks.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="interactive-card bg-white rounded-3xl p-7 border border-[#E8DCCF] text-center space-y-4 h-full shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-[#2E7D32] text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-xs">
                  3
                </div>
                <h4 className="font-bold text-base text-[#361D10]">Solusi & Sumber Rujukan</h4>
                <p className="text-xs text-[#6B5B51] leading-relaxed">
                  Terima ringkasan praktis lengkap dengan nomor halaman dan judul referensi aslinya.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
