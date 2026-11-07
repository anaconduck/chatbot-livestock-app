import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/server/authorization";

export const dynamic = "force-dynamic";

export interface DailyVisitPoint {
  dateKey: string;
  label: string;
  fullDate: string;
  visits: number;
}

function buildLast7DaysBuckets(rows: Array<{ created_at?: string }>): DailyVisitPoint[] {
  const today = new Date();
  const buckets: DailyVisitPoint[] = [];
  const countMap = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    countMap.set(key, 0);

    const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
    const dayNum = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const fullDate = d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    buckets.push({
      dateKey: key,
      label: i === 0 ? `Hari Ini (${dayNum})` : `${dayName}, ${dayNum}`,
      fullDate,
      visits: 0,
    });
  }

  for (const row of rows) {
    if (!row.created_at) continue;
    const dt = new Date(row.created_at);
    if (isNaN(dt.getTime())) continue;
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    if (countMap.has(key)) {
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }
  }

  return buckets.map((b) => ({
    ...b,
    visits: countMap.get(b.dateKey) || 0,
  }));
}

export async function GET() {
  try {
    await requireAdminRole();
  } catch {
    return NextResponse.json(
      { error: "Akses administrator diperlukan." },
      { status: 403 }
    );
  }

  try {
    const adminClient = createAdminClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [viewsCountRes, recentViewsRes, profilesRes, docsRes] = await Promise.all([
      adminClient.from("page_views").select("*", { count: "exact", head: true }),
      adminClient
        .from("page_views")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString()),
      adminClient.from("profiles").select("*", { count: "exact", head: true }),
      adminClient.from("documents").select("*", { count: "exact", head: true }),
    ]);

    const dailyVisits = buildLast7DaysBuckets(recentViewsRes.data || []);

    return NextResponse.json({
      totalVisits: viewsCountRes.count ?? 0,
      totalUsers: profilesRes.count ?? 0,
      totalDocuments: docsRes.count ?? 0,
      dailyVisits,
    });
  } catch (error: unknown) {
    console.error("Error fetching admin stats from Supabase:", error);
    return NextResponse.json({
      totalVisits: 0,
      totalUsers: 0,
      totalDocuments: 0,
      dailyVisits: buildLast7DaysBuckets([]),
    });
  }
}
