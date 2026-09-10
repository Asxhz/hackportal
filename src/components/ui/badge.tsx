import { cn } from "@/lib/cn";
import type { AppStatus } from "@/lib/tracks";
import { STATUS_LABEL } from "@/lib/tracks";

const tone: Record<AppStatus, string> = {
  draft: "bg-slate-soft text-slate",
  submitted: "bg-gold-soft text-amber",
  under_review: "bg-[#e3ecf7] text-berkeley-2",
  accepted: "bg-green-soft text-green",
  waitlisted: "bg-amber-soft text-amber",
  rejected: "bg-red-soft text-red",
};

export function StatusBadge({ status, className }: { status: AppStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", tone[status], className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-line bg-paper px-2.5 py-0.5 text-xs font-medium text-ink-2", className)}>
      {children}
    </span>
  );
}
