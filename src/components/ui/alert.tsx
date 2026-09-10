import { cn } from "@/lib/cn";

export function Alert({ tone = "info", children, className }: { tone?: "info" | "error" | "success"; children: React.ReactNode; className?: string }) {
  const tones = {
    info: "border-line bg-paper text-ink-2",
    error: "border-red/30 bg-red-soft text-red",
    success: "border-green/30 bg-green-soft text-green",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-md border px-3.5 py-2.5 text-sm", tones[tone], className)}>
      {children}
    </div>
  );
}
