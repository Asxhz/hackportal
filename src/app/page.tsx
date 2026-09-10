import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { ACCOUNT_TYPES, TRACKS } from "@/lib/tracks";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Landing page. Everything outside <Suspense> is prerendered into a static shell;
 * only the tiny session-aware header action streams in per request.
 */
export default function HomePage() {
  return (
    <div className="relative isolate min-h-dvh">
      <div className="paper-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Suspense fallback={<span className="h-9 w-24 rounded-md bg-paper-2" />}>
          <HeaderAction />
        </Suspense>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="rise pt-16 pb-20 sm:pt-24">
          <p className="eyebrow mb-5">Fall 2026 · UC Berkeley</p>
          <h1 className="display max-w-3xl text-[52px] leading-[1.02] sm:text-[72px]">
            Thirty-six hours. <span className="italic text-berkeley-2">One portal.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Apply to hack, judge, mentor or volunteer at the largest collegiate hackathon in the world. Drafts save
            as you type. Decisions land right here.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonClass("primary", "lg")}>
              Start an application
            </Link>
            <Link href="/login" className={buttonClass("secondary", "lg")}>
              Sign in
            </Link>
          </div>
        </section>

        <section className="rise-2 pb-24">
          <div className="hairline mb-10" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACCOUNT_TYPES.map((t, i) => (
              <Link
                key={t}
                href={`/signup?as=${t}`}
                className="card group relative flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-pop"
              >
                <span className="font-mono text-[11px] text-ink-4">0{i + 1}</span>
                <span className="display text-[26px] leading-none">{TRACKS[t].plural}</span>
                <span className="text-sm leading-relaxed text-ink-3">{TRACKS[t].description}</span>
                <span className="mt-auto pt-2 text-sm font-medium text-berkeley-2 opacity-0 transition group-hover:opacity-100">
                  Apply as a {TRACKS[t].label.toLowerCase()} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-ink-4">
        <span>© Cal Hacks</span>
        <span>Built with Next.js, Supabase and Postgres row-level security.</span>
      </footer>
    </div>
  );
}

async function HeaderAction() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <Link href="/login" className={buttonClass("ghost", "sm")}>
        Sign in
      </Link>
    );
  }
  return (
    <Link href={user.role === "organizer" ? "/organizer" : "/dashboard"} className={buttonClass("secondary", "sm")}>
      Open {user.role === "organizer" ? "review desk" : "dashboard"} →
    </Link>
  );
}
