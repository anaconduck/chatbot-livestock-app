import React from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_TEAM } from "@/lib/mock-data";
import {
  Cpu,
  GraduationCap,
  Microscope,
  FlaskConical,
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
        <section className="pt-8 sm:pt-12 pb-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE8DF] border border-[#DFD3C4] text-[11px] font-bold text-[#6D4226] tracking-wider uppercase">
            <GraduationCap className="w-3.5 h-3.5 text-[#DE992B]" />
            Program Riset & Hilirisasi FAPET UB
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#361D10] leading-tight tracking-tight max-w-4xl mx-auto">
            Menghubungkan Riset Akademis dengan Peternak Unggas Indonesia
          </h1>

          <p className="text-base sm:text-lg text-[#6C5D53] max-w-3xl mx-auto leading-relaxed">
            TanyaTernak adalah inisiatif berbasis sains dan kecerdasan buatan (AI) terapan yang dikembangkan oleh Fakultas Peternakan Universitas Brawijaya untuk mentransformasikan literatur ilmiah menjadi solusi nyata di lapangan.
          </p>
        </section>

        {/* NARRATIVE SECTION: LATAR BELAKANG & CERITA KAMI */}
        <section className="py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </section>

        {/* VISI & MISI KAMI */}
        <section className="py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visi */}
            <div className="bg-white rounded-3xl p-8 border border-[#E8DCCF] shadow-xs space-y-4 flex flex-col justify-between">
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

            {/* Misi */}
            <div className="bg-white rounded-3xl p-8 border border-[#E8DCCF] shadow-xs space-y-4 flex flex-col justify-between">
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
          </div>
        </section>

        {/* TIM RISET & DEWAN PAKAR */}
        <section className="pt-6 pb-8 sm:pb-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DE992B] block">
              Kolaborator Ahli
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#361D10]">
              Tim Riset & Dewan Pakar
            </h2>
            <p className="text-xs sm:text-sm text-[#6C5D53] max-w-xl mx-auto">
              Didukung oleh akademisi dan praktisi veteriner Fakultas Peternakan Universitas Brawijaya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TEAM.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#E8DCCF] shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-[#EAE2D7]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/95 text-[10px] font-extrabold tracking-wider text-[#4A2D1B] shadow-sm uppercase">
                      {member.specialtyBadge}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-[#361D10] leading-snug">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#DE992B]">
                      {member.role}
                    </p>
                    <p className="text-xs text-[#6C5D53] leading-relaxed pt-2">
                      {member.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F1E8DF] flex items-center justify-between text-xs text-[#5B4C42]">
                    <span className="font-medium">{member.achievement}</span>
                    {member.specialtyBadge.includes("KESEHATAN") && (
                      <Microscope className="w-4 h-4 text-[#DE992B]" />
                    )}
                    {member.specialtyBadge.includes("NUTRISI") && (
                      <FlaskConical className="w-4 h-4 text-[#DE992B]" />
                    )}
                    {member.specialtyBadge.includes("SISTEM") && (
                      <Cpu className="w-4 h-4 text-[#DE992B]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
