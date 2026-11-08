"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types";

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, pass: string, targetRole?: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { full_name: string; phone: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, Profile> = {
  "admin@demo.local": {
    id: "demo-admin-uuid",
    email: "admin@demo.local",
    full_name: "Administrator Demo",
    role: "ADMIN",
    is_active: true,
    avatar_url: "/images/chatbot/cowboy-robot.png",
    phone: "081234567890",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "user@demo.local": {
    id: "demo-user-uuid",
    email: "user@demo.local",
    full_name: "Budi Santoso",
    role: "USER",
    is_active: true,
    avatar_url: null,
    phone: "081398765432",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const supabase = createClient();

  // Watch for route changes: strictly keep logged-in ADMIN inside /admin/*
  useEffect(() => {
    if (user?.role === "ADMIN" && pathname) {
      if (!pathname.startsWith("/admin")) {
        router.replace("/admin");
      }
    }
  }, [user?.role, pathname, router]);

  useEffect(() => {
    // Check saved session in local storage or Supabase
    const initAuth = async () => {
      try {
        const storedDemo =
          typeof window !== "undefined"
            ? localStorage.getItem("tanyaternak_demo_user") ||
              localStorage.getItem("chickyai_demo_user")
            : null;
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            setUser(parsed);
            document.cookie = `tanyaternak_role=${parsed.role}; path=/; max-age=86400; SameSite=Lax`;
            if (parsed.role === "ADMIN" && typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith("/admin")) {
                router.replace("/admin");
              }
            }
            setIsLoading(false);
            return;
          } catch {
            localStorage.removeItem("tanyaternak_demo_user");
            localStorage.removeItem("chickyai_demo_user");
          }
        }

        // Check real Supabase Auth
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUser(profile as Profile);
            document.cookie = `tanyaternak_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;

            // If user is Admin and opens a non-admin page, force redirect to /admin
            if (profile.role === "ADMIN" && typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith("/admin")) {
                router.replace("/admin");
              }
            }
          }
        }
      } catch (err) {
        console.warn("Auth initialization note:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [supabase]);

  const login = async (
    email: string,
    pass: string,
    targetRole?: UserRole
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Demo credentials
    if (isDemo && (cleanEmail === "admin@demo.local" || cleanEmail === "user@demo.local")) {
      const demoProfile = DEMO_USERS[cleanEmail];

      // Strict role check for Admin portal
      if (targetRole === "ADMIN" && demoProfile.role !== "ADMIN") {
        setIsLoading(false);
        return {
          success: false,
          error: "Akun ini tidak memiliki akses administrator.",
        };
      }

      setUser(demoProfile);
      localStorage.setItem("tanyaternak_demo_user", JSON.stringify(demoProfile));
      document.cookie = `tanyaternak_role=${demoProfile.role}; path=/; max-age=86400; SameSite=Lax`;

      setIsLoading(false);
      return { success: true, role: demoProfile.role };
    }

    // 2. Real Supabase Authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profError || !profile) {
          setIsLoading(false);
          return { success: false, error: "Gagal memuat profil pengguna." };
        }

        if (targetRole === "ADMIN" && profile.role !== "ADMIN") {
          await supabase.auth.signOut();
          setIsLoading(false);
          return {
            success: false,
            error: "Akun ini tidak memiliki akses administrator.",
          };
        }

        setUser(profile as Profile);
        document.cookie = `tanyaternak_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;
        setIsLoading(false);
        return { success: true, role: profile.role as UserRole };
      }
    } catch {
      // In demo mode with random email
      if (isDemo) {
        const fallbackRole: UserRole = cleanEmail.includes("admin") ? "ADMIN" : "USER";
        if (targetRole === "ADMIN" && fallbackRole !== "ADMIN") {
          setIsLoading(false);
          return {
            success: false,
            error: "Akun ini tidak memiliki akses administrator.",
          };
        }

        const syntheticProfile: Profile = {
          id: `demo-${Date.now()}`,
          email: cleanEmail,
          full_name: cleanEmail.split("@")[0],
          role: fallbackRole,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setUser(syntheticProfile);
        localStorage.setItem("tanyaternak_demo_user", JSON.stringify(syntheticProfile));
        document.cookie = `tanyaternak_role=${fallbackRole}; path=/; max-age=86400; SameSite=Lax`;
        setIsLoading(false);
        return { success: true, role: fallbackRole };
      }
    }

    setIsLoading(false);
    return { success: false, error: "Gagal masuk ke akun." };
  };

  const register = async (data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
          },
        },
      });

      if (error) {
        if (!isDemo) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
      }
    } catch {
      // Allow demo registration simulation
    }

    const newProfile: Profile = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      role: "USER", // ALWAYS USER
      phone: data.phone,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(newProfile);
    localStorage.setItem("tanyaternak_demo_user", JSON.stringify(newProfile));
    document.cookie = `tanyaternak_role=USER; path=/; max-age=86400; SameSite=Lax`;

    setIsLoading(false);
    return { success: true };
  };

  const updateProfile = async (data: { full_name: string; phone: string }) => {
    if (!user) return;
    const updated: Profile = {
      ...user,
      full_name: data.full_name,
      phone: data.phone,
      updated_at: new Date().toISOString(),
    };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("tanyaternak_demo_user", JSON.stringify(updated));
    }
    try {
      await supabase
        .from("profiles")
        .update({ full_name: data.full_name, phone: data.phone, updated_at: updated.updated_at })
        .eq("id", user.id);
    } catch {
      // Fallback to local profile state
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    setUser(null);
    localStorage.removeItem("tanyaternak_demo_user");
    localStorage.removeItem("chickyai_demo_user");
    localStorage.removeItem("tanyaternak_guest_chat_count");
    localStorage.removeItem("tanyaternak_guest_quota_v2");
    document.cookie = "tanyaternak_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "chickyai_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isDemo,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
