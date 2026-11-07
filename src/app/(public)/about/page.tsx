import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1">
        {/* HEADER / INTRO */}
        <section className="pt-8 sm:pt-12 pb-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Reveal>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#361D10] leading-tight tracking-tight">
              Tentang TanyaTernak
            </h1>
          </Reveal>

          <Reveal delayMs={100}>
            <p className="text-base sm:text-lg text-[#6C5D53] max-w-2xl mx-auto leading-relaxed">
              Platform informasi dan konsultasi peternakan yang dikembangkan oleh Fakultas Peternakan Universitas Brawijaya (FAPET UB) untuk memudahkan akses referensi ilmiah bagi peternak dan masyarakat.
            </p>
          </Reveal>
        </section>

        {/* NARRATIVE SECTION: LATAR BELAKANG */}
        <section className="py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DCCF] shadow-xs space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#361D10]">
                Latar Belakang
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-[#5A483E] leading-relaxed">
                <p>
                  Banyak hasil penelitian mengenai manajemen pemeliharaan, nutrisi pakan, dan kesehatan ternak diterbitkan dalam bentuk jurnal akademik yang jarang terjangkau langsung oleh peternak maupun pembaca umum. Istilah teknis dan format publikasi ilmiah sering kali menyulitkan pencarian jawaban praktis saat dibutuhkan di lapangan.
                </p>
                <p>
                  Melalui dukungan Program Hibah Fakultas Peternakan Universitas Brawijaya, <strong>TanyaTernak</strong> hadir sebagai jembatan informasi yang menyajikan wawasan singkat (Fun Fact), tautan rujukan jurnal ilmiah, serta asisten tanya-jawab otomatis agar pengetahuan peternakan lebih mudah dipelajari kapan saja.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* VISI & MISI KAMI */}
        <section className="pt-4 pb-14 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visi */}
            <Reveal delayMs={100}>
              <div className="bg-white rounded-3xl p-8 border border-[#E8DCCF] shadow-xs space-y-3 h-full">
                <h3 className="text-xl font-bold text-[#361D10]">Visi</h3>
                <p className="text-sm sm:text-base text-[#5A483E] leading-relaxed">
                  Menjadi media rujukan dan edukasi peternakan berbasis kajian ilmiah yang mudah diakses oleh peternak, mahasiswa, dan masyarakat luas di Indonesia.
                </p>
              </div>
            </Reveal>

            {/* Misi */}
            <Reveal delayMs={200}>
              <div className="bg-white rounded-3xl p-8 border border-[#E8DCCF] shadow-xs space-y-3 h-full">
                <h3 className="text-xl font-bold text-[#361D10]">Misi</h3>
                <ul className="text-sm sm:text-base text-[#5A483E] space-y-2.5 leading-relaxed list-disc pl-5">
                  <li>
                    Menyajikan hasil riset akademis ke dalam bahasa yang ringkas dan mudah dipahami.
                  </li>
                  <li>
                    Menyediakan layanan tanya-jawab seputar manajemen kandang, kesehatan, dan nutrisi pakan.
                  </li>
                  <li>
                    Memperluas penyebaran literatur ilmiah peternakan sebagai bentuk pengabdian kepada masyarakat.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
