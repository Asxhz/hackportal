import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-berkeley text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 size-[520px] rounded-full bg-gold/25 blur-3xl" />
        <Logo className="relative text-white [&_.eyebrow]:text-white/60" />
        <div className="relative max-w-md space-y-6">
          <p className="display text-[44px] leading-[1.05]">
            One portal for every seat in the room.
          </p>
          <p className="text-[15px] leading-relaxed text-white/70">
            Hackers, judges, mentors and volunteers each get a tailored application. Organizers review
            everything in one place, with a shared rubric and a full audit trail.
          </p>
          <ul className="grid grid-cols-2 gap-3 text-[13px] text-white/80">
            {["Drafts save automatically", "Sessions verified per request", "Row-level security on every table", "Rubric-based scoring"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">Cal Hacks · Hackathon management, condensed.</p>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
