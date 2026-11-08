"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, X, Loader2, BookOpen, LogIn, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import type { ChatMessage } from "@/types";

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
    // Migrasi bila masih tersimpan sebagai angka biasa
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

export const FloatingChatbot: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Sembunyikan chatbot di halaman autentikasi, ruang chat penuh (/chat), dan panel admin (/admin)
  const isHiddenPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [guestChatCount, setGuestChatCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      conversation_id: "quick-chat",
      role: "assistant",
      content:
        "Hai 👋 Selamat datang di ChickAI Assistant!\n\nSaya asisten virtual cerdas TanyaTernak, siap membantu menjawab pertanyaan mengenai riset, manajemen pakan, biosekuriti, dan agribisnis peternakan unggas.\n\nSilakan tanyakan apa saja yang ingin Anda ketahui.",
      created_at: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    setGuestChatCount(readGuestQuota());
    const interval = setInterval(() => {
      setGuestChatCount(readGuestQuota());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, isOpen]);

  // When drawer opens, always scroll to top if only greeting exists
  useEffect(() => {
    if (isOpen && messagesContainerRef.current && messages.length <= 1) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [isOpen, messages.length]);

  // When new messages are sent or received, scroll smoothly to bottom
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  const isGuestLimitReached = !user && guestChatCount >= MAX_GUEST_CHATS;

  const sendQuery = async (rawText: string) => {
    const userText = rawText.trim();
    if (!userText || isLoading) return;

    // Jika belum login dan sudah lewat 3x chat (percobaan chat ke-4)
    if (!user && guestChatCount >= MAX_GUEST_CHATS) {
      setInput("");
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          conversation_id: conversationId || "quick-chat",
          role: "user",
          content: userText,
          created_at: new Date().toISOString(),
        },
        {
          id: `limit-${Date.now()}`,
          conversation_id: conversationId || "quick-chat",
          role: "assistant",
          content:
            "Anda telah mencapai batas maksimal 3 kali chat tanpa login. Silakan masuk (login) sebagai pengguna untuk melanjutkan pertanyaan ke-4 dan berkonsultasi tanpa batas.",
          created_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    setInput("");

    if (!user) {
      const currentCount = readGuestQuota();
      const nextCount = currentCount + 1;
      setGuestChatCount(nextCount);
      saveGuestQuota(nextCount);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      conversation_id: conversationId || "quick-chat",
      role: "user",
      content: userText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userText,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pertanyaan.");
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: data.conversation_id || conversationId || "quick-chat",
        role: "assistant",
        content: data.answer || "Maaf, terjadi kendala saat memproses jawaban.",
        sources: data.sources || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      const errText =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          conversation_id: "quick-chat",
          role: "assistant",
          content: `Terjadi kendala koneksi: ${errText}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendQuery(input);
  };

  if (isHiddenPage) {
    return null;
  }

  const loginRedirectHref = `/login?redirect=${encodeURIComponent(pathname || "/")}`;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="mb-2 sm:mb-3 w-[calc(100vw-1.5rem)] max-w-[300px] sm:max-w-[380px] sm:w-[380px] h-[390px] sm:h-[500px] max-h-[68vh] sm:max-h-[78vh] bg-white rounded-2xl shadow-2xl border border-[#E8DCCF] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="bg-[#4E2E1E] text-white p-2.5 sm:p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/20 p-0.5 flex items-center justify-center shrink-0">
                <Image
                  src="/images/chatbot/cowboy-robot.png"
                  alt="ChickAI Assistant"
                  width={28}
                  height={28}
                  className="object-contain w-6 h-6 sm:w-7 sm:h-7"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm leading-tight text-[#FAF7F2]">
                  ChickAI Assistant
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[#D8C7B8] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {user ? `Login: ${user.full_name}` : `Kuota Tamu: ${Math.min(guestChatCount, MAX_GUEST_CHATS)}/${MAX_GUEST_CHATS} Chat`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#D8C7B8] hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup Chat"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            ref={messagesContainerRef}
            className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-3 bg-[#FAF7F2]/60 text-xs sm:text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#DE992B]/20 flex items-center justify-center shrink-0 border border-[#DE992B]/30 p-0.5">
                    <Image
                      src="/images/chatbot/cowboy-robot.png"
                      alt="ChickAI"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-2.5 sm:p-3 ${
                    msg.role === "user"
                      ? "bg-[#4E2E1E] text-white rounded-br-none shadow-sm"
                      : "bg-white text-[#2C1D13] border border-[#EADBCE] rounded-bl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {/* Sources Preview */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E8DCCF] text-[10px] sm:text-[11px] text-[#7C6A5D]">
                      <p className="font-bold flex items-center gap-1 text-[#4E2E1E] mb-1.5">
                        <BookOpen className="w-3 h-3 text-[#DE992B] shrink-0" />
                        Sumber & Referensi Internet:
                      </p>
                      <ul className="space-y-1.5">
                        {msg.sources.map((s, idx) => (
                          <li key={idx} className="leading-snug">
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-start gap-1 text-[#4E2E1E] hover:text-[#DE992B] font-medium hover:underline break-words"
                              >
                                <ExternalLink className="w-2.5 h-2.5 text-[#DE992B] shrink-0 mt-0.5" />
                                <span>
                                  {s.title}
                                  {s.sourceName ? (
                                    <span className="text-[#8C7A70] font-normal">
                                      {" "}
                                      ({s.sourceName})
                                    </span>
                                  ) : null}
                                </span>
                              </a>
                            ) : (
                              <span>• {s.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-[#7C6A5D]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#DE992B]/20 flex items-center justify-center shrink-0 p-0.5">
                  <Image
                    src="/images/chatbot/cowboy-robot.png"
                    alt="ChickAI"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div className="bg-white border border-[#EADBCE] rounded-2xl px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DE992B]" />
                  <span>ChickAI sedang mengetik jawaban...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {!isGuestLimitReached && (
            <div className="px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] border-t border-[#EADBCE] flex gap-1.5 overflow-x-auto no-scrollbar text-[10px] sm:text-[11px]">
              <button
                type="button"
                onClick={() => sendQuery("Berapa kebutuhan kalsium ayam layer puncak?")}
                className="px-2 py-0.5 rounded-full bg-white border border-[#E0D4C5] text-[#54321D] whitespace-nowrap hover:border-[#DE992B] transition-colors"
              >
                Kalsium Layer
              </button>
              <button
                type="button"
                onClick={() => sendQuery("Bagaimana mitigasi penyakit ND dan AI?")}
                className="px-2 py-0.5 rounded-full bg-white border border-[#E0D4C5] text-[#54321D] whitespace-nowrap hover:border-[#DE992B] transition-colors"
              >
                Biosekuriti ND/AI
              </button>
              <button
                type="button"
                onClick={() => sendQuery("Suhu optimal kandang closed-house?")}
                className="px-2 py-0.5 rounded-full bg-white border border-[#E0D4C5] text-[#54321D] whitespace-nowrap hover:border-[#DE992B] transition-colors"
              >
                Suhu Closed House
              </button>
            </div>
          )}

          {/* Guest Quota Notice or Login Prompt after 3 Chats */}
          {!user && (
            <div
              className={`px-3 py-2 border-t border-[#EADBCE] text-[10px] sm:text-[11px] ${
                isGuestLimitReached
                  ? "bg-[#FFF3E0] text-[#4E2E1E]"
                  : "bg-[#FFF8E8] text-[#6B584A] text-center"
              }`}
            >
              {isGuestLimitReached ? (
                <div className="space-y-2 text-center">
                  <p className="font-semibold text-[#361D10]">
                    Batas 3x chat tanpa akun telah habis. Silakan login sebagai pengguna untuk lanjut bertanya ke-4 dan seterusnya.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={loginRedirectHref}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4E2E1E] hover:bg-[#382112] text-white font-bold text-[11px] transition-colors shadow-xs"
                    >
                      <LogIn className="w-3 h-3 text-[#DE992B]" />
                      <span>Masuk Sebagai Pengguna</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-[#D8C7B8] hover:border-[#4E2E1E] text-[#4E2E1E] font-bold text-[11px] transition-colors"
                    >
                      Daftar
                    </Link>
                  </div>
                </div>
              ) : (
                <span>
                  Gratis {MAX_GUEST_CHATS - guestChatCount}x chat lagi tanpa login.{" "}
                  <Link
                    href={loginRedirectHref}
                    className="font-bold text-[#965A2E] hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    Masuk pengguna
                  </Link>{" "}
                  untuk chat tanpa batas.
                </span>
              )}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 bg-white border-t border-[#EADBCE] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isGuestLimitReached}
              placeholder={
                isGuestLimitReached
                  ? "Kuota 3x habis — silakan login untuk lanjut chat..."
                  : "Tanyakan seputar peternakan & pakan..."
              }
              className="flex-1 bg-[#FAF7F2] border border-[#E5DACD] focus:border-[#DE992B] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#2C1D13] outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || isGuestLimitReached || !input.trim()}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4E2E1E] hover:bg-[#3D2113] disabled:opacity-50 text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
              aria-label="Kirim Pesan"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger & Greeting Speech Bubble (Compact on Mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Speech Bubble / Tooltip Notification */}
        {!isOpen && showBubble && (
          <div className="relative bg-white border border-[#E4D7C9] shadow-md sm:shadow-lg rounded-xl sm:rounded-2xl pl-2.5 pr-1.5 py-1 sm:pl-4 sm:pr-2.5 sm:py-2.5 text-[10px] sm:text-sm text-[#2C1D13] font-medium flex items-center gap-1 sm:gap-2 animate-in fade-in slide-in-from-right-3 duration-300 select-none whitespace-nowrap">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1 sm:gap-2 hover:text-[#DE992B] transition-colors text-left"
              title="Buka ChatBot"
            >
              <span className="text-xs sm:text-lg leading-none">👋</span>
              <span>
                Hai, butuh bantuan? Tanya <strong>ChatBot</strong>
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBubble(false);
              }}
              className="text-[#9E8E82] hover:text-[#361D10] p-0.5 sm:p-1 rounded-full hover:bg-[#FAF7F2] transition-colors shrink-0 ml-0.5 sm:ml-1"
              aria-label="Tutup petunjuk"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            {/* Pointer arrow towards the floating button */}
            <div className="hidden sm:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-[#E4D7C9] rotate-45" />
          </div>
        )}

        {/* Floating Mascot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#965A2E] to-[#54321D] p-0.5 sm:p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-[#FAF7F2] shrink-0"
          aria-label="Buka Chatbot ChickAI Assistant"
        >
          <div className="w-full h-full rounded-lg sm:rounded-xl bg-[#613619] flex items-center justify-center relative overflow-hidden">
            <Image
              src="/images/chatbot/cowboy-robot.png"
              alt="ChickAI Assistant Mascot"
              width={38}
              height={38}
              className="w-7 h-7 sm:w-[38px] sm:h-[38px] object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </button>
      </div>
    </div>
  );
};
