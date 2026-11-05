"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#EADBCE]/50">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-lg p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#361D10]">Atur Ulang Kata Sandi</h1>
            <p className="text-xs text-[#736357]">
              Masukkan kata sandi baru untuk akun TanyaTernak Anda.
            </p>
          </div>

          {success ? (
            <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] p-4 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Kata sandi berhasil diperbarui! Mengalihkan ke login...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#8C7B71] absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    required
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Simpan Kata Sandi Baru</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
