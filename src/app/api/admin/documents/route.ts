import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";

export async function GET() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json({ documents: data });
    }
  } catch (err: any) {
    console.error("Error fetching documents:", err);
  }

  return NextResponse.json({ documents: isDemo ? MOCK_DOCUMENTS : [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const adminClient = createAdminClient();

    const newDoc = {
      title: body.title,
      author: body.author || "Admin TanyaTernak",
      publication_year: body.publication_year || new Date().getFullYear(),
      category: body.category || "Umum",
      description: body.description || "",
      original_filename: body.original_filename || body.title,
      status: "READY",
      file_size_bytes: body.file_size_bytes || 2.5 * 1024 * 1024,
      download_count: 0,
    };

    const { data, error } = await adminClient
      .from("documents")
      .insert([newDoc])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ document: data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create document" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("documents").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete document" }, { status: 500 });
  }
}
