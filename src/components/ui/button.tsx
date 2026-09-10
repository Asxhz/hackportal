import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";
const variants: Record<Variant, string> = {
  primary: "bg-berkeley text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-berkeley-2",
  gold: "bg-gold text-ink hover:bg-gold-2",
  secondary: "border border-line-2 bg-white text-ink hover:border-ink-4 hover:bg-paper",
  ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink",
  danger: "bg-red text-white hover:bg-[#961d16]",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
