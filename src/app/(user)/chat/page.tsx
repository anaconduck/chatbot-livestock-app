"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import type { ChatMessage } from "@/types";
import {
  Send,
  RotateCcw,
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Loader2,
  Menu,
  X,
  ArrowLeft,
  LogIn,
  ExternalLink,
} from "lucide-react";

const MAX_GUEST_CHATS = 3;
const GUEST_CHAT_STORAGE_KEY = "tanyaternak_guest_quota_v2";
const GUEST_QUOTA_RESET_MS = 24 * 60 * 60 * 1000; // 24 jam

function readGuestQuota(): number {
  if (typeof window === "undefined") return 0;
  localStorage.removeItem("tanyaternak_guest_chat_count");
  const raw = localStorage.getItem(GUEST_CHAT_STORAGE_KEY);
  if (!raw) return 0;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      const count = Number(parsed.count) || 0;
      const resetAt = Number(parsed.resetAt) || 0;
      if (resetAt > 0 && Date.now() >= resetAt) {
        localStorage.removeItem(GUEST_CHAT_STORAGE_KEY);
        return 0;
      }
      return Math.max(0, count);
    }
    if (typeof parsed === "number" && parsed > 0) {
      const migrated = {
        count: parsed,
        resetAt: Date.now() + GUEST_QUOTA_RESET_MS,
      };
      localStorage.setItem(GUEST_CHAT_STORAGE_KEY, JSON.stringify(migrated));
      return parsed;
    }
  } catch {
    localStorage.removeItem(GUEST_CHAT_STORAGE_KEY);
  }
  return 0;
}

function saveGuestQuota(nextCount: number): void {
  if (typeof window === "undefined") return;
  let resetAt = Date.now() + GUEST_QUOTA_RESET_MS;
  try {
    const existingRaw = localStorage.getItem(GUEST_CHAT_STORAGE_KEY);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      if (
        existing?.resetAt &&
        Date.now() < existing.resetAt &&
        nextCount < MAX_GUEST_CHATS
      ) {
        resetAt = existing.resetAt;
      }
    }
  } catch {
    // Gunakan resetAt 24 jam dari sekarang
  }
  localStorage.setItem(
    GUEST_CHAT_STORAGE_KEY,
    JSON.stringify({ count: nextCount, resetAt })
  );
}

