"use client";

import React, { useEffect, useState } from "react";
import type { KnowledgeDocument } from "@/types";
import {
  X,
  FileText,
  ExternalLink,
  Download,
  CheckCircle2,
  Layers,
  Calendar,
  User,
  HardDrive,
  Loader2,
  BookOpen,
} from "lucide-react";

interface PdfPreviewModalProps {
  document: KnowledgeDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  document: doc,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"viewer" | "details">("viewer");
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [prevDocId, setPrevDocId] = useState<string | null>(null);

  // Sync state when doc changes during render
  if (doc && doc.id !== prevDocId) {
    setPrevDocId(doc.id);
    setIsLoadingPdf(true);
    setActiveTab("viewer");
  }

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;

  // Determine preview URL
  const previewUrl =
    doc.storage_path &&
    (doc.storage_path.startsWith("http") || doc.storage_path.startsWith("/"))
      ? doc.storage_path
      : "/docs/sample-riset-fapet.pdf";

  const fileSizeMb = (
    Number(doc.file_size_bytes || 2.5 * 1024 * 1024) /
    (1024 * 1024)
  ).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E8DCCF]">
        {/* Header Bar */}
        <header className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DCCF] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[#361D10] truncate">
                  {doc.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF5E5] text-[#8C5D19] font-bold text-[10px] border border-[#F5E2C5]">
                  {doc.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {doc.status}
                </span>
              </div>
              <p className="text-xs text-[#8C7A70] truncate mt-0.5">
                {doc.author || "Fakultas Peternakan UB"} • {doc.publication_year || 2025} • {fileSizeMb} MB
              </p>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-white rounded-xl border border-[#E2D5C7] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("viewer")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "viewer"
                    ? "bg-[#4A2D1B] text-white shadow-xs"
                    : "text-[#6A5A50] hover:text-[#361D10]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Pratinjau PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "details"
                    ? "bg-[#4A2D1B] text-white shadow-xs"
                    : "text-[#6A5A50] hover:text-[#361D10]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Detail Riset</span>
              </button>
            </div>

            {/* External link / open in new tab */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#6A5A50] hover:text-[#361D10] hover:bg-white rounded-xl border border-transparent hover:border-[#E2D5C7] transition-all"
              title="Buka PDF di Tab Baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Direct download */}
            <a
              href={previewUrl}
              download={doc.original_filename || doc.title}
              className="p-2 text-[#6A5A50] hover:text-[#361D10] hover:bg-white rounded-xl border border-transparent hover:border-[#E2D5C7] transition-all"
              title="Unduh Berkas PDF"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#6A5A50] hover:text-[#361D10] hover:bg-white rounded-xl border border-transparent hover:border-[#E2D5C7] transition-all ml-1"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 relative bg-[#525659] overflow-hidden">
          {activeTab === "viewer" ? (
            <div className="w-full h-full relative">
              {isLoadingPdf && (
                <div className="absolute inset-0 bg-[#FAF7F2] flex flex-col items-center justify-center gap-3 z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-[#DE992B]" />
                  <p className="text-xs font-semibold text-[#6C5D53]">
                    Menyiapkan pratinjau dokumen ilmiah...
                  </p>
                </div>
              )}

              <iframe
                src={`${previewUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={`Pratinjau PDF - ${doc.title}`}
                onLoad={() => setIsLoadingPdf(false)}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-[#FAF7F2] p-6 sm:p-10 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCF] shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#966318] bg-[#FFF5E5] px-2.5 py-1 rounded-md border border-[#F5E2C5]">
                    Metadata Riset Ilmiah
                  </span>
                  <h2 className="text-xl font-bold text-[#361D10] mt-3">
                    {doc.title}
                  </h2>
                </div>

                {/* Deskripsi / Abstrak */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#361D10] uppercase tracking-wide">
                    Abstrak / Deskripsi Dokumen
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6C5D53] leading-relaxed bg-[#FAF7F2] p-4 rounded-xl border border-[#EADBCE]">
                    {doc.description || "Tidak ada deskripsi tambahan untuk dokumen ini."}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]">
                    <User className="w-4 h-4 text-[#8C7A70]" />
                    <div>
                      <div className="text-[10px] text-[#8C7A70] uppercase font-bold">Penulis / Tim Riset</div>
                      <div className="text-xs font-bold text-[#361D10]">{doc.author || "Fakultas Peternakan UB"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]">
                    <Calendar className="w-4 h-4 text-[#8C7A70]" />
                    <div>
                      <div className="text-[10px] text-[#8C7A70] uppercase font-bold">Tahun Publikasi</div>
                      <div className="text-xs font-bold text-[#361D10]">{doc.publication_year || 2025}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]">
                    <Layers className="w-4 h-4 text-[#8C7A70]" />
                    <div>
                      <div className="text-[10px] text-[#8C7A70] uppercase font-bold">Kategori Domain</div>
                      <div className="text-xs font-bold text-[#361D10]">{doc.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]">
                    <HardDrive className="w-4 h-4 text-[#8C7A70]" />
                    <div>
                      <div className="text-[10px] text-[#8C7A70] uppercase font-bold">Ukuran File</div>
                      <div className="text-xs font-bold text-[#361D10]">{fileSizeMb} MB</div>
                    </div>
                  </div>
                </div>

                {/* Dify / RAG status banner */}
                <div className="p-4 rounded-xl bg-[#FAF4EB] border border-[#EADBCE] text-xs text-[#5C3E28] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Terhubung ke Knowledge Base ChickAI
                  </div>
                  <p className="text-[11px] text-[#7A6A60]">
                    Dokumen ini telah diindeks dan siap dirujuk oleh asisten virtual cerdas dalam sesi konsultasi peternak.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <footer className="px-6 py-2.5 bg-[#FAF7F2] border-t border-[#E8DCCF] flex items-center justify-between text-[11px] text-[#8C7A70] shrink-0">
          <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D5C7B8] font-mono text-[10px]">Esc</kbd> untuk keluar</span>
          <span>TanyaTernak Repositori Ilmiah FAPET UB</span>
        </footer>
      </div>
    </div>
  );
};
