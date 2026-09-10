import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/** Label + control + help/error. Keeps every form in the app visually identical. */
export function Field({
  id,
  label,
  help,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-ink">
        <span>
          {label}
          {required ? <span className="ml-1 text-gold-2" aria-hidden>*</span> : null}
        </span>
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-red">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="text-[13px] text-ink-3">
          {help}
        </p>
      ) : null}
    </div>
  );
}
