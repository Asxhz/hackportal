import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireOrganizer } from "@/lib/auth/session";
import { getApplicationDetail } from "@/lib/organizer/queries";
import { goToNextUnreviewed } from "@/lib/organizer/actions";
import { TRACKS } from "@/lib/tracks";
import { emptyAnswers } from "@/lib/tracks/fields";
import { PageHeader } from "@/components/portal/shell";
import { AnswersView } from "@/components/portal/answers";
import { Timeline } from "@/components/portal/timeline";
import { StatusBadge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewPanel } from "./review-panel";

export const metadata: Metadata = { title: "Review" };

export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-paper-2" />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireOrganizer();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const app = await getApplicationDetail(id);
  if (!app) notFound();

  const track = TRACKS[app.track];
  const answers = { ...emptyAnswers(track.sections), ...((app.answers as Record<string, unknown>) ?? {}) };
  const mine = app.reviews.find((r) => r.reviewer_id === user.id) ?? null;
  const others = app.reviews.filter((r) => r.reviewer_id !== user.id);
  const avg = app.reviews.length ? app.reviews.reduce((a, r) => a + r.overall, 0) / app.reviews.length : null;

  return (
    <>
      <p className="mb-4 text-sm">
        <Link href="/organizer" className="link">
          ← All applications
        </Link>
      </p>
      <PageHeader
        eyebrow={`${track.label} · ${app.profile?.email ?? ""}`}
        title={app.profile?.full_name || "Unnamed applicant"}
        actions={
          <>
            <StatusBadge status={app.status} />
            <form action={goToNextUnreviewed}>
              <input type="hidden" name="track" value={app.track} />
              <Button type="submit" size="sm" variant="gold">
                Next unreviewed →
              </Button>
            </form>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card rise-2 p-6 sm:p-8">
            <AnswersView sections={track.sections} answers={answers} />
          </section>
          <section className="card rise-3 p-6">
            <h2 className="eyebrow mb-4">Timeline</h2>
            <Timeline events={app.events} audience="organizer" />
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ReviewPanel
            applicationId={app.id}
            track={track}
            version={app.version}
            status={app.status}
            mine={mine ? { scores: mine.scores as Record<string, number>, overall: mine.overall, notes: mine.notes } : null}
          />
          <section className="card p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="eyebrow">Other reviews</h2>
              {avg !== null ? (
                <span className="text-sm text-ink-3">
                  Avg <span className="font-semibold text-ink">{avg.toFixed(1)}</span> / 5
                </span>
              ) : null}
            </div>
            {others.length === 0 ? (
              <p className="text-sm text-ink-4">No other reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {others.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.reviewer?.full_name || r.reviewer?.email}</span>
                      <Chip>{r.overall}/5</Chip>
                    </div>
                    {r.notes ? <p className="mt-1 whitespace-pre-wrap text-ink-3">{r.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
