"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth/context";
import { User, Mail, Phone, Shield, Save, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || "Peternak TanyaTernak");
  const [phone, setPhone] = useState(user?.phone || "081234567890");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(null as unknown as boolean), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#361D10]">
            Profil Pengguna
          </h1>
          <p className="text-xs text-[#7A6A60]">
            Kelola data akun dan informasi kontak peternakan Anda.
          </p>
        </div>

        {saved && (
          <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Perubahan profil berhasil disimpan.</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-6">
          <div className="flex items-center gap-4 border-b border-[#F1E8DF] pb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF4EB] border border-[#DE992B]/40 text-[#4A2D1B] flex items-center justify-center font-black text-2xl">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#361D10]">{name}</h2>
              <p className="text-xs text-[#8C7B71]">{user?.email}</p>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF5E5] text-[#8C5D19] text-[10px] font-bold mt-1">
                <Shield className="w-3 h-3 text-[#DE992B]" />
                Role: {user?.role || "USER"}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#361D10]">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#361D10]">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.email || "peternak@tanyaternak.id"}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F0EBE3] border border-[#E2D5C7] text-xs sm:text-sm text-[#7A6A60] cursor-not-allowed outline-none"
                />
              </div>
              <p className="text-[10px] text-[#8C7B71]">
                Email terikat dengan otentikasi Supabase dan tidak dapat diubah langsung.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#361D10]">Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
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
