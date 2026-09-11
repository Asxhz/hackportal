import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { buttonClass } from "@/components/ui/button";
import { ACCOUNT_TYPES, TRACKS } from "@/lib/tracks";
import { getSessionUser } from "@/lib/auth/session";
import heroFloor from "@/images/hero-floor.jpg";
import teamTable from "@/images/team-table.jpg";
import teamLaptops from "@/images/team-laptops.jpg";
import lectureHall from "@/images/lecture-hall.jpg";
import nightCode from "@/images/night-code.jpg";

const TRACK_IMAGE = { hacker: nightCode, judge: lectureHall, mentor: teamTable, volunteer: teamLaptops } as const;

const FACTS = [
  { k: "36", v: "hours of hacking" },
  { k: "2,000+", v: "hackers expected" },
  { k: "$100k", v: "in prizes" },
  { k: "SF", v: "Palace of Fine Arts" },
];

const STEPS = [
  { n: "1", t: "Create an account", d: "Pick hacker, judge, mentor or volunteer. You can change it until you submit." },
  { n: "2", t: "Fill out your application", d: "Drafts save as you type. Come back on any device and pick up where you left off." },
  { n: "3", t: "Check your status here", d: "Organizers review with a shared rubric. Your decision shows on your dashboard the moment it's made." },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo className="text-white [&_.eyebrow]:text-white/60" />
          <nav className="flex items-center gap-2 text-sm" aria-label="Site">
            <a href="https://calhacks.io" target="_blank" rel="noopener noreferrer" className="hidden rounded-md px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex">
              calhacks.io
            </a>
            <Suspense fallback={<span className="h-8 w-20 rounded-md bg-white/10" />}>
              <HeaderAction />
            </Suspense>
          </nav>
        </div>
      </header>

      <section className="relative isolate flex min-h-[92dvh] items-end overflow-hidden bg-ink text-white">
        <Image
          src={heroFloor}
          alt="Hackers working on laptops on a dim hackathon floor lit in blue and pink"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-40">
          <p className="eyebrow mb-4 text-gold">Cal Hacks 13.0 · Applications</p>
          <h1 className="display max-w-3xl text-[52px] leading-[1.02] sm:text-[80px]">Apply to Cal Hacks.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            Hackers, judges, mentors and volunteers all apply through this portal. Applications are reviewed by the Hackathons @ Berkeley team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonClass("gold", "lg")}>
              Start an application
            </Link>
            <Link href="/login" className={buttonClass("secondary", "lg", "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50")}>
              Sign in
            </Link>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 sm:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.v}>
                <dt className="display text-[32px] leading-none">{f.k}</dt>
                <dd className="mt-1 text-sm text-white/60">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Four ways to be there</p>
            <h2 className="display text-[36px] leading-none">Choose your application</h2>
          </div>
          <p className="max-w-md text-sm text-ink-3">Each role has its own short form. Most take under ten minutes.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACCOUNT_TYPES.map((t) => (
            <Link key={t} href={`/signup?as=${t}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-pop">
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                <Image src={TRACK_IMAGE[t]} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-5">
                <h3 className="display text-[24px] leading-none">{TRACKS[t].plural}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">{TRACKS[t].description}</p>
                <p className="mt-4 text-sm font-medium text-berkeley-2">Apply as a {TRACKS[t].label.toLowerCase()} →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow mb-2">How it works</p>
            <h2 className="display text-[36px] leading-none">Three steps</h2>
            <ol className="mt-8 space-y-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="display grid size-9 shrink-0 place-items-center rounded-full bg-berkeley text-[18px] text-gold">{s.n}</span>
                  <div>
                    <p className="font-semibold">{s.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-3">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg shadow-pop">
            <Image src={teamTable} alt="A team of students working together around a table of laptops" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="eyebrow mb-2">Deadlines</p>
            <p className="display text-[24px]">Priority: September 13</p>
            <p className="display text-[24px]">Regular: September 20</p>
            <p className="mt-2 text-sm text-ink-3">Dates published on calhacks.io. Priority applicants hear back first.</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Who can apply</p>
            <p className="text-sm leading-relaxed text-ink-2">Hackers must be currently enrolled students or within 12 months of graduation, per MLH eligibility. Judges, mentors and volunteers have no student requirement.</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Questions</p>
            <p className="text-sm leading-relaxed text-ink-2">
              Email <a className="link" href="mailto:team@hackberkeley.org">team@hackberkeley.org</a>. For sponsorship, <a className="link" href="mailto:sponsorship@hackberkeley.org">sponsorship@hackberkeley.org</a>.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

async function HeaderAction() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <Link href="/login" className={buttonClass("gold", "sm")}>
        Sign in
      </Link>
    );
  }
  return (
    <Link href={user.role === "organizer" ? "/organizer" : "/dashboard"} className={buttonClass("gold", "sm")}>
      {user.role === "organizer" ? "Review desk" : "My application"} →
    </Link>
  );
}
