"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import type { ContentType, KnowledgeDocument } from "@/types";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  X,
  UploadCloud,
  LogOut,
  Layers,
  Users,
  Inbox,
  Loader2,
  Lightbulb,
  Link2,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";

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

export default function AdminDocumentsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [contentType, setContentType] = useState<ContentType>("FUN_FACT");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState("Fisiologi Unggas");
  const [description, setDescription] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/admin/documents", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Gagal memuat konten:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file);
      setImagePreview(compressed);
    } catch {
      toast.error("Gagal memproses gambar.");
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isSubmitting) return;

    if (contentType === "JURNAL" && !sourceUrl.trim()) {
      toast.error("Link jurnal wajib diisi.");
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
        toast.success(`Konten "${title}" berhasil ditambahkan ke [Riset & Edukasi].`);
        setNotification(
          `Konten "${title}" berhasil disimpan ke database [Riset & Edukasi].`
        );
        setIsModalOpen(false);
        setTitle("");
        setAuthor("");
        setSourceUrl("");
        setDescription("");
        setImagePreview(null);
        await loadDocuments();
      } else {
        const err = await res.json();
        toast.error(
          `Gagal menambahkan konten: ${err.error || "Terjadi kesalahan"}`
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus konten ini dari database [Riset & Edukasi]?"
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        toast.success("Konten berhasil dihapus dari [Riset & Edukasi].");
        setNotification("Konten berhasil dihapus dari [Riset & Edukasi].");
        setTimeout(() => setNotification(null), 3000);
      } else {
        const err = await res.json();
        toast.error(`Gagal menghapus: ${err.error || "Terjadi kesalahan"}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    }
  };

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()) ||
      (d.author && d.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo href="/admin" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#361D10]">
              {user?.full_name || "Admin"}
            </span>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A2D1B] text-white text-xs font-semibold"
            >
              <span>Logout</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#FAF7F2] border-b border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto text-xs font-semibold pt-2">
          <Link
            href="/admin"
            className="px-4 py-2.5 text-[#6E5D52] hover:text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <Layers className="w-4 h-4" />
            Ringkasan & Statistik
          </Link>
          <Link
            href="/admin/documents"
            className="px-4 py-2.5 border-b-2 border-[#4A2D1B] text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-[#DE992B]" />
            Kelola Konten Riset & Edukasi ({documents.length})
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2.5 text-[#6E5D52] hover:text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            Manajemen Pengguna
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {notification && (
          <div className="bg-[#EAF5EA] border border-[#BDE3BF] text-[#2E7D32] px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#361D10]">
              Kelola Konten [Riset & Edukasi]
            </h1>
            <p className="text-xs text-[#7A6A60]">
              Daftar seluruh Fun Fact dan Jurnal Ilmiah yang tampil pada halaman Riset & Edukasi.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2D1B] hover:bg-[#361D10] text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#DE992B]" />
            <span>Tambah Konten Baru</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DCCF] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C7B71] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul, kategori, atau penulis..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] focus:border-[#4A2D1B] outline-none"
              />
            </div>

            <div className="text-xs text-[#7A6A60] font-medium">
              Total {filtered.length} konten di database
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#7A6A60] font-bold uppercase tracking-wider border-y border-[#E8DCCF]">
                <tr>
                  <th className="py-3 px-4">Judul Konten</th>
                  <th className="py-3 px-3">Jenis Konten</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Detail / Link</th>
                  <th className="py-3 px-3">Tanggal Dibuat</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E8DF]">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`skeleton-doc-${idx}`} className="animate-pulse">
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-4 px-3">
                        <Skeleton className="h-3.5 w-20" />
                      </td>
                      <td className="py-4 px-3 text-right">
                        <Skeleton className="w-7 h-7 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#DE992B] flex items-center justify-center">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[#361D10]">
                            Belum Ada Konten Riset & Edukasi
                          </p>
                          <p className="text-xs text-[#8C7A70] max-w-sm mx-auto">
                            Tabel database Anda saat ini kosong. Klik &quot;Tambah Konten Baru&quot; untuk menambahkan Fun Fact atau Jurnal Ilmiah.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-[#361D10]">
                        <div className="flex items-center gap-2">
                          {doc.content_type === "FUN_FACT" ? (
                            <Lightbulb className="w-4 h-4 text-[#DE992B] shrink-0" />
                          ) : (
                            <Link2 className="w-4 h-4 text-[#4A2D1B] shrink-0" />
                          )}
                          <span className="truncate max-w-xs">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            doc.content_type === "FUN_FACT"
                              ? "bg-[#FFF5E5] text-[#8C5D19]"
                              : "bg-[#EBF3FF] text-[#1E56A0]"
                          }`}
                        >
                          {doc.content_type === "FUN_FACT"
                            ? doc.image_url
                              ? "Fun Fact (Bergambar)"
                              : "Fun Fact (Tanpa Foto)"
                            : "Jurnal Ilmiah"}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF4EB] text-[#6E5D52] font-semibold text-[11px]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-[#5A4B42]">
                        {doc.content_type === "FUN_FACT" ? (
                          <span>
                            {doc.image_url ? "Memiliki Foto" : "Tanpa Foto"}
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <div>{doc.author || "Tim Riset TanyaTernak"}</div>
                            {doc.source_url && (
                              <a
                                href={doc.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[#DE992B] hover:underline inline-flex items-center gap-1"
                              >
                                <span>Buka Jurnal</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-3 text-[#7A6A60]">
                        {new Date(doc.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#E8DCCF] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1E8DF] pb-3">
              <h3 className="text-lg font-bold text-[#361D10] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#DE992B]" />
                Tambah Konten [Riset & Edukasi]
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C7B71] hover:text-[#361D10]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#FAF7F2] border border-[#E2D5C7]">
              <button
                type="button"
                onClick={() => setContentType("FUN_FACT")}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  contentType === "FUN_FACT"
                    ? "bg-[#4A2D1B] text-white"
                    : "text-[#6E5D52]"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#DE992B]" />
                <span>Fun Fact</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType("JURNAL")}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  contentType === "JURNAL"
                    ? "bg-[#4A2D1B] text-white"
                    : "text-[#6E5D52]"
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-[#DE992B]" />
                <span>Jurnal Ilmiah</span>
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#361D10]">
                  {contentType === "FUN_FACT"
                    ? "Judul Fun Fact *"
                    : "Judul Jurnal Ilmiah *"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tuliskan judul..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#361D10]">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                >
                  <option value="Fisiologi Unggas">Fisiologi Unggas</option>
                  <option value="Nutrisi & Pakan">Nutrisi & Pakan</option>
                  <option value="Penyakit & Vaksinasi">Penyakit & Vaksinasi</option>
                  <option value="Manajemen Kandang">Manajemen Kandang</option>
                  <option value="Kognisi & Perilaku">Kognisi & Perilaku</option>
                  <option value="Smart Poultry IoT">Smart Poultry IoT</option>
                </select>
              </div>

              {contentType === "JURNAL" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#361D10]">
                      Link Jurnal Langsung (URL) *
                    </label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://jurnal.ub.ac.id/..."
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#361D10]">
                      Penulis / Instansi
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Nama Penulis / Lab"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#361D10]">
                  {contentType === "FUN_FACT"
                    ? "Isi Fun Fact *"
                    : "Ringkasan / Abstrak Jurnal *"}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Tuliskan penjelasan atau ringkasan..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                />
              </div>

              {contentType === "FUN_FACT" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#361D10]">
                      Gambar Fun Fact (Opsional — Kosongkan jika Tanpa Foto)
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Hapus Gambar
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
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#E2D5C7] hover:border-[#DE992B] bg-[#FAF7F2] text-xs font-semibold text-[#4A2D1B] flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-[#DE992B]" />
                    <span>
                      {imagePreview
                        ? "Ganti Gambar Terpilih"
                        : "Pilih Gambar (Opsional)"}
                    </span>
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1E8DF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E5D52] hover:bg-[#FAF7F2]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#4A2D1B] hover:bg-[#361D10] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-[#DE992B]" />
                      <span>Simpan ke [Riset & Edukasi]</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
