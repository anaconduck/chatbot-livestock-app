"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/context";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  CheckCircle,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: name.trim() || user?.full_name || "Pengguna TanyaTernak",
      phone: phone.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formattedJoinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Terdaftar Aktif";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#361D10]">
            Informasi Akun Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A60] mt-1">
            Data identitas dan kontak yang terdaftar saat pembuatan akun TanyaTernak.
          </p>
        </div>

        {saved && (
          <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Perubahan informasi akun berhasil disimpan.</span>
          </div>
        )}

        {/* Ringkasan Data Pendaftaran */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1E8DF] pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF4EB] border border-[#DE992B]/40 text-[#4A2D1B] flex items-center justify-center font-black text-2xl shrink-0">
                {(name || user?.full_name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#361D10]">
                  {name || user?.full_name || "Pengguna TanyaTernak"}
                </h2>
                <p className="text-xs text-[#8C7B71]">
                  {user?.email || "pengguna@tanyaternak.id"}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EA] text-[#2E7D32] text-[10px] font-bold mt-1.5">
                  <Shield className="w-3 h-3" />
                  <span>Akun Pengguna Terverifikasi ({user?.role || "USER"})</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFF8EE] border border-[#F3E2CB] rounded-2xl px-4 py-3 text-xs space-y-1">
              <div className="font-bold text-[#8C5D19] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DE992B]" />
                <span>Keuntungan Akun Login</span>
              </div>
              <p className="text-[11px] text-[#6B5B51]">
                Akses tanya jawab <strong>ChickAI Assistant tanpa batas</strong> (bebas lebih dari 3x chat).
              </p>
            </div>
          </div>

          {/* Kartu Detail Informasi Saat Daftar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-1">
              <span className="text-[11px] font-semibold text-[#8C7B71] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#DE992B]" />
                Nama Lengkap Terdaftar
              </span>
              <p className="text-sm font-bold text-[#361D10]">
                {name || user?.full_name || "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-1">
              <span className="text-[11px] font-semibold text-[#8C7B71] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DE992B]" />
                Alamat Email Aktif
              </span>
              <p className="text-sm font-bold text-[#361D10] break-all">
                {user?.email || "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-1">
              <span className="text-[11px] font-semibold text-[#8C7B71] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#DE992B]" />
                Nomor WhatsApp / Telepon
              </span>
              <p className="text-sm font-bold text-[#361D10]">
                {phone || user?.phone || "Belum dilengkapi"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-1">
              <span className="text-[11px] font-semibold text-[#8C7B71] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#DE992B]" />
                Waktu Pendaftaran
              </span>
              <p className="text-sm font-bold text-[#361D10]">
                {formattedJoinDate}
              </p>
            </div>
          </div>

          {/* Form Edit Data Pendaftaran */}
          <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-[#F1E8DF]">
            <h3 className="text-sm font-bold text-[#361D10]">
              Perbarui Informasi Pendaftaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap sesuai pendaftaran"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">Nomor WhatsApp / Telepon</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#361D10]">Email Terdaftar</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F0EBE3] border border-[#E2D5C7] text-xs sm:text-sm text-[#7A6A60] cursor-not-allowed outline-none"
                />
              </div>
              <p className="text-[10px] text-[#8C7B71]">
                Email terikat langsung dengan akun autentikasi yang didaftarkan.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
