"use client";

import { useActionState } from "react";
import { decide, submitReview, type ActionState } from "@/lib/organizer/actions";
import type { TrackDef, AppStatus } from "@/lib/tracks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/cn";

export function ReviewPanel({
  applicationId,
  track,
  version,
  status,
  mine,
}: {
  applicationId: string;
  track: TrackDef;
  version: number;
  status: AppStatus;
  mine: { scores: Record<string, number>; overall: number; notes: string } | null;
}) {
  const [rs, reviewAction, reviewing] = useActionState<ActionState, FormData>(submitReview, {});
  const [ds, decideAction, deciding] = useActionState<ActionState, FormData>(decide, {});

  return (
    <>
      <form action={reviewAction} className="card p-5 space-y-5">
        <input type="hidden" name="application_id" value={applicationId} />
        <input type="hidden" name="track" value={track.id} />
        <div className="flex items-baseline justify-between">
          <h2 className="eyebrow">Your review</h2>
          {mine ? <span className="text-xs text-green">Saved</span> : null}
        </div>
        {rs.error ? <Alert tone="error">{rs.error}</Alert> : rs.ok ? <Alert tone="success">{rs.message}</Alert> : null}

        {track.rubric.map((c) => (
          <ScoreRow key={c.key} name={`score_${c.key}`} label={c.label} help={c.help} value={mine?.scores[c.key]} />
        ))}
        <div className="hairline" />
        <ScoreRow name="overall" label="Overall" help="Your gut call, 1–5." value={mine?.overall} emphasis />

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes <span className="font-normal text-ink-4">(internal)</span>
          </label>
          <Textarea id="notes" name="notes" defaultValue={mine?.notes ?? ""} maxLength={4000} className="min-h-24 text-sm" placeholder="What stood out? Anything the committee should know?" />
        </div>
        <Button type="submit" className="w-full" disabled={reviewing}>
          {reviewing ? "Saving…" : mine ? "Update review" : "Save review"}
        </Button>
      </form>

      <form action={decideAction} className="card p-5 space-y-3">
        <input type="hidden" name="application_id" value={applicationId} />
        <input type="hidden" name="version" value={version} />
        <h2 className="eyebrow">Decision</h2>
        {ds.error ? <Alert tone="error">{ds.error}</Alert> : ds.ok ? <Alert tone="success">{ds.message}</Alert> : null}
        <div className="grid grid-cols-3 gap-2">
          <DecisionButton value="accepted" current={status} disabled={deciding} className="border-green/40 text-green hover:bg-green-soft data-[active=true]:bg-green data-[active=true]:text-white">
            Accept
          </DecisionButton>
          <DecisionButton value="waitlisted" current={status} disabled={deciding} className="border-amber/40 text-amber hover:bg-amber-soft data-[active=true]:bg-amber data-[active=true]:text-white">
            Waitlist
          </DecisionButton>
          <DecisionButton value="rejected" current={status} disabled={deciding} className="border-red/40 text-red hover:bg-red-soft data-[active=true]:bg-red data-[active=true]:text-white">
            Reject
          </DecisionButton>
        </div>
        {status !== "submitted" && status !== "under_review" ? (
          <button type="submit" name="status" value="under_review" disabled={deciding} className="w-full text-xs text-ink-4 underline-offset-2 hover:underline">
            Reopen for review
          </button>
        ) : null}
        <p className="text-xs leading-relaxed text-ink-4">Decisions are visible to the applicant immediately and recorded in the timeline.</p>
      </form>
    </>
  );
}

function DecisionButton({ value, current, children, className, disabled }: { value: AppStatus; current: AppStatus; children: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={disabled}
      data-active={current === value}
      className={cn("h-9 rounded-md border bg-white text-sm font-medium transition disabled:opacity-50", className)}
    >
      {children}
    </button>
  );
}

function ScoreRow({ name, label, help, value, emphasis }: { name: string; label: string; help: string; value?: number; emphasis?: boolean }) {
  return (
    <fieldset>
      <legend className={cn("text-sm", emphasis ? "font-semibold" : "font-medium")}>{label}</legend>
      <p className="mb-2 text-xs text-ink-4">{help}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={name} value={n} defaultChecked={value === n} required className="peer sr-only" />
            <span className="grid h-9 place-items-center rounded-md border border-line-2 bg-white text-sm tabular-nums transition peer-checked:border-berkeley peer-checked:bg-berkeley peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-berkeley-2 hover:border-ink-4">
              {n}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
