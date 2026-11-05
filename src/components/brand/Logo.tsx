import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
  href = "/",
}) => {
  const iconDimensions = {
    sm: { box: "w-8 h-8", img: 32 },
    md: { box: "w-10 h-10", img: 40 },
    lg: { box: "w-14 h-14", img: 56 },
  }[size];

  const textDimensions = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative ${iconDimensions.box} flex items-center justify-center shrink-0`}>
        <Image
          src="/images/logo/logo1.png?v=3"
          alt="TanyaTernak Logo"
          width={iconDimensions.img}
          height={iconDimensions.img}
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      <div className="flex flex-col">
        <span className={`font-extrabold ${textDimensions} tracking-tight text-[#4A2D1B] leading-none`}>
          Tanya<span className="text-[#DE992B]">Ternak</span>
        </span>
        <span className="text-[9px] font-semibold text-[#8C7B71] tracking-widest uppercase mt-0.5">
          Agribisnis Peternakan Cerdas
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-transform hover:scale-[1.02]">
        {content}
      </Link>
    );
  }

  return content;
};
