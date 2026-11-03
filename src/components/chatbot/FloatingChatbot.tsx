"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, X, Maximize2, Loader2, BookOpen, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types";

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      conversation_id: "quick-chat",
      role: "assistant",
      content:
        "Hai 👋 Selamat datang di ChickAI Assistant!\n\nSaya asisten virtual cerdas TanyaPeternakan, siap membantu menjawab pertanyaan mengenai riset, manajemen pakan, biosekuriti, dan agribisnis peternakan unggas berdasarkan literatur ilmiah terverifikasi.\n\nSilakan tanyakan apa saja yang ingin Anda ketahui.",
      created_at: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  // When drawer opens, always scroll to top so user reads from the beginning
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // When new messages are sent or received, scroll smoothly to bottom
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      conversation_id: "quick-chat",
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
          conversation_id: "quick-chat",
        }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: "quick-chat",
        role: "assistant",
        content: data.answer || "Maaf, terjadi kendala saat memproses jawaban.",
        sources: data.sources || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          conversation_id: "quick-chat",
          role: "assistant",
          content:
            "Mode offline / simulasi: Pastikan sistem terhubung ke backend untuk menerima jawaban terkini.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] h-[500px] max-h-[78vh] bg-white rounded-2xl shadow-2xl border border-[#E8DCCF] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="bg-[#4E2E1E] text-white p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-0.5 flex items-center justify-center">
                <Image
                  src="/images/chatbot/cowboy-robot.png"
                  alt="ChickAI Assistant"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-[#FAF7F2]">
                  <span>ChickAI Assistant</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#DE992B] text-[#361D10] font-black uppercase tracking-wider">
                    Tanya AI
                  </span>
                </h4>
                <p className="text-[11px] text-[#D8C7B8] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Asisten Riset & Agribisnis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/chat"
                className="p-1.5 rounded-lg text-[#D8C7B8] hover:text-white hover:bg-white/10 transition-colors"
                title="Buka Layar Penuh"
                onClick={() => setIsOpen(false)}
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#D8C7B8] hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            ref={messagesContainerRef}
            className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#FAF7F2]/60 text-xs sm:text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-[#DE992B]/20 flex items-center justify-center shrink-0 border border-[#DE992B]/30 p-0.5">
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
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.role === "user"
                      ? "bg-[#4E2E1E] text-white rounded-br-none shadow-sm"
                      : "bg-white text-[#2C1D13] border border-[#EADBCE] rounded-bl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {/* Sources Preview */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E8DCCF] text-[11px] text-[#7C6A5D]">
                      <p className="font-semibold flex items-center gap-1 text-[#4E2E1E] mb-1">
                        <BookOpen className="w-3 h-3 text-[#DE992B]" />
                        Referensi Terkait:
                      </p>
                      <ul className="space-y-1">
                        {msg.sources.map((s, idx) => (
                          <li key={idx} className="truncate">
                            • {s.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-[#7C6A5D]">
                <div className="w-7 h-7 rounded-lg bg-[#DE992B]/20 flex items-center justify-center shrink-0 p-0.5">
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
                  <span>ChickAI sedang mencari literatur...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-[#FAF7F2] border-t border-[#EADBCE] flex gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <button
              onClick={() => setInput("Berapa kebutuhan kalsium ayam layer puncak?")}
              className="px-2 py-0.5 rounded-full bg-white border border-[#E0D4C5] text-[#54321D] whitespace-nowrap hover:border-[#DE992B] transition-colors"
            >
              Kalsium Layer
            </button>
            <button
              onClick={() => setInput("Bagaimana mitigasi penyakit ND dan AI?")}
              className="px-2 py-0.5 rounded-full bg-white border border-[#E0D4C5] text-[#54321D] whitespace-nowrap hover:border-[#DE992B] transition-colors"
            >
              Biosekuriti ND/AI
            </button>
            <button
              onClick={() => setInput("Suhu optimal kandang closed-house?")}
              className="px-2 py-0.5 rounded-full bg-white border border-[#E0D4C5] text-[#54321D] whitespace-nowrap hover:border-[#DE992B] transition-colors"
            >
              Suhu Closed House
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t border-[#EADBCE] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan seputar ayam & pakan..."
              className="flex-1 bg-[#FAF7F2] border border-[#E5DACD] focus:border-[#DE992B] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2C1D13] outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-[#4E2E1E] hover:bg-[#3D2113] disabled:opacity-50 text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
              aria-label="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 sm:pl-4 sm:pr-2 sm:py-2 rounded-full bg-gradient-to-r from-[#4E2E1E] to-[#613619] hover:from-[#3D2214] hover:to-[#4E2B13] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-[#FAF7F2]"
        aria-label="Tanya AI - Chatbot ChickAI Assistant"
      >
        <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#FAF7F2] select-none pl-1">
          <Sparkles className="w-3.5 h-3.5 text-[#DE992B] animate-pulse" />
          <span>Tanya AI</span>
        </span>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#522E15] p-1 flex items-center justify-center relative overflow-hidden shrink-0 border border-[#DE992B]/40 shadow-inner">
          <Image
            src="/images/chatbot/cowboy-robot.png"
            alt="ChickAI Assistant Mascot"
            width={34}
            height={34}
            className="object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </button>
    </div>
  );
};
