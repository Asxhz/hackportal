import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { getMyApplication, getMyTimeline } from "@/lib/applications/queries";
import { TRACKS, STATUS_LABEL } from "@/lib/tracks";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/portal/shell";
import { Timeline } from "@/components/portal/timeline";

export const metadata: Metadata = { title: "Overview" };

type SP = Promise<{ submitted?: string }>;

export default function DashboardPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}

const STATUS_COPY: Record<string, string> = {
  draft: "You've started but not submitted. Finish when you're ready — nothing is sent until you hit submit.",
  submitted: "Received. An organizer will review it soon.",
  under_review: "Organizers are reading it now.",
  accepted: "You're in. Watch your inbox for logistics.",
  waitlisted: "You're on the waitlist. We'll let you know as spots open up.",
  rejected: "We couldn't offer you a spot this time. Thank you for applying.",
};

async function Overview({ searchParams }: { searchParams: SP }) {
  const [sp, user, app] = await Promise.all([searchParams, requireUser("/dashboard"), getMyApplication()]);
  const track = TRACKS[user.accountType];
  const events = app ? await getMyTimeline(app.id) : [];

  return (
    <>
      {sp.submitted ? (
        <Alert tone="success" className="rise mb-6">
          Your application is in. We&apos;ll email you when there&apos;s a decision; you can also check back here any time.
        </Alert>
      ) : null}
      <PageHeader eyebrow={`${track.label} application`} title={app ? STATUS_LABEL[app.status] : "Not started"} description={app ? STATUS_COPY[app.status] : `Your ${track.label.toLowerCase()} application takes about ten minutes. Drafts save automatically.`} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card rise-2 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="display text-[24px]">{track.label}</h2>
              <p className="mt-1 text-sm text-ink-3">{track.description}</p>
            </div>
            {app ? <StatusBadge status={app.status} /> : null}
          </div>
          <div className="hairline my-6" />
          {!app || app.status === "draft" ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/apply" className={buttonClass("primary", "md")}>
                {app ? "Continue application" : "Start application"}
              </Link>
              <span className="text-sm text-ink-3">{track.sections.reduce((n, s) => n + s.fields.length, 0)} questions across {track.sections.length} sections</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/apply" className={buttonClass("secondary", "md")}>
                View submitted answers
              </Link>
              {app.submitted_at ? (
                <span className="text-sm text-ink-3">
                  Submitted {new Date(app.submitted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </span>
              ) : null}
            </div>
          )}
        </section>
        <aside className="card rise-3 p-6">
          <h2 className="eyebrow mb-4">Activity</h2>
          <Timeline events={events} audience="applicant" />
        </aside>
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 w-72 rounded-md bg-paper-2" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-48 rounded-lg bg-paper-2" />
        <div className="h-48 rounded-lg bg-paper-2" />
      </div>
    </div>
  );
}
