"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Abaikan jika membuka halaman admin, api, atau file sistem
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next")
    ) {
      return;
    }

    // 2. Cek apakah pengunjung ini SUDAH dicatat dalam sesi ini
    // (Jika sudah pernah dicatat, jangan dicatat lagi walaupun dia klik halaman lain)
    const hasBeenLoggedThisSession = sessionStorage.getItem("tanyapeternakan_visited_session") || sessionStorage.getItem("tanyaternak_visited_session");
    if (hasBeenLoggedThisSession) {
      return;
    }

    // 3. Buat atau ambil Visitor ID permanen di browser ini
    let visitorId = localStorage.getItem("tanyapeternakan_visitor_id") || localStorage.getItem("tanyaternak_visitor_id");
    if (!visitorId) {
      visitorId = "vis_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("tanyaternak_visitor_id", visitorId);
      localStorage.setItem("tanyapeternakan_visitor_id", visitorId);
    }

    // 4. Catat 1 kunjungan ke Supabase
    try {
      fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          visitorId,
        }),
      })
        .then((res) => {
          if (res.ok) {
            // Tandai bahwa sesi kunjungan ini sudah berhasil tercatat
            sessionStorage.setItem("tanyaternak_visited_session", "true");
            sessionStorage.setItem("tanyapeternakan_visited_session", "true");
          }
        })
        .catch(() => {});
    } catch {
      // Ignore network errors
    }
  }, [pathname]);

  return null;
}
