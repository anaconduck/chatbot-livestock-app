import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdminRole } from "@/server/authorization";

type AuthorizationResult =
  | { authorized: true }
  | { authorized: false; status: 401 | 403; message: string };

async function authorizeAdminRequest(): Promise<AuthorizationResult> {
  const isDevelopmentDemo =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (isDevelopmentDemo) {
    try {
      await requireAdminRole();
      return { authorized: true };
    } catch {
      return {
        authorized: false,
        status: 403,
        message: "Akses administrator diperlukan.",
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      status: 401,
      message: "Silakan masuk untuk mengakses statistik admin.",
    };
  }

  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(`Gagal memverifikasi profil admin: ${profileError.message}`);
  }

  if (!profile.is_active || profile.role !== "ADMIN") {
    return {
      authorized: false,
      status: 403,
      message: "Akun ini tidak memiliki akses administrator.",
    };
  }

  return { authorized: true };
}

export async function GET() {
  try {
    const authorization = await authorizeAdminRequest();

    if (!authorization.authorized) {
      return NextResponse.json(
        { error: authorization.message },
        { status: authorization.status }
      );
    }

    const adminClient = createAdminClient();
    const [viewsRes, profilesRes, docsRes] = await Promise.all([
      adminClient.from("page_views").select("*", { count: "exact", head: true }),
      adminClient.from("profiles").select("*", { count: "exact", head: true }),
      adminClient.from("documents").select("*", { count: "exact", head: true }),
    ]);

    const queryError = viewsRes.error || profilesRes.error || docsRes.error;
    if (queryError) {
      throw new Error(`Gagal mengambil statistik admin: ${queryError.message}`);
    }

    return NextResponse.json({
      totalVisits: viewsRes.count ?? 0,
      totalUsers: profilesRes.count ?? 0,
      totalDocuments: docsRes.count ?? 0,
    });
  } catch (error: unknown) {
    console.error("Error fetching admin stats from Supabase:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik admin." },
      { status: 500 }
    );
  }
}
