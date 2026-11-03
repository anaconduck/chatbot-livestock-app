"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import type { KnowledgeDocument } from "@/types";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  X,
  UploadCloud,
  LogOut,
  Layers,
  Users,
  Inbox,
  Loader2,
} from "lucide-react";
import { PdfPreviewModal } from "@/components/admin/PdfPreviewModal";

export default function AdminDocumentsPage() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // PDF Preview State
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState("Nutrisi Pakan");
  const [description, setDescription] = useState("");

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/admin/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Gagal memuat dokumen:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formattedTitle = title.endsWith(".pdf") ? title : `${title.replace(/\s+/g, "_")}.pdf`;
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formattedTitle,
          author: author || user?.full_name || "Admin TanyaPeternakan",
          publication_year: parseInt(year, 10) || new Date().getFullYear(),
          category,
          description: description || "Dokumen teknis terverifikasi untuk peternakan unggas.",
          original_filename: formattedTitle,
        }),
      });

      if (res.ok) {
        setNotification(`Dokumen "${title}" berhasil ditambahkan ke database.`);
        setIsModalOpen(false);
        setTitle("");
        setAuthor("");
        setDescription("");
        await loadDocuments();
      } else {
        const err = await res.json();
        alert(`Gagal menambahkan dokumen: ${err.error || "Terjadi kesalahan"}`);
      }
    } catch (err: any) {
      alert(`Gagal: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini dari database?")) return;

    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setNotification("Dokumen berhasil dihapus dari database.");
        setTimeout(() => setNotification(null), 3000);
      } else {
        const err = await res.json();
        alert(`Gagal menghapus: ${err.error || "Terjadi kesalahan"}`);
      }
    } catch (err: any) {
      alert(`Gagal: ${err?.message}`);
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
          <Logo />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#361D10]">{user?.full_name || "Admin"}</span>
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
            Ringkasan & Upload Riset
          </Link>
          <Link
            href="/admin/documents"
            className="px-4 py-2.5 border-b-2 border-[#4A2D1B] text-[#4A2D1B] flex items-center gap-2 whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-[#DE992B]" />
            Repositori Dokumen ({documents.length})
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
              Arsip & Manajemen Dokumen RAG
            </h1>
            <p className="text-xs text-[#7A6A60]">
              Kelola status berkas riset ilmiah di database Supabase yang dijadikan referensi chatbot TanyaPeternakan.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2D1B] hover:bg-[#361D10] text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#DE992B]" />
            <span>Tambah Dokumen Baru</span>
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
              Total {filtered.length} dokumen tersimpan
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#7A6A60] font-bold uppercase tracking-wider border-y border-[#E8DCCF]">
                <tr>
                  <th className="py-3 px-4">Judul Dokumen</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Penulis</th>
                  <th className="py-3 px-3">Ukuran</th>
                  <th className="py-3 px-3">Tanggal Dibuat</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E8DF]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#7A6A60]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#DE992B]" />
                        <span>Memuat data dari database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#DE992B] flex items-center justify-center">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[#361D10]">
                            Belum Ada Dokumen Riset
                          </p>
                          <p className="text-xs text-[#8C7A70] max-w-sm mx-auto">
                            Tabel dokumen di database Supabase Anda saat ini kosong. Klik tombol &quot;Tambah Dokumen Baru&quot; di atas untuk memasukkan dokumen pertama.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#361D10]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="truncate max-w-xs">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#FFF5E5] text-[#8C5D19] font-semibold text-[11px]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-[#5A4B42]">
                        <div>{doc.author || "Anonim"}</div>
                        <div className="text-[10px] text-[#8C7B71]">{doc.publication_year || 2025}</div>
                      </td>
                      <td className="py-4 px-3 text-[#6A5A50]">
                        {(Number(doc.file_size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </td>
                      <td className="py-4 px-3 text-[#7A6A60]">
                        {new Date(doc.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDoc(doc);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#4A2D1B] hover:text-[#DE992B] hover:bg-[#FAF4EB] transition-colors"
                            title="Pratinjau PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Upload PDF Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#E8DCCF] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1E8DF] pb-3">
              <h3 className="text-lg font-bold text-[#361D10] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#DE992B]" />
                Upload Dokumen PDF Riset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C7B71] hover:text-[#361D10]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#361D10]">Judul Dokumen *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Manajemen Biosekuriti Kandang Broiler"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#361D10]">Penulis / Instansi</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama Penulis / Lab"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#361D10]">Tahun Terbit</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2025"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#361D10]">Kategori *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                >
                  <option value="Nutrisi Pakan">Nutrisi Pakan</option>
                  <option value="Penyakit & Vaksinasi">Penyakit & Vaksinasi</option>
                  <option value="Manajemen Kandang">Manajemen Kandang</option>
                  <option value="Ekonomi & Pemasaran">Ekonomi & Pemasaran</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#361D10]">Abstrak / Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ringkasan isi dokumen atau metodologi riset..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D5C7] text-xs text-[#361D10] outline-none"
                />
              </div>

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
                      <span>Simpan Dokumen</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App PDF Preview Modal */}
      <PdfPreviewModal
        document={previewDoc}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDoc(null);
        }}
      />
    </div>
  );
}
