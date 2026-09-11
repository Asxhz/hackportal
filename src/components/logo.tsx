import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Wordmark. A gold square with a bold "C" cut by a diagonal (a nod to the
 * Berkeley "C" and to the diagonal of a hackathon's 36-hour countdown), then
 * "Cal Hacks" set in the display face with a small "Portal" tag.
 */
export function Logo({ className, href = "/" }: { className?: string; href?: "/" | "/dashboard" | "/organizer" }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5 text-ink", className)} aria-label="Cal Hacks Portal home">
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-[9px] bg-gold text-sky-navy shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)] transition group-hover:rotate-[-4deg]">
        <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
          <path d="M22.5 11.2a7.4 7.4 0 1 0 0 9.6" fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M6 27 27 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
        </svg>
      </span>
      <span className="display text-[19px] leading-none tracking-tight">Cal Hacks</span>
      <span className="rounded-full border border-current/25 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">Portal</span>
    </Link>
  );
}
