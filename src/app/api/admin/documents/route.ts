import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/server/authorization";
import type { ContentType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminRole();
  } catch {
    return NextResponse.json(
      { error: "Akses ditolak: Diperlukan hak akses administrator." },
      { status: 403 }
    );
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json({ documents: data, fromSupabase: true });
    }
  } catch (err: unknown) {
    console.error("Error fetching documents:", err);
  }

  return NextResponse.json({ documents: [], fromSupabase: false });
}

export async function POST(req: Request) {
  try {
    await requireAdminRole();
  } catch {
    return NextResponse.json(
      { error: "Akses ditolak: Diperlukan hak akses administrator." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Judul konten wajib diisi." },
        { status: 400 }
      );
    }

    const contentType: ContentType =
      body.content_type === "FUN_FACT" ? "FUN_FACT" : "JURNAL";

    if (
      contentType === "JURNAL" &&
      (!body.source_url ||
        typeof body.source_url !== "string" ||
        !body.source_url.trim())
    ) {
      return NextResponse.json(
        { error: "Link jurnal ilmiah wajib diisi." },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const newDoc = {
      content_type: contentType,
      title: body.title.trim(),
      category: body.category || "Nutrisi & Pakan",
      description:
        body.description?.trim() ||
        "Konten riset dan edukasi peternakan unggas TanyaTernak.",
      author:
        contentType === "JURNAL"
          ? body.author?.trim() || "Tim Riset TanyaTernak"
          : null,
      source_url:
        contentType === "JURNAL" && body.source_url
          ? body.source_url.trim()
          : null,
      image_url:
        contentType === "FUN_FACT" && body.image_url
          ? body.image_url
          : null,
    };

    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from("documents")
        .insert([newDoc])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ document: data, success: true });
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } catch {
      // Fallback for offline/demo environment
    }

    return NextResponse.json({
      document: {
        id: `doc-${Date.now()}`,
        ...newDoc,
        created_at: nowIso,
        updated_at: nowIso,
      },
      success: true,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Gagal menyimpan konten.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminRole();
  } catch {
    return NextResponse.json(
      { error: "Akses ditolak: Diperlukan hak akses administrator." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID konten wajib diisi." },
        { status: 400 }
      );
    }

    try {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } catch {
      // Fallback if local document
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Gagal menghapus konten.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
