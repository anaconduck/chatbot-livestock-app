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
  Plus,
  MessageSquare,
  User as UserIcon,
  BookOpen,
  Loader2,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

function ChatInner() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([
    { id: "c-1", title: "Keseimbangan Asam Amino Pakan", active: true },
    { id: "c-2", title: "Ventilasi Closed House & Gas Amonia", active: false },
    { id: "c-3", title: "Mitigasi Penyakit Newcastle Disease", active: false },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greeting",
      conversation_id: "c-1",
      role: "assistant",
      content:
        "Hai 👋 Selamat datang di ChickAI Assistant!\n\nSaya asisten virtual cerdas TanyaPeternakan, siap membantu menjawab pertanyaan mengenai riset dan agribisnis peternakan unggas berdasarkan literatur ilmiah terverifikasi.\n\nSilakan tanyakan apa saja yang ingin Anda ketahui.",
      created_at: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      conversation_id: "c-1",
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
          conversation_id: "c-1",
          user: user?.id || "peternak_demo",
        }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: "c-1",
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
          conversation_id: "c-1",
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

  const handleNewChat = () => {
    const newId = `c-${Date.now()}`;
    setConversations([
      { id: newId, title: "Percakapan Baru", active: true },
      ...conversations.map((c) => ({ ...c, active: false })),
    ]);
    setMessages([
      {
        id: `greeting-${newId}`,
        conversation_id: newId,
        role: "assistant",
        content:
          "Hai 👋 Selamat datang di ChickAI Assistant!\n\nSaya asisten virtual cerdas TanyaPeternakan, siap membantu menjawab pertanyaan mengenai peternakan ayam berdasarkan dokumen terverifikasi.\n\nSilakan tanyakan apa saja yang ingin Anda ketahui.",
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
            <span>Ruang Konsultasi RAG</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DE992B]/15 text-[#966318] border border-[#DE992B]/30 font-bold uppercase">
              Tanya AI
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2D5C7] text-xs font-semibold text-[#5A483E] hover:border-[#4A2D1B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali ke</span> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Layout: Sidebar + Chat Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-[#FAF7F2] border-r border-[#E8DCCF] flex flex-col transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            <button
              onClick={() => {
                handleNewChat();
                setSidebarOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4A2D1B] hover:bg-[#382112] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#DE992B]" />
              <span>Percakapan Baru</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1.5 text-xs">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">
              Riwayat Obrolan
            </div>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setConversations(
                    conversations.map((item) => ({
                      ...item,
                      active: item.id === c.id,
                    }))
                  );
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                  c.active
                    ? "bg-white text-[#361D10] font-bold border border-[#E8DCCF] shadow-xs"
                    : "text-[#6A5A50] hover:bg-white/60 font-medium"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#DE992B] shrink-0" />
                <span className="truncate flex-1">{c.title}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-[#E8DCCF] bg-white/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FAF4EB] border border-[#DE992B]/50 flex items-center justify-center text-xs font-bold text-[#4A2D1B]">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#361D10] truncate">
                  {user?.full_name || "Peternak"}
                </p>
                <p className="text-[10px] text-[#8C7B71] truncate">{user?.email}</p>
              </div>
            </div>
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
                          <span>Sumber Literatur Terverifikasi:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-white rounded-xl p-2.5 border border-[#E8DCCF] shadow-2xs space-y-1"
                            >
                              <div className="text-xs font-bold text-[#361D10] truncate">
                                📄 {src.title}
                              </div>
                              {src.snippet && (
                                <p className="text-[11px] text-[#7A6A60] line-clamp-2 italic">
                                  &ldquo;{src.snippet}&rdquo;
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
                    <span>ChickAI sedang membaca indeks dokumen riset peternakan...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

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
                placeholder="Tuliskan pertanyaan seputar ayam, pakan, penyakit, atau kandang..."
                className="flex-1 bg-[#FAF7F2] border border-[#E2D5C7] focus:border-[#4A2D1B] focus:ring-1 focus:ring-[#4A2D1B] rounded-2xl px-4 py-3.5 text-sm text-[#2C1D13] outline-none shadow-xs transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
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
