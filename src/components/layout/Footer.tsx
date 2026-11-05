import React from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#EFEAE2] border-t border-[#E3D9CC] py-6 sm:py-7 text-sm text-[#736357]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Left Side: 3 Logos & Grant Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
          {/* 3 Logos: TanyaTernak, Universitas Brawijaya, Diktisaintek - Exact Matched Sizing */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Logo TanyaTernak (Tight crop: 1047x1019) */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex items-center justify-center">
              <Image
                src="/images/logo/logo1-tight.png"
                alt="Logo TanyaTernak"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>

            {/* Logo Universitas Brawijaya (1149x1155) */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex items-center justify-center">
              <Image
                src="/images/logo/universitas-brawijaya.svg"
                alt="Logo Universitas Brawijaya"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>

            {/* Logo Diktisaintek (Tight crop: 159x160) */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex items-center justify-center">
              <Image
                src="/images/logo/diktisaintek-tight.png"
                alt="Logo Diktisaintek"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-10 w-[1px] bg-[#D6CABE]" />

          {/* Grant & Collaboration Details */}
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-[#361D10] tracking-wide">
              Program Hibah Fakultas Peternakan Universitas Brawijaya (FAPET UB)
            </p>
            <p className="text-[11px] sm:text-xs text-[#7A6A5E] leading-relaxed">
              Hilirisasi Riset Ilmiah & Kecerdasan Buatan (AI) Terapan untuk Agribisnis Peternakan
            </p>
            <p className="text-[11px] text-[#8A7A6E]">
              © 2026 TanyaTernak. Didukung oleh Kemdiktisaintek & Fakultas Peternakan Universitas Brawijaya.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
