"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 sm:pt-14 lg:pt-16 pb-12 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#361D10] leading-[1.15] tracking-tight">
                Konsultasi & Riset Peternakan Unggas Berbasis{" "}
                <span className="text-[#DE992B]">
                  Dokumen Ilmiah
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#6A5A50] leading-relaxed max-w-2xl">
                Tingkatkan efisiensi pakan, kendalikan mikroklimat kandang closed-house,
                dan perkuat biosekuriti peternakan ayam Anda bersama TanyaPeternakan.
                Didukung repositori jurnal ilmiah dan panduan veteriner terverifikasi.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  <Bot className="w-5 h-5 text-[#DE992B]" />
                  <span>Mulai Bertanya</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-[#DCD0C1] hover:border-[#4A2D1B] text-[#4A2D1B] font-bold text-sm shadow-xs transition-all"
                >
                  <span>Pelajari Lebih Lanjut</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative -mt-6 sm:-mt-10 lg:-mt-14">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl aspect-4/3 group">
                <Image
                  src="/images/farm/modern-poultry-farm.jpg"
                  alt="Modern Poultry Farm"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-16 bg-white/70 border-y border-[#E9DDD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4EB] border border-[#F3E2CB] text-[11px] font-bold text-[#966318] uppercase">
                FITUR UTAMA TANYAPETERNAKAN
              </div>
              <h2 className="text-3xl font-extrabold text-[#361D10]">
                Solusi Cerdas untuk Setiap Aspek Peternakan Anda
              </h2>
              <p className="text-sm text-[#6C5D53]">
                Menggabungkan kapabilitas model RAG modern dengan dokumen keilmuan unggas pilihan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-2xl p-7 border border-[#E8DCCF] shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF3D6] text-[#DE992B] border border-[#F3DB9A] flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#361D10]">
                  Formulasi Nutrisi & Pakan
                </h3>
                <p className="text-xs text-[#6B5B51] leading-relaxed">
                  Hitung kebutuhan asam amino, energi metabolis, dan imbangan kalsium-fosfor untuk ayam ras petelur (layer) maupun pedaging (broiler) sesuai fase pertumbuhan.
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-2xl p-7 border border-[#E8DCCF] shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#EAF5EA] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#361D10]">
                  Biosekuriti & Pengendalian Penyakit
                </h3>
                <p className="text-xs text-[#6B5B51] leading-relaxed">
                  Panduan sanitasi tiga zona kandang, jadwal vaksinasi berkala, serta identifikasi awal gejala klinis penyakit unggas seperti ND, AI, IB, dan Coryza.
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-2xl p-7 border border-[#E8DCCF] shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] text-[#4A2D1B] border border-[#D5C7B7] flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#361D10]">
                  Manajemen Kandang Closed-House
                </h3>
                <p className="text-xs text-[#6B5B51] leading-relaxed">
                  Optimalkan kecepatan angin (wind speed), evaporative cooling pad, dan pembuangan gas amonia menggunakan standar mikroklimat tropis Indonesia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE8DF] border border-[#DFD3C4] text-[11px] font-bold text-[#6D4226] uppercase">
              ALUR KERJA
            </div>
            <h2 className="text-3xl font-extrabold text-[#361D10]">
              Bagaimana TanyaPeternakan Bekerja
            </h2>
            <p className="text-sm text-[#6C5D53]">
              Tiga langkah mudah untuk mendapatkan insight ilmiah secara instan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#361D10] text-white font-bold text-base flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-base text-[#361D10]">Ketik Pertanyaan</h4>
              <p className="text-xs text-[#6B5B51] leading-relaxed">
                Tulis kendala pakan, penurunan produksi, atau ventilasi kandang dalam bahasa sehari-hari.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#DE992B] text-white font-bold text-base flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-base text-[#361D10]">Analisis Literatur RAG</h4>
              <p className="text-xs text-[#6B5B51] leading-relaxed">
                AI mencari dan mencocokkan bab relevan dari puluhan buku dan dokumen ilmiah terindeks.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#2E7D32] text-white font-bold text-base flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-base text-[#361D10]">Solusi & Sumber Rujukan</h4>
              <p className="text-xs text-[#6B5B51] leading-relaxed">
                Terima ringkasan praktis lengkap dengan nomor halaman dan judul referensi aslinya.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
