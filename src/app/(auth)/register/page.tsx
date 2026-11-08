"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import { registerSchema } from "@/lib/validation/auth";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleRegister = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    const result = await loginWithGoogle("/");
    if (!result.success) {
      setErrorMessage(
        result.error || "Gagal menghubungkan ke Google Sign-In."
      );
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side schema validation using Zod
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || "Data formulir belum valid.");
      return;
    }

    setIsLoading(true);

    const result = await register({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (!result.success) {
      setErrorMessage(result.error || "Pendaftaran gagal. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }

    setSuccessMessage("Pendaftaran berhasil! Mengalihkan ke informasi akun...");
    setTimeout(() => {
      router.push("/profile");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#EADBCE]/50">
        <Logo />
        <Link
          href="/"
          className="text-xs font-semibold text-[#6C5D53] hover:text-[#4A2D1B] transition-colors"
        >
          ← Kembali ke Beranda
        </Link>
      </header>

      {/* Register Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E8DCCF] shadow-lg p-7 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#361D10]">
              Daftar Akun TanyaTernak
            </h1>
            <p className="text-xs text-[#7A6A60]">
              Mulai akses panduan cerdas dan dokumentasi peternakan ayam berbasis data empiris.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tombol Daftar / Masuk dengan Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E2D5C7] hover:border-[#4A2D1B] disabled:opacity-60 text-[#361D10] font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#DE992B]" />
                <span>Menghubungkan ke Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Daftar dengan Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#E8DCCF]" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#8C7B71] whitespace-nowrap">
              atau daftar dengan formulir email
            </span>
            <div className="w-full border-t border-[#E8DCCF]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#361D10]">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-[#8C7A70]">Sesuai identitas KTP/Institusi</span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Tuliskan Nama"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email & Phone in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">
                  Email Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Tuliskan Email"
                    required
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">
                  Nomor WhatsApp/Telepon <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Tuliskan Nomer WhatsApp/Telepon"
                    required
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 8 karakter kustom"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none transition-colors"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">
                  Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="Ulangi kata sandi"
                    required
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#F3AC3C] hover:bg-[#E59E2E] disabled:opacity-60 text-[#361D10] font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#361D10]" />
                  <span>Membuat Akun...</span>
                </>
              ) : (
                <>
                  <span>Buat Akun TanyaTernak</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Already Have Account */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#736357]">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-bold text-[#361D10] hover:underline inline-flex items-center gap-1"
              >
                <span>Masuk di sini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
