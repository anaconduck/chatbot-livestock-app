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
