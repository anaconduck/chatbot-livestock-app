import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

export interface ServerUserContext {
  userId: string;
  email: string;
  role: UserRole;
  isDemo: false;
}

export async function getCurrentServerUser():
  Promise<ServerUserContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_active) {
    return null;
  }

  if (profile.role !== "USER" && profile.role !== "ADMIN") {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role: profile.role,
    isDemo: false,
  };
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentServerUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user;
}

export async function requireAdminRole() {
  const user = await requireAuthenticatedUser();

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

// import "server-only";
// import { createClient } from "@/lib/supabase/server";
// import { createAdminClient } from "@/lib/supabase/admin";
// import { cookies } from "next/headers";
// import type { UserRole } from "@/types";

// export interface ServerUserContext {
//   userId: string;
//   email: string;
//   role: UserRole;
//   isDemo: boolean;
// }

// export async function getCurrentServerUser(): Promise<ServerUserContext | null> {
//   // 1. Check real Supabase Auth session
//   try {
//     const supabase = await createClient();
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     if (session?.user) {
//       const adminClient = createAdminClient();
//       const { data: profile } = await adminClient
//         .from("profiles")
//         .select("role, is_active")
//         .eq("id", session.user.id)
//         .single();

//       if (profile && profile.is_active) {
//         return {
//           userId: session.user.id,
//           email: session.user.email || "",
//           role: profile.role as UserRole,
//           isDemo: false,
//         };
//       }
//     }
//   } catch {
//     // Supabase session lookup fallback
//   }

//   // 2. Check role cookie (supports demo mode or restored session)
//   try {
//     const cookieStore = await cookies();
//     const roleCookie =
//       cookieStore.get("tanyaternak_role")?.value ||
//       cookieStore.get("chickyai_role")?.value;

//     if (roleCookie === "ADMIN") {
//       return {
//         userId: "admin-session-id",
//         email: "admin@tanyaternak.id",
//         role: "ADMIN",
//         isDemo: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
//       };
//     }
//   } catch {
//     // Context without headers
//   }

//   return null;
// }

// export async function requireAdminRole(): Promise<ServerUserContext> {
//   const user = await getCurrentServerUser();

//   if (!user || user.role !== "ADMIN") {
//     throw new Error("UNAUTHORIZED: Akun ini tidak memiliki akses administrator.");
//   }

//   return user;
// }
