"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Silakan masukkan email dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);

    const result = await login(email, password, "USER");

    if (!result.success) {
      setErrorMessage(result.error || "Gagal masuk ke akun.");
      setIsLoading(false);
      return;
    }

    // Check if role is admin or user
    const roleCookie = document.cookie
      .split("; ")
      .find(
        (row) =>
          row.startsWith("tanyapeternakan_role=") || row.startsWith("tanyaternak_role=") || row.startsWith("chickyai_role=")
      )
      ?.split("=")[1];

    if (roleCookie === "ADMIN") {
      router.push("/admin");
    } else {
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#EADBCE]/50">
        <Logo />
        <Link
          href="/"
          className="text-xs font-semibold text-[#6C5D53] hover:text-[#4A2D1B]"
        >
          ← Kembali ke Beranda
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#E8DCCF] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Panel */}
          <div className="lg:col-span-6 bg-[#4A2D1B] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF7F2]">
                Platform Riset TanyaPeternakan
              </h2>
              <p className="text-xs sm:text-sm text-[#D8C7B8] leading-relaxed max-w-md">
                Pusat data kecerdasan buatan terpadu untuk monitoring populasi, formulasi nutrisi, dan manajemen kesehatan peternakan ayam.
              </p>
            </div>

            {/* Farm Photo */}
            <div className="my-6 relative aspect-16/11 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
              <Image
                src="/images/farm/modern-poultry-farm.jpg"
                alt="Peternakan Ayam Modern"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="text-[11px] text-[#C4B2A3] flex items-center justify-between pt-2 border-t border-white/10">
              <span>Smart Poultry Farming RAG</span>
              <span>© 2026 TanyaPeternakan</span>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-6 bg-[#FAF7F2]/40 p-8 sm:p-12 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#361D10]">
                Masuk ke TanyaPeternakan
              </h1>
              <p className="text-xs sm:text-sm text-[#736357] leading-relaxed">
                Akses portal operasional agribisnis, riset pakan, dan analitik produksi.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">
                  Email atau Nama Pengguna
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email atau username"
                    required
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none transition-colors shadow-xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#361D10]">Kata Sandi</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#8A796F] hover:text-[#4A2D1B] font-medium"
                  >
                    Lupa Kata Sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none transition-colors shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#8C7B71] hover:text-[#361D10] absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D0C2B4] text-[#4A2D1B] focus:ring-[#4A2D1B]"
                />
                <label htmlFor="remember" className="text-xs text-[#6B5A50] select-none cursor-pointer">
                  Ingat perangkat ini
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Link */}
            <div className="text-center pt-2 border-t border-[#EADBCE]">
              <p className="text-xs text-[#736357]">
                Belum memiliki akun?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#4A2D1B] hover:underline"
                >
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#DE992B]" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
