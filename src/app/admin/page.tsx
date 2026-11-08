"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import {
  ShieldCheck,
  Download,
  Users,
  FileText,
  LogOut,
  BookOpen,
  Layers,
  Lightbulb,
  BarChart3,
  Calendar,
} from "lucide-react";

interface DailyVisitPoint {
  dateKey: string;
  label: string;
  fullDate: string;
  visits: number;
}

const ADMIN_STATS_CACHE_KEY = "tanyaternak_admin_stats_cache";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<{
    totalVisits: number;
    totalDocuments: number;
    funFactsCount: number;
    journalsCount: number;
    totalUsers: number;
    dailyVisits: DailyVisitPoint[];
  }>({
    totalVisits: 0,
    totalDocuments: 0,
    funFactsCount: 0,
    journalsCount: 0,
    totalUsers: 0,
    dailyVisits: [],
  });

  const loadData = async () => {
    try {
      const statsRes = await fetch("/api/admin/stats", { cache: "no-store" });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const nextStats = {
          totalVisits: statsData.totalVisits || 0,
          totalUsers: statsData.totalUsers || 0,
          totalDocuments: statsData.totalDocuments || 0,
          funFactsCount: statsData.funFactsCount || 0,
          journalsCount: statsData.journalsCount || 0,
          dailyVisits: Array.isArray(statsData.dailyVisits)
            ? statsData.dailyVisits
            : [],
        };
        setStats(nextStats);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            ADMIN_STATS_CACHE_KEY,
            JSON.stringify(nextStats)
          );
        }
      }
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(ADMIN_STATS_CACHE_KEY);
      if (cached) {
        try {
          setStats(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    }
    loadData();
  }, []);

  const funFactsCount = stats.funFactsCount;
  const journalsCount = stats.journalsCount;

  const maxDailyVisits = Math.max(
    ...stats.dailyVisits.map((d) => d.visits),
    1
  );
  const totalLast7Days = stats.dailyVisits.reduce(
    (sum, item) => sum + item.visits,
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo href="/admin" />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#361D10]">
                {user?.full_name || "Admin"}
              </span>
              <span className="text-[10px] text-[#2E7D32] font-semibold">
                Verified Administrator
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Logout</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Sub-Navbar / Navigation Tabs */}
      <div className="bg-[#FAF7F2] border-b border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A2D1B] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#DE992B]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#361D10]">
                Panel Pengelola Website
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => loadData()}
              className="px-3 py-2 rounded-xl bg-white border border-[#E2D5C7] text-[#5A483E] hover:border-[#4A2D1B] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#4A2D1B]" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Tab links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto text-xs font-semibold pt-1">
          <Link
            href="/admin"
            className="px-4 py-2.5 border-b-2 border-[#4A2D1B] text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <Layers className="w-4 h-4 text-[#DE992B]" />
            Ringkasan & Statistik
          </Link>
          <Link
            href="/admin/documents"
            className="px-4 py-2.5 text-[#6E5D52] hover:text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            Kelola Konten Riset & Edukasi ({stats.totalDocuments})
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2.5 text-[#6E5D52] hover:text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            Manajemen Pengguna ({stats.totalUsers})
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* STATISTIK PLATFORM SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#361D10]">
              Statistik Platform
            </h2>
            <p className="text-xs text-[#7A6A60]">
              Ringkasan aktivitas pengunjung dan konten platform secara real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-[#E8DCCF] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-[#7A6A60] font-medium">
                  Total Kunjungan Web
                </span>
                <div className="text-2xl font-black text-[#361D10]">
                  {stats.totalVisits.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] font-semibold text-[#8C7B71]">
                  Kunjungan halaman website
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF4EB] text-[#4A2D1B] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E8DCCF] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-[#7A6A60] font-medium">
                  Total Konten Fun Fact
                </span>
                <div className="text-2xl font-black text-[#361D10]">
                  {funFactsCount.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] font-semibold text-[#8C7B71]">
                  Wawasan di [Riset & Edukasi]
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF4EB] text-[#DE992B] flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E8DCCF] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-[#7A6A60] font-medium">
                  Total Jurnal Ilmiah
                </span>
                <div className="text-2xl font-black text-[#361D10]">
                  {journalsCount.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] font-semibold text-[#8C7B71]">
                  Link jurnal di [Riset & Edukasi]
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF4EB] text-[#4A2D1B] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E8DCCF] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-[#7A6A60] font-medium">
                  Total Akun Terdaftar
                </span>
                <div className="text-2xl font-black text-[#361D10]">
                  {stats.totalUsers.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] font-semibold text-[#8C7B71]">
                  Pengguna aktif platform
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF4EB] text-[#4A2D1B] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* GRAFIK KUNJUNGAN PENGUNJUNG PER HARI */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1E8DF] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF4EB] text-[#DE992B] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#361D10]">
                  Grafik Kunjungan Pengunjung per Hari
                </h3>
                <p className="text-xs text-[#7A6A60]">
                  Tren aktivitas pengunjung harian pada website dalam 7 hari terakhir.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] text-xs font-bold text-[#4A2D1B] self-start sm:self-center">
              <Calendar className="w-3.5 h-3.5 text-[#DE992B]" />
              <span>7 Hari Terakhir: {totalLast7Days.toLocaleString("id-ID")} Kunjungan</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 sm:h-64 px-1 sm:px-4 border-b border-[#E8DCCF] pb-3">
              {stats.dailyVisits.map((day, idx) => {
                const heightPercent =
                  day.visits === 0
                    ? 6
                    : Math.max(Math.round((day.visits / maxDailyVisits) * 100), 14);
                const isToday = idx === stats.dailyVisits.length - 1;

                return (
                  <div
                    key={day.dateKey}
                    className="flex flex-col items-center justify-end h-full group"
                    title={`${day.fullDate}: ${day.visits} pengunjung`}
                  >
                    {/* Count Badge */}
                    <span
                      className={`mb-2 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold transition-transform group-hover:-translate-y-0.5 ${
                        isToday
                          ? "bg-[#4A2D1B] text-white"
                          : "bg-[#FAF4EB] text-[#4A2D1B] border border-[#E8DCCF]"
                      }`}
                    >
                      {day.visits}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] h-40 sm:h-48 flex items-end justify-center bg-[#FAF7F2] rounded-xl p-1 border border-[#F1E8DF]">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-lg transition-all duration-500 ${
                          isToday
                            ? "bg-gradient-to-t from-[#4A2D1B] to-[#DE992B] shadow-xs"
                            : "bg-gradient-to-t from-[#8C5D19] to-[#E5A948] opacity-85 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-3 px-1 sm:px-4 text-center">
              {stats.dailyVisits.map((day, idx) => {
                const isToday = idx === stats.dailyVisits.length - 1;
                return (
                  <div
                    key={`label-${day.dateKey}`}
                    className={`text-[10px] sm:text-xs truncate ${
                      isToday
                        ? "font-extrabold text-[#361D10]"
                        : "font-semibold text-[#7A6A60]"
                    }`}
                  >
                    {day.label}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
