import { NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth/session";
import { listApplications, parseFilters } from "@/lib/organizer/queries";
import { STATUS_LABEL } from "@/lib/tracks";

/** CSV export of the current list view. Organizer-only; RLS also enforces it. */
export async function GET(request: Request) {
  await requireOrganizer();
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const rows = await listApplications(parseFilters(sp));

  const esc = (v: unknown) => {
    const s = String(v ?? "");
    // Neutralize spreadsheet formula injection and quote as needed.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const header = ["name", "email", "track", "status", "submitted_at", "reviews", "avg_score"];
  const lines = rows.map((r) => {
    const avg = r.reviews.length ? (r.reviews.reduce((a, b) => a + b.overall, 0) / r.reviews.length).toFixed(2) : "";
    return [r.profile?.full_name, r.profile?.email, r.track, STATUS_LABEL[r.status], r.submitted_at, r.reviews.length, avg].map(esc).join(",");
  });
  const csv = [header.join(","), ...lines].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
