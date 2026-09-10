import { STATUS_LABEL, isAppStatus } from "@/lib/tracks";

type Ev = { id: number; event: string; meta: unknown; created_at: string; actor?: { full_name: string } | null };

function describe(ev: Ev, audience: "applicant" | "organizer") {
  const meta = (ev.meta ?? {}) as Record<string, unknown>;
  switch (ev.event) {
    case "created":
      return "Application started";
    case "status_changed": {
      const to = meta.to;
      if (isAppStatus(to)) {
        if (to === "submitted") return "Submitted";
        if (to === "under_review") return "Review started";
        return `Decision: ${STATUS_LABEL[to]}`;
      }
      return "Status changed";
    }
    case "review_added":
      return audience === "organizer" ? `Review added (overall ${String(meta.overall ?? "?")}/5)` : "Reviewed";
    case "review_updated":
      return audience === "organizer" ? `Review updated (overall ${String(meta.overall ?? "?")}/5)` : "Reviewed";
    default:
      return ev.event;
  }
}

export function Timeline({ events, audience }: { events: Ev[]; audience: "applicant" | "organizer" }) {
  if (events.length === 0) return <p className="text-sm text-ink-4">No activity yet.</p>;
  return (
    <ol className="relative space-y-4 border-l border-line pl-5">
      {events.map((ev) => (
        <li key={ev.id} className="relative text-sm">
          <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-white bg-berkeley-2 shadow-[0_0_0_1px_var(--color-line)]" aria-hidden />
          <p className="font-medium text-ink">{describe(ev, audience)}</p>
          <p className="text-xs text-ink-4">
            <time dateTime={ev.created_at}>{new Date(ev.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</time>
            {audience === "organizer" && ev.actor?.full_name ? ` · ${ev.actor.full_name}` : null}
          </p>
        </li>
      ))}
    </ol>
  );
}
