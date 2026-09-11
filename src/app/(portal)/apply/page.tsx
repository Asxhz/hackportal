import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { getOrCreateMyApplication } from "@/lib/applications/queries";
import { TRACKS } from "@/lib/tracks";
import { emptyAnswers } from "@/lib/tracks/fields";
import { PageHeader } from "@/components/portal/shell";
import { AnswersView } from "@/components/portal/answers";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ApplicationForm } from "./application-form";

export const metadata: Metadata = { title: "Application" };

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-paper-2" />}>
      <Apply />
    </Suspense>
  );
}

async function Apply() {
  const user = await requireUser("/apply");
  const app = await getOrCreateMyApplication(user.id);

  const track = TRACKS[app.track];
  const answers = { ...emptyAnswers(track.sections), ...((app.answers as Record<string, unknown>) ?? {}) };

  if (app.status !== "draft") {
    return (
      <>
        <PageHeader
          eyebrow={`${track.label} application`}
          title="Your answers"
          description="Submitted applications cannot be edited. To correct something, email team@hackberkeley.org."
          actions={<StatusBadge status={app.status} />}
        />
        <div className="card rise-2 p-6 sm:p-8">
          <AnswersView sections={track.sections} answers={answers} />
        </div>
        <p className="mt-6 text-sm text-ink-3">
          <Link href="/dashboard" className="link">
            ← Back to overview
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`${track.label} application`}
        title={track.tagline}
        description="Answers save as you type. Submit when every required field is complete."
        actions={
          user.accountType !== app.track ? (
            <Link href="/account" className={buttonClass("secondary", "sm")}>
              Role changed? Update it
            </Link>
          ) : null
        }
      />
      <ApplicationForm track={track} initial={answers} version={app.version} updatedAt={app.updated_at} />
    </>
  );
}
