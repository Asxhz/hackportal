/** Soft lavender / sky-blue glows on navy with a grain overlay. Decorative only. */
export function Glow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`grain pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-sky-navy ${className}`}>
      <div className="anim-blob absolute -left-[20%] -top-[30%] h-[70vh] w-[70vw] rounded-full bg-sky-lavender/25 blur-[120px]" />
      <div className="anim-blob absolute -right-[15%] top-[10%] h-[60vh] w-[55vw] rounded-full bg-sky-blue/20 blur-[120px]" style={{ animationDelay: "-8s" }} />
      <div className="anim-blob absolute bottom-[-20%] left-[20%] h-[50vh] w-[60vw] rounded-full bg-sky-teal/25 blur-[140px]" style={{ animationDelay: "-15s" }} />
    </div>
  );
}
