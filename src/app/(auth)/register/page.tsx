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
  const { register } = useAuth();

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

    setSuccessMessage("Pendaftaran berhasil! Mengalihkan ke dashboard...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#EADBCE]/50">
        <div className="flex items-center gap-4">
          <Logo />
          <div className="h-6 w-[1px] bg-[#DCD0C1]" />
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold text-[#6C5D53] hover:text-[#4A2D1B]"
        >
          Sudah terdaftar? Masuk
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
