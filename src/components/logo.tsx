import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: "/" | "/dashboard" | "/organizer" }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 text-ink", className)} aria-label="Cal Hacks Portal home">
      <span className="grid size-7 place-items-center rounded-[7px] bg-berkeley text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6L12 11.5 5.5 7.9 12 4.3ZM5 9.6l6 3.4v6.6l-6-3.3V9.6Zm8 10v-6.6l6-3.4v6.7l-6 3.3Z" />
        </svg>
      </span>
      <span className="display text-[19px] leading-none">Cal Hacks</span>
      <span className="eyebrow mt-0.5">Portal</span>
    </Link>
  );
}
