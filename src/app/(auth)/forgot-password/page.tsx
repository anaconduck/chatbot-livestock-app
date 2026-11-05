"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#EADBCE]/50">
        <Logo />
        <Link href="/login" className="text-xs font-semibold text-[#6C5D53] hover:text-[#4A2D1B]">
          ← Kembali ke Login
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-lg p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#361D10]">Lupa Kata Sandi?</h1>
            <p className="text-xs text-[#736357] leading-relaxed">
              Masukkan email yang terdaftar pada akun TanyaTernak Anda. Kami akan mengirimkan tautan pemulihan kata sandi.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Email Pemulihan Terkirim</span>
              </div>
              <p>
                Silakan periksa kotak masuk atau folder spam di <strong>{email}</strong> untuk mengatur ulang kata sandi Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Kirim Tautan Pemulihan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#EADBCE]">
            <Link href="/login" className="text-xs font-bold text-[#4A2D1B] hover:underline">
              Sudah ingat kata sandi? Masuk di sini
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
