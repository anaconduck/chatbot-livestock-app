"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Silakan lengkapi email dan kata sandi administrator.");
      return;
    }

    setIsLoading(true);

    // Call login with requiredRole = 'ADMIN'
    const result = await login(email, password, "ADMIN");

    if (!result.success) {
      setErrorMessage(result.error || "Akun ini tidak memiliki akses administrator.");
      setIsLoading(false);
      return;
    }

    // Verified admin -> redirect to /admin
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC]">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E3D7C9]">
        <Logo />
        <Link
          href="/login"
          className="text-xs font-semibold text-[#6C5D53] hover:text-[#4A2D1B]"
        >
          Masuk Portal Peternak →
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#DFD3C5] shadow-xl p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#4E2E1E] text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7 text-[#DE992B]" />
            </div>
            <h1 className="text-2xl font-black text-[#361D10]">
              Portal Administrator
            </h1>
            <p className="text-xs text-[#736357]">
              Manajemen dokumen riset ilmiah, basis pengetahuan, dan akun pengguna TanyaTernak.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#361D10]">Email Administrator</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tanyaternak.id"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#FAF7F2] border border-[#DFD3C5] text-xs sm:text-sm text-[#361D10] focus:border-[#4E2E1E] focus:bg-white outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#361D10]">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FAF7F2] border border-[#DFD3C5] text-xs sm:text-sm text-[#361D10] focus:border-[#4E2E1E] focus:bg-white outline-none transition-colors"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#4E2E1E] hover:bg-[#382112] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#DE992B]" />
                  <span>Verifikasi Hak Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk sebagai Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#EADBCE]">
            <p className="text-[11px] text-[#8C7B71]">
              Akses halaman ini diproteksi ketat oleh otorisasi role database PostgreSQL.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