function ChatInner() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guestChatCount, setGuestChatCount] = useState(0);
  const [conversationId, setConversationId] = useState<string>("c-1");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greeting",
      conversation_id: "c-1",
      role: "assistant",
      content:
        "Hai 👋 Selamat datang di ChickAI Assistant!\n\nSaya asisten virtual cerdas TanyaTernak, siap membantu menjawab pertanyaan mengenai riset dan agribisnis peternakan unggas berdasarkan literatur ilmiah terverifikasi.\n\nSilakan tanyakan apa saja yang ingin Anda ketahui.",
      created_at: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGuestChatCount(readGuestQuota());
    const interval = setInterval(() => {
      setGuestChatCount(readGuestQuota());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isGuestLimitReached = !user && guestChatCount >= MAX_GUEST_CHATS;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (!user && guestChatCount >= MAX_GUEST_CHATS) {
      setInput("");
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          conversation_id: conversationId,
          role: "user",
          content: text,
          created_at: new Date().toISOString(),
        },
        {
          id: `limit-${Date.now()}`,
          conversation_id: conversationId,
          role: "assistant",
          content:
            "Anda telah mencapai batas maksimal 3 kali chat tanpa login. Silakan masuk (login) sebagai pengguna untuk melanjutkan pertanyaan ke-4 dan berkonsultasi tanpa batas.",
          created_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    if (!user) {
      const currentCount = readGuestQuota();
      const nextCount = currentCount + 1;
      setGuestChatCount(nextCount);
      saveGuestQuota(nextCount);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      conversation_id: conversationId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          conversation_id: conversationId,
          user: user?.id || "peternak_demo",
        }),
      });

      const data = await res.json();

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: data.conversation_id || conversationId,
        role: "assistant",
        content: data.answer || "Maaf, belum dapat menghasilkan respon.",
        sources: data.sources || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          conversation_id: conversationId,
          role: "assistant",
          content:
            "Terjadi kendala koneksi ke server. Mohon pastikan koneksi backend aktif.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    const newId = `c-${Date.now()}`;
    setConversationId(newId);
    setMessages([
      {
        id: `greeting-${newId}`,
        conversation_id: newId,
        role: "assistant",
        content:
          "Hai 👋 Selamat datang di ChickAI Assistant!\n\nSaya asisten virtual cerdas TanyaTernak, siap membantu menjawab pertanyaan mengenai peternakan ayam berdasarkan dokumen terverifikasi.\n\nSilakan tanyakan apa saja yang ingin Anda ketahui.",
        created_at: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAF7F2] overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-[#E8DCCF] px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-[#4A2D1B] hover:bg-[#FAF7F2]"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Logo size="sm" />
          <div className="h-4 w-[1px] bg-[#E8DCCF] hidden sm:block" />
          <span className="text-xs font-semibold text-[#8C7B71] hidden sm:flex items-center gap-1.5">
            <span>Ruang Konsultasi AI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DE992B]/15 text-[#966318] border border-[#DE992B]/30 font-bold uppercase">
              Tanya AI
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2D5C7] text-xs font-semibold text-[#5A483E] hover:border-[#4A2D1B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali ke</span> Beranda
          </Link>
        </div>
      </header>

      {/* Main Layout: User Registration Info Sidebar + Chat Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: Informasi Pendaftaran Pengguna (Pengganti Riwayat Obrolan) */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-[#FAF7F2] border-r border-[#E8DCCF] flex flex-col transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-[#E8DCCF]">
            <button
              onClick={() => {
                handleResetChat();
                setSidebarOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-[#DE992B]" />
              <span>Mulai Obrolan Baru</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">
              Informasi Akun Pendaftaran
            </div>

            {user ? (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-3.5 border border-[#E8DCCF] shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#F1E8DF]">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF4EB] border border-[#DE992B]/50 flex items-center justify-center text-sm font-black text-[#4A2D1B] shrink-0">
                      {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#361D10] truncate">
                        {user.full_name}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E7D32]">
                        <ShieldCheck className="w-3 h-3" />
                        Pengguna Terdaftar
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10px] font-semibold text-[#8C7B71] flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-[#DE992B]" />
                        Nama Lengkap
                      </span>
                      <p className="text-xs font-bold text-[#361D10] mt-0.5 break-words">
                        {user.full_name}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[#8C7B71] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#DE992B]" />
                        Email Terdaftar
                      </span>
                      <p className="text-xs font-bold text-[#361D10] mt-0.5 break-all">
                        {user.email}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[#8C7B71] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#DE992B]" />
                        No. WhatsApp / Telepon
                      </span>
                      <p className="text-xs font-bold text-[#361D10] mt-0.5">
                        {user.phone || "Belum dilengkapi"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FFF8EE] border border-[#F3E2CB] rounded-2xl p-3.5 space-y-1.5">
                  <div className="font-bold text-[#8C5D19] flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#DE992B]" />
                    <span>Akses Chat Tanpa Batas</span>
                  </div>
                  <p className="text-[11px] text-[#6B5B51] leading-relaxed">
                    Sebagai pengguna yang telah login, Anda bebas berkonsultasi lebih dari 3 kali tanpa batas kuota.
                  </p>
                </div>

                <Link
                  href="/profile"
                  className="block w-full text-center py-2 px-3 rounded-xl bg-white border border-[#E2D5C7] hover:border-[#4A2D1B] text-[#4A2D1B] font-semibold text-xs transition-colors"
                >
                  Kelola Profil Pendaftaran
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 border border-[#E8DCCF] shadow-2xs space-y-3">
                <p className="font-bold text-[#361D10] text-xs">
                  Status: Pengunjung Tamu
                </p>
                <p className="text-[11px] text-[#6B5B51] leading-relaxed">
                  Pengunjung tanpa login memiliki kuota maksimal <strong>3 kali chat</strong> ({Math.min(guestChatCount, MAX_GUEST_CHATS)}/{MAX_GUEST_CHATS} terpakai). Masuk sebagai pengguna untuk chat ke-4 dan seterusnya tanpa batas.
                </p>
                <Link
                  href="/login?redirect=/chat"
                  className="w-full py-2 px-3 rounded-xl bg-[#4A2D1B] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#DE992B]" />
                  <span>Masuk Sebagai Pengguna</span>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-2xs z-20 md:hidden"
          />
        )}

        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 border border-[#DE992B]/30 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                      <Image
                        src="/images/chatbot/cowboy-robot.png"
                        alt="ChickAI Assistant Avatar"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-xs leading-relaxed text-sm ${
                      msg.role === "user"
                        ? "bg-[#4A2D1B] text-white rounded-br-sm"
                        : "bg-[#FAF7F2] text-[#2C1D13] border border-[#E8DCCF] rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-[#E3D7C9] space-y-2">
                        <div className="text-xs font-bold text-[#4A2D1B] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#DE992B]" />
                          <span>Sumber & Referensi Internet:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-white rounded-xl p-2.5 border border-[#E8DCCF] shadow-2xs space-y-1"
                            >
                              {src.url ? (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-[#361D10] hover:text-[#DE992B] flex items-start justify-between gap-1.5 group"
                                >
                                  <span className="line-clamp-2">{src.title}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-[#DE992B] shrink-0 mt-0.5" />
                                </a>
                              ) : (
                                <div className="text-xs font-bold text-[#361D10] truncate">
                                  📄 {src.title}
                                </div>
                              )}
                              {src.sourceName && (
                                <div className="text-[10px] font-semibold text-[#966318]">
                                  Sumber: {src.sourceName}
                                </div>
                              )}
                              {src.snippet && (
                                <p className="text-[11px] text-[#7A6A60] line-clamp-2">
                                  {src.snippet}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-2xl bg-[#EADBCE] text-[#4A2D1B] flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3.5 items-start justify-start">
                  <div className="w-9 h-9 rounded-2xl bg-[#FAF7F2] border border-[#DE992B]/40 p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <Image
                      src="/images/chatbot/cowboy-robot.png"
                      alt="ChickAI Avatar"
                      width={28}
                      height={28}
                      className="object-contain animate-bounce"
                    />
                  </div>
                  <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-3xl rounded-bl-sm p-4 text-xs text-[#6A5A50] flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-[#DE992B]" />
                    <span>ChickAI sedang memproses jawaban...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {!isGuestLimitReached && (
            <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E8DCCF] overflow-x-auto no-scrollbar">
              <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs">
                <span className="text-[#8C7B71] text-[11px] font-semibold shrink-0">
                  Saran Pertanyaan:
                </span>
                <button
                  onClick={() => handleSendMessage("Berapa takaran kalsium pakan ayam layer fase puncak?")}
                  className="px-3 py-1 rounded-full bg-white border border-[#E2D5C7] text-[#4A2D1B] whitespace-nowrap hover:border-[#DE992B] transition-colors"
                >
                  🌾 Kalsium Layer
                </button>
                <button
                  onClick={() => handleSendMessage("Bagaimana mitigasi penyakit ND dan AI di kandang?")}
                  className="px-3 py-1 rounded-full bg-white border border-[#E2D5C7] text-[#4A2D1B] whitespace-nowrap hover:border-[#DE992B] transition-colors"
                >
                  🛡️ Biosekuriti 3 Zona
                </button>
                <button
                  onClick={() => handleSendMessage("Suhu dan kelembaban ideal kandang closed-house?")}
                  className="px-3 py-1 rounded-full bg-white border border-[#E2D5C7] text-[#4A2D1B] whitespace-nowrap hover:border-[#DE992B] transition-colors"
                >
                  🌡️ Suhu Closed-House
                </button>
              </div>
            </div>
          )}

          {isGuestLimitReached && (
            <div className="px-4 py-3 bg-[#FFF3E0] border-t border-[#E8DCCF]">
              <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-[#361D10]">
                  Kuota 3x chat tamu telah habis. Silakan login sebagai pengguna untuk melanjutkan chat ke-4 dan seterusnya.
                </span>
                <Link
                  href="/login?redirect=/chat"
                  className="px-4 py-2 rounded-xl bg-[#4A2D1B] text-white font-bold flex items-center gap-1.5 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#DE992B]" />
                  <span>Masuk Sebagai Pengguna</span>
                </Link>
              </div>
            </div>
          )}

          <div className="p-4 bg-white border-t border-[#E8DCCF]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="max-w-3xl mx-auto flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isGuestLimitReached}
                placeholder={
                  isGuestLimitReached
                    ? "Kuota 3x chat tamu habis — silakan login untuk melanjutkan..."
                    : "Tuliskan pertanyaan seputar peternakan, pakan, penyakit, atau kandang..."
                }
                className="flex-1 bg-[#FAF7F2] border border-[#E2D5C7] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl px-4 py-3.5 text-sm text-[#2C1D13] outline-none shadow-xs transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || isGuestLimitReached || !input.trim()}
                className="px-5 py-3.5 rounded-2xl bg-[#4A2D1B] hover:bg-[#382112] disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
              >
                <span>Kirim</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#FAF7F2] text-[#4A2D1B]">
          <Loader2 className="w-8 h-8 animate-spin text-[#DE992B]" />
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
