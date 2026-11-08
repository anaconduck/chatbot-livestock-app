import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import {
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1">
        {/* EDITORIAL HEADER / INTRO */}
        <section className="pt-6 sm:pt-10 pb-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE8DF] border border-[#DFD3C4] text-[11px] font-bold text-[#6D4226] tracking-wider uppercase">
              <GraduationCap className="w-3.5 h-3.5 text-[#DE992B]" />
              Program Riset & Hilirisasi FAPET UB
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#361D10] leading-tight tracking-tight max-w-4xl mx-auto">
              Menghubungkan Riset Akademis dengan Peternak Unggas Indonesia
            </h1>
          </Reveal>

          <Reveal delayMs={200}>
            <p className="text-base sm:text-lg text-[#6C5D53] max-w-3xl mx-auto leading-relaxed">
              TanyaTernak adalah inisiatif berbasis sains dan kecerdasan buatan (AI) terapan yang dikembangkan oleh Fakultas Peternakan Universitas Brawijaya untuk mentransformasikan literatur ilmiah menjadi solusi nyata di lapangan.
            </p>
          </Reveal>
        </section>

        {/* NARRATIVE SECTION: LATAR BELAKANG & CERITA KAMI */}
        <section className="py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DCCF] shadow-xs space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#DE992B] block">
                  Latar Belakang
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#361D10]">
                  Mengapa TanyaTernak Didirikan?
                </h2>
              </div>

              <div className="space-y-5 text-sm sm:text-base text-[#5A483E] leading-relaxed">
                <p>
                  Industri peternakan unggas nasional menghadapi berbagai dinamika kritis: fluktuasi harga dan ketersediaan bahan baku pakan, tantangan biosekuriti terhadap penyakit endemik, serta penyesuaian iklim mikro kandang tropis. Di sisi lain, perguruan tinggi dan lembaga penelitian terus memproduksi ratusan publikasi ilmiah, data empiris, dan pedoman teknis yang teruji di laboratorium.
                </p>
                <p>
                  Sayangnya, sebagian besar hasil penelitian tersebut tersimpan dalam bentuk jurnal ilmiah yang menggunakan terminologi kompleks dan sulit diakses dengan cepat oleh para peternak saat mengambil keputusan di kandang. Kesenjangan komunikasi antara laboratorium riset dan peternak rakyat menjadi alasan utama lahirnya platform <strong>TanyaTernak</strong>.
                </p>
                <p>
                  Didanai melalui Program HIBAH Fakultas Peternakan Universitas Brawijaya (FAPET UB), kami merancang sistem asisten virtual cerdas berbasis <em>Retrieval-Augmented Generation</em> (RAG) yang mampu memahami pertanyaan peternak sehari-hari dan merujuk langsung ke dokumen riset ilmiah yang terverifikasi dan peer-reviewed.
                </p>
              </div>

              {/* In-text Stats / Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F1E8DF]">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <div className="text-2xl font-black text-[#361D10]">100%</div>
                  <div className="text-xs font-semibold text-[#7A6A60] mt-1">
                    Literatur Ilmiah Peer-Reviewed
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <div className="text-2xl font-black text-[#361D10]">3 Zona</div>
                  <div className="text-xs font-semibold text-[#7A6A60] mt-1">
                    Standar Protokol Biosekuriti
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <div className="text-2xl font-black text-[#361D10]">FAPET UB</div>
                  <div className="text-xs font-semibold text-[#7A6A60] mt-1">
                    Didukung Dewan Pakar & Peneliti
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* VISI & MISI KAMI */}
        <section className="pt-6 pb-14 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visi */}
            <Reveal delayMs={100}>
              <div className="bg-white rounded-3xl p-8 border border-[#E8DCCF] shadow-xs space-y-4 flex flex-col justify-between h-full interactive-card">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF5E5] text-[#DE992B] flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#361D10]">Visi Kami</h3>
                  <p className="text-sm text-[#5A483E] leading-relaxed">
                    Menjadi pusat rujukan riset dan ekosistem kecerdasan buatan terapan perunggasan yang inklusif di Indonesia, guna mewujudkan kemandirian pangan dan efisiensi budidaya unggas yang berkelanjutan berbasis sains.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#F1E8DF] text-xs font-bold text-[#DE992B]">
                  Inovasi Berkelanjutan
                </div>
              </div>
            </Reveal>

            {/* Misi */}
            <Reveal delayMs={200}>
              <div className="bg-white rounded-3xl p-8 border border-[#E8DCCF] shadow-xs space-y-4 flex flex-col justify-between h-full interactive-card">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF5EA] text-[#2E7D32] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#361D10]">Misi Kami</h3>
                  <ul className="text-sm text-[#5A483E] space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span>Hilirisasi riset akademis ke dalam format praktis siap guna bagi peternak.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span>Penyediaan asisten cerdas 24/7 untuk diagnosa awal manajemen & nutrisi pakan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span>Mendukung gerakan Diktisaintek Berdampak melalui pengabdian masyarakat nyata.</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#F1E8DF] text-xs font-bold text-[#2E7D32]">
                  Dampak Nyata Lapangan
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
