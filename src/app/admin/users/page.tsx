"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import {
  Users,
  Search,
  CheckCircle,
  LogOut,
  Layers,
  FileText,
  Shield,
  ShieldCheck,
  Download,
  Loader2,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

export default function AdminUsersPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = data.users || [];
        setUsers(list);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("tanyaternak_admin_users_cache", JSON.stringify(list));
        }
      }
    } catch (err) {
      console.error("Gagal memuat pengguna:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("tanyaternak_admin_users_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
            setIsLoading(false);
          }
        } catch {
          // ignore
        }
      }
    }
    loadUsers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextIsActive = currentStatus !== "Aktif";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: nextIsActive }),
      });

      if (res.ok) {
        const nextStatus = nextIsActive ? "Aktif" : "Nonaktif";
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
        );
        toast.success(`Status pengguna diubah ke ${nextStatus}.`);
        setActionNotice(`Status pengguna berhasil diperbarui ke ${nextStatus}.`);
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        const err = await res.json();
        toast.error(`Gagal: ${err.error || "Terjadi kesalahan"}`);
      }
    } catch (err: any) {
      toast.error(`Gagal memperbarui status: ${err?.message}`);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
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
              onClick={() => loadUsers()}
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
            className="px-4 py-2.5 text-[#6E5D52] hover:text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <Layers className="w-4 h-4" />
            Ringkasan & Statistik
          </Link>
          <Link
            href="/admin/documents"
            className="px-4 py-2.5 text-[#6E5D52] hover:text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            Kelola Konten Riset & Edukasi
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2.5 border-b-2 border-[#4A2D1B] text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <Users className="w-4 h-4 text-[#DE992B]" />
            Manajemen Pengguna ({users.length})
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {actionNotice && (
          <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#361D10]">Manajemen Akun Terdaftar</h1>
            <p className="text-xs text-[#7A6A60]">
              Daftar pengguna yang telah terdaftar pada platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C7B71] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email..."
                className="pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E2D5C7] text-xs text-[#361D10] focus:border-[#4A2D1B] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#7A6A60] font-bold uppercase tracking-wider border-y border-[#E8DCCF]">
                <tr>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Peran / Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Tanggal Bergabung</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E8DF]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skeleton-user-${idx}`} className="animate-pulse">
                      <td className="py-4 px-4 flex items-center gap-2.5">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="space-y-1.5 flex-1 max-w-xs">
                          <Skeleton className={`h-4 ${idx % 2 === 0 ? "w-36" : "w-28"}`} />
                          <Skeleton className="h-2.5 w-20 sm:hidden" />
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-3.5 w-24" />
                      </td>
                      <td className="py-4 px-3 text-right">
                        <Skeleton className="w-20 h-7 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#DE992B] flex items-center justify-center">
                          <UserCheck className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[#361D10]">Belum Ada Pengguna</p>
                          <p className="text-xs text-[#8C7A70]">
                            Data profil pengguna masih kosong.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#361D10] flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF4EB] border border-[#E2D5C7] text-[#4A2D1B] flex items-center justify-center font-bold text-xs uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-4 px-3 text-[#6A5A50]">{u.email}</td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.role === "Admin"
                              ? "bg-[#FFF5E5] text-[#8C5D19] border border-[#F3E2CB]"
                              : "bg-[#EBF3FF] text-[#1E56A0] border border-[#C5DCFF]"
                          }`}
                        >
                          {u.role === "Admin" && <Shield className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.status === "Aktif"
                              ? "bg-[#EAF5EA] text-[#2E7D32]"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          ● {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-[#7A6A60]">{u.joinDate}</td>
                      <td className="py-4 px-3 text-right">
                        <button
                          onClick={() => toggleStatus(u.id, u.status)}
                          className="px-2.5 py-1 rounded-lg border border-[#E2D5C7] hover:border-[#4A2D1B] text-[11px] font-semibold text-[#5A483E] transition-colors"
                        >
                          {u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
