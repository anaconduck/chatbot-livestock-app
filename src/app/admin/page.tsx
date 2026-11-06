"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import type { ContentType, KnowledgeDocument } from "@/types";
import {
  ShieldCheck,
  Download,
  Users,
  UploadCloud,
  FileText,
  LogOut,
  CheckCircle,
  BookOpen,
  Layers,
  Loader2,
  Trash2,
  Lightbulb,
  Link2,
  Image as ImageIcon,
  ExternalLink,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const LOCAL_RISET_DOCS_KEY = "tanyaternak_riset_documents";

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 900;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca berkas gambar"));
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalDocuments: 0,
    totalUsers: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Content Form State: FUN_FACT vs JURNAL
  const [contentType, setContentType] = useState<ContentType>("FUN_FACT");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Fisiologi Unggas");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Image state (ONLY for FUN_FACT, optional)
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");

  const loadData = async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch("/api/admin/documents", { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" }),
      ]);

      let loadedDocs: KnowledgeDocument[] = [];
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        loadedDocs = docsData.documents || [];
        setDocuments(loadedDocs);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          ...statsData,
          totalDocuments: loadedDocs.length,
        });
      }
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
    }
  };

  useEffect(() => {
    // Bersihkan cache simulasi lama jika ada
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_RISET_DOCS_KEY);
    }
    loadData();
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setImagePreview(compressedDataUrl);
      setImageFileName(file.name);
    } catch {
      toast.error("Gagal memproses gambar yang dipilih.");
    }
  };

  const clearSelectedImage = () => {
    setImagePreview(null);
    setImageFileName("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isSubmitting) return;

    if (contentType === "JURNAL" && !sourceUrl.trim()) {
      toast.error("Link jurnal ilmiah wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          title: title.trim(),
          category,
          description: description.trim(),
          author:
            contentType === "JURNAL"
              ? author.trim() || "Tim Riset TanyaTernak"
              : null,
          source_url: contentType === "JURNAL" ? sourceUrl.trim() : null,
          image_url: contentType === "FUN_FACT" ? imagePreview : null,
        }),
      });

      if (res.ok) {
        const label = contentType === "FUN_FACT" ? "Fun Fact" : "Jurnal Ilmiah";
        toast.success(
          `${label} "${title}" berhasil ditambahkan ke [Riset & Edukasi].`
        );
        setUploadSuccess(
          `${label} "${title}" berhasil disimpan ke database dan tampil di menu [Riset & Edukasi].`
        );
        setTitle("");
        setDescription("");
        setAuthor("");
        setSourceUrl("");
        clearSelectedImage();
        await loadData();
      } else {
        const err = await res.json();
        toast.error(`Gagal menyimpan: ${err.error || "Terjadi kesalahan"}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Koneksi terputus";
      toast.error(`Gagal menyimpan: ${message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadSuccess(null), 5000);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        toast.success("Konten berhasil dihapus dari [Riset & Edukasi].");
      } else {
        const err = await res.json();
        toast.error(`Gagal menghapus: ${err.error || "Terjadi kesalahan"}`);
      }
    } catch {
      toast.error("Gagal menghapus konten.");
    }
  };

  const funFactsCount = documents.filter(
    (d) => d.content_type === "FUN_FACT"
  ).length;
  const journalsCount = documents.filter(
    (d) => d.content_type !== "FUN_FACT"
  ).length;

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
              className="px-3 py-2 rounded-xl bg-white border border-[#E2D5C7] text-[#5A483E] hover:border-[#4A2D1B] flex items-center gap-1.5 font-medium transition-colors"
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
            Input Konten [Riset & Edukasi]
          </Link>
          <Link
            href="/admin/documents"
            className="px-4 py-2.5 text-[#6E5D52] hover:text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            Kelola Konten Riset & Edukasi ({documents.length})
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {uploadSuccess && (
          <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* STATISTIK PLATFORM SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#361D10]">
              Statistik Platform
            </h2>
            <p className="text-xs text-[#7A6A60]">
              Data real-time dari tabel database Supabase Anda.
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
                  Tercatat via Supabase
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

        {/* FORM INPUT KONTEN [RISET & EDUKASI]: FUN FACT vs JURNAL ILMIAH */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1E8DF] pb-5">
            <div>
              <h3 className="text-lg font-bold text-[#361D10]">
                Tambah Konten ke Menu [Riset & Edukasi]
              </h3>
              <p className="text-xs text-[#7A6A60]">
                Pilih jenis konten: <strong>Fun Fact</strong> (dengan opsi upload gambar atau tanpa foto) atau <strong>Jurnal Ilmiah</strong> (menggunakan link langsung tanpa foto/dokumen).
              </p>
            </div>

            {/* Selector: Fun Fact vs Jurnal Ilmiah */}
            <div className="inline-flex p-1 rounded-2xl bg-[#FAF7F2] border border-[#E2D5C7] self-start sm:self-center">
              <button
                type="button"
                onClick={() => setContentType("FUN_FACT")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  contentType === "FUN_FACT"
                    ? "bg-[#4A2D1B] text-white shadow-xs"
                    : "text-[#6E5D52] hover:text-[#361D10]"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#DE992B]" />
                <span>Upload Fun Fact</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType("JURNAL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  contentType === "JURNAL"
                    ? "bg-[#4A2D1B] text-white shadow-xs"
                    : "text-[#6E5D52] hover:text-[#361D10]"
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-[#DE992B]" />
                <span>Jurnal Ilmiah (Link)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Judul */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">
                  {contentType === "FUN_FACT"
                    ? "Judul Fun Fact"
                    : "Judul Jurnal Ilmiah"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    contentType === "FUN_FACT"
                      ? "Contoh: Pengaruh Spektrum Cahaya terhadap Siklus Bertelur"
                      : "Contoh: Optimasi Formulasi Pakan Layer Fase Puncak"
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#361D10]">
                  Kategori Topik <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                >
                  <option value="Fisiologi Unggas">Fisiologi Unggas</option>
                  <option value="Nutrisi & Pakan">Nutrisi & Pakan</option>
                  <option value="Penyakit & Vaksinasi">Penyakit & Vaksinasi</option>
                  <option value="Manajemen Kandang">Manajemen Kandang</option>
                  <option value="Kognisi & Perilaku">Kognisi & Perilaku</option>
                  <option value="Smart Poultry IoT">Smart Poultry IoT</option>
                </select>
              </div>
            </div>

            {/* Field khusus JURNAL ILMIAH: Link Langsung & Penulis */}
            {contentType === "JURNAL" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#361D10]">
                    Link Jurnal Langsung (URL) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-[#8C7B71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://jurnal.ub.ac.id/... atau https://doi.org/..."
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#361D10]">
                    Penulis / Sumber Jurnal
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Contoh: Dr. Ir. S. Hartono, M.Sc / FAPET UB"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Deskripsi / Isi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#361D10]">
                {contentType === "FUN_FACT"
                  ? "Isi / Penjelasan Fun Fact"
                  : "Ringkasan / Abstrak Jurnal"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder={
                  contentType === "FUN_FACT"
                    ? "Tuliskan fakta unik atau penjelasan biologis seputar ayam..."
                    : "Tuliskan ringkasan atau abstrak singkat dari jurnal ilmiah..."
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs sm:text-sm text-[#361D10] focus:border-[#4A2D1B] outline-none"
              />
            </div>

            {/* Field khusus FUN FACT: Upload Gambar (Opsional, bisa dengan gambar atau tanpa foto) */}
            {contentType === "FUN_FACT" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#361D10]">
                    Gambar / Foto Fun Fact (Opsional — Kosongkan jika Tanpa Foto)
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hapus Gambar (Jadikan Tanpa Foto)</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <div
                  onClick={() => imageInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-2.5 cursor-pointer transition-all ${
                    imagePreview
                      ? "border-[#2E7D32] bg-[#EAF5EA]/30"
                      : "border-[#E2D5C7] hover:border-[#DE992B] bg-[#FAF7F2]/50 hover:bg-[#FAF4EB]/60"
                  }`}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview Fun Fact"
                        className="h-32 w-auto mx-auto rounded-xl object-cover border border-[#E8DCCF] shadow-xs"
                      />
                      <p className="text-xs font-bold text-[#2E7D32]">
                        {imageFileName || "Gambar terpilih"} • Klik untuk mengganti
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-[#FAF4EB] border border-[#E8DCCF] flex items-center justify-center text-[#DE992B]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs sm:text-sm text-[#361D10]">
                          Klik untuk memilih gambar ilustrasi Fun Fact
                        </p>
                        <p className="text-[11px] text-[#7A6A60]">
                          Format JPG, PNG, WebP • Lewati bagian ini jika ingin Fun Fact tampil <strong>tanpa foto</strong>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!title.trim() || !description.trim() || isSubmitting}
                className="px-7 py-3 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#DE992B]" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-[#DE992B]" />
                    <span>
                      {contentType === "FUN_FACT"
                        ? "Simpan Fun Fact ke [Riset & Edukasi]"
                        : "Simpan Jurnal Ilmiah ke [Riset & Edukasi]"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* DAFTAR KONTEN AKTIF DI MENU [RISET & EDUKASI] */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1E8DF] pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#361D10]">
                Konten Aktif di Menu [Riset & Edukasi] ({documents.length})
              </h3>
              <p className="text-xs text-[#7A6A60]">
                Daftar Fun Fact dan Jurnal Ilmiah yang saat ini tersimpan di database Supabase.
              </p>
            </div>
            <Link
              href="/admin/documents"
              className="text-xs font-bold text-[#DE992B] hover:underline"
            >
              Kelola Semua →
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#8C7A70]">
              Belum ada konten di database. Gunakan formulir di atas untuk menambahkan Fun Fact atau Jurnal Ilmiah.
            </div>
          ) : (
            <div className="divide-y divide-[#F1E8DF]">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          doc.content_type === "FUN_FACT"
                            ? "bg-[#FFF5E5] text-[#8C5D19]"
                            : "bg-[#EBF3FF] text-[#1E56A0]"
                        }`}
                      >
                        {doc.content_type === "FUN_FACT"
                          ? doc.image_url
                            ? "Fun Fact (Dengan Foto)"
                            : "Fun Fact (Tanpa Foto)"
                          : "Jurnal Ilmiah (Link)"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF4EB] text-[#6E5D52] text-[10px] font-semibold">
                        {doc.category}
                      </span>
                      {doc.source_url && (
                        <a
                          href={doc.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#DE992B] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Buka Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#361D10] truncate">
                      {doc.title}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                    title="Hapus Konten"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
