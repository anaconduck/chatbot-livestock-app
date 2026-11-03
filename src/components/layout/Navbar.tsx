"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/context";
import {
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Bot,
  LayoutDashboard,
  BookOpen,
  Home,
  Info,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADBCE] overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 z-10">
            <Logo />
          </div>

          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 z-0">
            <Link
              href="/"
              className={`text-sm font-semibold transition-colors pb-1 relative ${
                isActive("/")
                  ? "text-[#4A2D1B] border-b-2 border-[#4A2D1B]"
                  : "text-[#6E5D52] hover:text-[#4A2D1B]"
              }`}
            >
              Beranda
            </Link>

            <Link
              href="/riset"
              className={`text-sm font-semibold transition-colors pb-1 relative ${
                isActive("/riset")
                  ? "text-[#4A2D1B] border-b-2 border-[#4A2D1B]"
                  : "text-[#6E5D52] hover:text-[#4A2D1B]"
              }`}
            >
              Riset & Edukasi
            </Link>

            <Link
              href="/about"
              className={`text-sm font-semibold transition-colors pb-1 relative ${
                isActive("/about")
                  ? "text-[#4A2D1B] border-b-2 border-[#4A2D1B]"
                  : "text-[#6E5D52] hover:text-[#4A2D1B]"
              }`}
            >
              Tentang
            </Link>
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center gap-4 z-10">
            {user ? (
              <div className="flex items-center gap-3">
                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A2D1B] hover:bg-[#EADBCE]/50 transition-colors flex items-center gap-1.5 border border-[#EADBCE]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#DE992B]" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-right group hover:opacity-85 transition-opacity"
                  title="Buka Dashboard"
                >
                  <p className="text-xs font-bold text-[#4A2D1B] group-hover:text-[#DE992B] transition-colors">
                    {user.full_name}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[#EADBCE] text-[#5A3825]">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A2D1B] hover:bg-[#382112] text-white text-xs font-medium transition-all shadow-sm active:scale-95"
                >
                  <span>Logout</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#4A2D1B] hover:text-[#2A170C] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#DE992B] hover:bg-[#C8851E] text-white text-sm font-semibold shadow-sm transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#4A2D1B] hover:bg-[#EADBCE]/50 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EADBCE] bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-[#4A2D1B] hover:bg-[#EADBCE]/40"
          >
            <Home className="w-4 h-4 text-[#DE992B]" />
            Beranda
          </Link>

          <Link
            href="/riset"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-[#4A2D1B] hover:bg-[#EADBCE]/40"
          >
            <BookOpen className="w-4 h-4 text-[#DE992B]" />
            Riset & Edukasi
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-[#4A2D1B] hover:bg-[#EADBCE]/40"
              >
                <LayoutDashboard className="w-4 h-4 text-[#DE992B]" />
                Dashboard Peternak
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-[#4A2D1B] hover:bg-[#EADBCE]/40"
              >
                <Bot className="w-4 h-4 text-[#DE992B]" />
                Chatbot ChickAI Assistant (Tanya AI)
              </Link>
            </>
          )}

          {role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-[#4A2D1B] hover:bg-[#EADBCE]/40"
            >
              <ShieldCheck className="w-4 h-4 text-[#DE992B]" />
              Admin Portal
            </Link>
          )}

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-[#4A2D1B] hover:bg-[#EADBCE]/40"
          >
            <Info className="w-4 h-4 text-[#DE992B]" />
            Tentang
          </Link>

          <div className="pt-3 border-t border-[#EADBCE]">
            {user ? (
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs text-[#7A6B62] hover:text-[#4A2D1B]"
                >
                  Login sebagai: <span className="font-bold text-[#4A2D1B] underline decoration-[#DE992B]/50">{user.full_name}</span> ({user.role})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#4A2D1B] text-white text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-3 rounded-lg border border-[#4A2D1B] text-sm font-semibold text-[#4A2D1B]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-3 rounded-lg bg-[#DE992B] text-white text-sm font-semibold"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
