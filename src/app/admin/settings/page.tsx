"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import { Server, Database, LogOut } from "lucide-react";

export default function AdminSettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A2D1B] text-white text-xs font-semibold"
          >
            <span>Logout</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#361D10]">Pengaturan Sistem TanyaTernak</h1>
          <p className="text-xs text-[#7A6A60]">
            Konfigurasi koneksi Supabase, integrasi Dify RAG, dan parameter keamanan.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#361D10] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#DE992B]" />
              Database Supabase (PostgreSQL)
            </h3>
            <div className="bg-[#FAF7F2] p-4 rounded-2xl text-xs space-y-1.5 text-[#5A483E]">
              <div><strong>Status:</strong> Terkonfigurasi dengan RLS Policy</div>
              <div><strong>Tabel:</strong> profiles, conversations, messages, documents</div>
              <div><strong>Role Security:</strong> Enforcement melalui Service Role & Postgres Trigger</div>
            </div>
          </div>

          <div className="space-y-4 border-t border-[#F1E8DF] pt-4">
            <h3 className="font-bold text-sm text-[#361D10] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#DE992B]" />
              Dify Cloud RAG Ingestion Service
            </h3>
            <div className="bg-[#FAF7F2] p-4 rounded-2xl text-xs space-y-1.5 text-[#5A483E]">
              <div><strong>Status:</strong> Abstraksi Service Siap (Mock Mode Aktif)</div>
              <div><strong>Environment:</strong> DIFY_MOCK_MODE=true</div>
              <div><strong>Dataset:</strong> Standar High Quality Indexing</div>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/admin" className="text-xs font-bold text-[#4A2D1B] hover:underline">
              ← Kembali ke Dashboard Administrator
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
