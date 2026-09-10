import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

export const inputClass =
  "w-full rounded-md border border-line-2 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-4 transition-[border-color,box-shadow] focus:border-berkeley-2 focus:outline-none focus:ring-[3px] focus:ring-berkeley-2/15 aria-invalid:border-red aria-invalid:ring-red/15 disabled:bg-paper disabled:text-ink-3";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "min-h-32 resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(inputClass, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </div>
  );
}
