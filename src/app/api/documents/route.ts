import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json({ documents: data, fromSupabase: true });
    }
  } catch (err) {
    console.error("Error fetching public documents:", err);
  }

  return NextResponse.json({ documents: [], fromSupabase: false });
}
