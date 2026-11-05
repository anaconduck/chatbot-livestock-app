import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { FloatingChatbot } from "@/components/chatbot/FloatingChatbot";
import { Analytics } from "@vercel/analytics/react";
import { PageTracker } from "@/components/analytics/PageTracker";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TanyaTernak",
  description:
    "Platform chatbot berbasis RAG dan repositori riset agribisnis peternakan unggas Indonesia. Didukung Program HIBAH Fakultas Peternakan Universitas Brawijaya.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=5" },
      { url: "/favicon-32x32.png?v=5", sizes: "32x32", type: "image/png" },
      { url: "/images/logo/logo1.png?v=5", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=5",
    apple: "/images/logo/logo1.png?v=5",
  },
  keywords: [
    "TanyaTernak",
    "Agribisnis Peternakan",
    "Fapet Universitas Brawijaya",
    "Peternakan Ayam",
    "Ayam Petelur",
    "Layer",
    "Broiler",
    "Riset Pakan",
    "Biosekuriti",
    "Kandang Closed House",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakartaSans.variable} font-sans`}>
      <head>
        <link rel="icon" href="/favicon.ico?v=5" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png?v=5" type="image/png" sizes="32x32" />
        <link rel="icon" href="/images/logo/logo1.png?v=5" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo/logo1.png?v=5" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C1D13] antialiased selection:bg-[#DE992B]/20 selection:text-[#4E2E1E]">
        <PageTracker />
        <AuthProvider>
          {children}
          <FloatingChatbot />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
