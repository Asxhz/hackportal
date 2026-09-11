import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireOrganizer } from "@/lib/auth/session";
import { getStats, listApplications, parseFilters } from "@/lib/organizer/queries";
import { goToNextUnreviewed } from "@/lib/organizer/actions";
import { TRACKS } from "@/lib/tracks";
import { PageHeader } from "@/components/portal/shell";
import { StatusBadge, Chip } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Filters } from "./filters";

export const metadata: Metadata = { title: "Applications" };

type SP = Record<string, string | string[] | undefined>;

export default function OrganizerHome({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-paper-2" />}>
      <Desk searchParams={searchParams} />
    </Suspense>
  );
}

async function Desk({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]).toString();

  return (
    <>
      <PageHeader
        eyebrow="Review desk"
        title="Applications"
        description="All submitted applications with review scores."
        actions={
          <>
            <a href={`/api/organizer/export${qs ? `?${qs}` : ""}`} className={buttonClass("secondary", "sm")}>
              Export CSV
            </a>
            <form action={goToNextUnreviewed}>
              {filters.track ? <input type="hidden" name="track" value={filters.track} /> : null}
              <Button type="submit" size="sm" variant="gold">
                Review next →
              </Button>
            </form>
          </>
        }
      />
      {sp.done ? <Alert tone="success" className="mb-6">You have reviewed every application in this queue.</Alert> : null}

      <Suspense fallback={<div className="mb-6 h-20 animate-pulse rounded-lg bg-paper-2" />}>
        <Stats />
      </Suspense>

      <Filters filters={filters} />

      <Suspense fallback={<TableSkeleton />}>
        <Table filters={filters} />
      </Suspense>
    </>
  );
}

async function Stats() {
  await requireOrganizer();
  const stats = await getStats();
  const tiles = [
    { label: "Submitted", value: stats.total },
    { label: "Awaiting review", value: stats.byStatus.submitted ?? 0 },
    { label: "In review", value: stats.byStatus.under_review ?? 0 },
    { label: "Accepted", value: stats.byStatus.accepted ?? 0 },
    { label: "Waitlisted", value: stats.byStatus.waitlisted ?? 0 },
    { label: "Not accepted", value: stats.byStatus.rejected ?? 0 },
  ];
  return (
    <div className="rise-2 mb-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-6">
      {tiles.map((t) => (
        <div key={t.label} className="bg-white px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-4">{t.label}</p>
          <p className="display mt-0.5 text-[28px] leading-none tabular-nums">{t.value}</p>
        </div>
      ))}
    </div>
  );
}

async function Table({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const user = await requireOrganizer();
  const rows = await listApplications(filters);
  if (rows.length === 0) {
    return (
      <div className="card rise-3 grid place-items-center px-6 py-16 text-center">
        <p className="display text-[22px]">No applications match</p>
        <p className="mt-1 text-sm text-ink-3">Clear a filter or check back after the deadline.</p>
      </div>
    );
  }
  return (
    <div className="card rise-3 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-paper text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          <tr>
            <th className="px-4 py-2.5">Applicant</th>
            <th className="px-4 py-2.5">Track</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Submitted</th>
            <th className="px-4 py-2.5 text-right">Score</th>
            <th className="px-4 py-2.5 text-right">Reviews</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => {
            const avg = r.reviews.length ? r.reviews.reduce((a, b) => a + b.overall, 0) / r.reviews.length : null;
            const mine = r.reviews.some((x) => x.reviewer_id === user.id);
            return (
              <tr key={r.id} className="group transition hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/organizer/applications/${r.id}`} className="font-medium text-ink group-hover:text-berkeley-2">
                    {r.profile?.full_name || "—"}
                  </Link>
                  <p className="text-xs text-ink-4">{r.profile?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Chip>{TRACKS[r.track].label}</Chip>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-ink-3 tabular-nums">{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{avg !== null ? <span className="font-semibold">{avg.toFixed(1)}</span> : <span className="text-ink-4">—</span>}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {r.reviews.length}
                  {mine ? <span className="ml-1.5 text-[11px] font-semibold text-green">you</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return <div className="h-72 animate-pulse rounded-lg bg-paper-2" />;
}

