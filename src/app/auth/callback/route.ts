import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        const user = data.user;
        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Pengguna TanyaTernak";
        const googleAvatar =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        // Periksa profil di tabel profiles, buat otomatis jika belum ada
        let role = "USER";
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, role, full_name")
          .eq("id", user.id)
          .single();

        if (existingProfile) {
          role = existingProfile.role || "USER";
          if (!existingProfile.full_name && googleName) {
            await supabase
              .from("profiles")
              .update({
                full_name: googleName,
                avatar_url: googleAvatar,
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id);
          }
        } else {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email || "",
            full_name: googleName,
            avatar_url: googleAvatar,
            role: "USER",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        const targetPath =
          role === "ADMIN"
            ? "/admin"
            : next.startsWith("/")
            ? next
            : "/";

        const response = NextResponse.redirect(`${origin}${targetPath}`);
        response.cookies.set("tanyaternak_role", role, {
          path: "/",
          maxAge: 60 * 60 * 24,
          sameSite: "lax",
        });
        return response;
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Gagal masuk dengan Google. Pastikan Google OAuth sudah diaktifkan di Supabase."
    )}`
  );
}

