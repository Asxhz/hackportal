import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { Glow } from "@/components/glow";
import { Reveal } from "@/components/reveal";
import { buttonClass } from "@/components/ui/button";
import { ACCOUNT_TYPES, TRACKS } from "@/lib/tracks";
import { getSessionUser } from "@/lib/auth/session";
import mlhBadge from "@/images/ch/mlh-badge.svg";
import palaceNight from "@/images/ch/palace-night.webp";
import palaceDusk from "@/images/ch/palace-dusk.webp";
import p423 from "@/images/ch/photo-423.webp";
import p425 from "@/images/ch/photo-425.webp";
import p426 from "@/images/ch/photo-426.webp";
import p429 from "@/images/ch/photo-429.webp";
import p431 from "@/images/ch/photo-431.webp";
import p434 from "@/images/ch/photo-434.webp";
import p435 from "@/images/ch/photo-435.webp";
import p436 from "@/images/ch/photo-436.webp";
import p437 from "@/images/ch/photo-437.webp";
import floor2014 from "@/images/ch/2014-hacking-floor.webp";
import organizers2014 from "@/images/ch/2014-organizers.webp";
import sudo2014 from "@/images/ch/2014-sudo-hack-group.webp";

const STRIP = [p423, p425, p426, p429, p431, p434, p435, p436, p437];
const TRACK_PHOTO = { hacker: p429, judge: p431, mentor: p437, volunteer: p434 } as const;

const TICKER = ["October 23 to 25, 2026", "Palace of Fine Arts, San Francisco", "36 hours", "2,000+ hackers", "$100,000 in prizes", "MLH official 2027 season"];

const TIMELINE = [
  { d: "Sep 13", t: "Priority deadline", s: "Apply by this date to hear back first." },
  { d: "Sep 17", t: "Priority decisions", s: "Released to priority applicants." },
  { d: "Sep 20", t: "Regular deadline", s: "Final day to submit any application." },
  { d: "Sep 25", t: "Regular decisions", s: "All remaining decisions released." },
  { d: "Oct 23", t: "Doors open", s: "Check-in at the Palace of Fine Arts." },
];

export default function HomePage() {
  return (
    <div className="relative min-h-dvh bg-sky-navy text-white">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:pr-36">
          <a href="https://hackberkeley.org" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-sky-lavender hover:text-white">
            Hackathons @ Berkeley
          </a>
          <nav className="flex items-center gap-1 text-[13px] font-semibold text-sky-ice/80 sm:gap-3" aria-label="Site">
            <a href="#roles" className="hidden px-2 py-1 hover:text-white md:inline">Roles</a>
            <a href="#dates" className="hidden px-2 py-1 hover:text-white md:inline">Dates</a>
            <a href="#venue" className="hidden px-2 py-1 hover:text-white md:inline">Venue</a>
            <a href="https://calhacks.io" target="_blank" rel="noopener noreferrer" className="hidden px-2 py-1 hover:text-white md:inline">calhacks.io ↗</a>
            <Link href="/login" className="px-2 py-1 hover:text-white">Sign in</Link>
            <Suspense fallback={<span className="h-9 w-24 rounded-full bg-sky-ice/30" />}>
              <HeaderAction />
            </Suspense>
          </nav>
        </div>
        <a href="https://mlh.io/seasons/2027/events" target="_blank" rel="noopener noreferrer" className="absolute right-6 top-0 hidden w-[84px] lg:block" aria-label="MLH Official 2027 Season">
          <Image src={mlhBadge} alt="MLH Official 2027 Season" width={84} height={146} priority />
        </a>
      </header>

      {/* Hero: photo of the venue at night, editorial type, floating polaroids of last year */}
      <section className="relative isolate overflow-hidden">
        <Image src={palaceNight} alt="" aria-hidden fill priority placeholder="blur" sizes="100vw" className="-z-20 object-cover object-center opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-navy/70 via-sky-navy/60 to-sky-navy" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-32 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-20 lg:pt-36">
          <div className="rise">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-lavender/40 bg-sky-navy/60 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-sky-lavender backdrop-blur">
              <span className="relative flex size-2">
                <span className="anim-pulse-ring absolute inset-0 rounded-full bg-sky-green" />
                <span className="relative size-2 rounded-full bg-sky-green" />
              </span>
              Applications open
            </p>
            <h1 className="display text-[56px] leading-[0.98] sm:text-[84px]">
              Cal Hacks <span className="text-sky-blue">13.0</span>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-sky-ice/90">
              Thirty-six hours at the Palace of Fine Arts with two thousand builders. Hackers, judges, mentors and volunteers apply here. Decisions show up on your dashboard, not buried in email.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup?as=hacker" className={buttonClass("secondary", "lg", "rounded-full border-0 bg-sky-ice text-sky-navy hover:bg-white")}>
                Apply as a hacker
              </Link>
              <Link href="/signup" className={buttonClass("secondary", "lg", "rounded-full border-sky-ice/30 bg-white/5 text-white hover:border-sky-ice/60 hover:bg-white/10")}>
                Judge, mentor or volunteer
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
              {[["Oct 23-25", "2026"], ["Sep 13", "priority deadline"], ["Sep 20", "regular deadline"]].map(([k, v]) => (
                <div key={v}>
                  <dt className="display text-[26px] leading-none text-white">{k}</dt>
                  <dd className="mt-1 text-[13px] text-sky-ice/70">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[500px]" aria-label="Photos from Cal Hacks 12.0">
            <figure className="polaroid tilt anim-float absolute left-[4%] top-[6%] w-[54%] rotate-[-7deg]" style={{ "--r": "-7deg", animationDelay: "-2s" } as React.CSSProperties}>
              <Image src={p429} alt="The hacking floor at Cal Hacks 12.0" sizes="280px" className="aspect-[4/3] w-full rounded-[8px] object-cover" />
              <figcaption className="mt-2 text-center text-[12px] text-ink-3">the floor, hour 20</figcaption>
            </figure>
            <figure className="polaroid tilt anim-float absolute right-[2%] top-[0%] w-[46%] rotate-[6deg]" style={{ "--r": "6deg", animationDelay: "-5s" } as React.CSSProperties}>
              <Image src={p426} alt="A hacker giving two thumbs up" sizes="240px" className="aspect-[4/3.6] w-full rounded-[8px] object-cover" />
              <figcaption className="mt-2 text-center text-[12px] text-ink-3">check-in</figcaption>
            </figure>
            <figure className="polaroid tilt anim-float absolute bottom-[2%] left-[22%] w-[52%] rotate-[2deg]" style={{ "--r": "2deg", animationDelay: "-9s" } as React.CSSProperties}>
              <Image src={p437} alt="Two hackers debugging together at a laptop" sizes="270px" className="aspect-[4/3] w-full rounded-[8px] object-cover" />
              <figcaption className="mt-2 text-center text-[12px] text-ink-3">3am, still going</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="relative overflow-hidden border-y border-white/10 bg-sky-navy-2 py-3">
        <div className="anim-ticker flex w-max gap-10 whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.14em] text-sky-ice/80">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-10">
              {t}
              <span className="size-1.5 rounded-full bg-sky-lavender" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      {/* Roles: full-bleed photo tiles */}
      <section id="roles" className="relative isolate scroll-mt-20 py-24">
        <Glow />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2 text-sky-lavender">Four applications</p>
              <h2 className="display text-[40px] leading-none sm:text-[52px]">Pick the seat you want.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-sky-ice/70">Each role has its own form. Most take under ten minutes, and drafts save as you type.</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACCOUNT_TYPES.map((t, i) => (
              <Reveal key={t} delay={i * 90}>
                <Link href={`/signup?as=${t}`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-sky-navy-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
                  <Image src={TRACK_PHOTO[t]} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-navy via-sky-navy/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-lavender">0{i + 1}</p>
                    <h3 className="display mt-1 text-[32px] leading-none">{TRACKS[t].plural}</h3>
                    <p className="mt-2 max-h-0 overflow-hidden text-sm leading-relaxed text-sky-ice/80 transition-all duration-500 group-hover:max-h-24">{TRACKS[t].description}</p>
                    <p className="mt-3 text-[13px] font-semibold text-sky-blue">Apply →</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="relative overflow-hidden bg-sky-navy-2 py-14">
        <Reveal className="mx-auto mb-8 flex max-w-7xl items-end justify-between px-6">
          <h2 className="display text-[32px] leading-none">Cal Hacks 12.0, October 2025</h2>
          <p className="hidden text-sm text-sky-ice/60 sm:block">Photos by the Hackathons @ Berkeley team</p>
        </Reveal>
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="anim-marquee flex w-max gap-4 pr-4">
            {[...STRIP, ...STRIP].map((p, i) => (
              <Image key={i} src={p} alt={i < STRIP.length ? "Attendees at Cal Hacks 12.0" : ""} height={240} sizes="320px" className="h-[240px] w-auto shrink-0 rounded-xl object-cover" />
            ))}
          </div>
        </div>
      </section>

      {/* Dates + how it works */}
      <section id="dates" className="scroll-mt-20 bg-paper text-sky-navy">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2 text-sky-teal">Dates</p>
              <h2 className="display text-[40px] leading-none">Two rounds. One portal.</h2>
            </div>
            <p className="max-w-sm text-sm text-ink-3">Apply in the priority round to hear back a week earlier. Both rounds use the same form.</p>
          </Reveal>
          <Reveal>
            <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-5">
              {TIMELINE.map((x, i) => (
                <li key={x.t} className="bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-teal">Step {i + 1}</p>
                  <p className="display mt-2 text-[28px] leading-none">{x.d}</p>
                  <p className="mt-2 font-semibold">{x.t}</p>
                  <p className="mt-1 text-sm text-ink-3">{x.s}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <Reveal delay={80} className="card p-6">
              <p className="eyebrow mb-4 text-sky-teal">How the portal works</p>
              <ol className="space-y-5">
                {[
                  ["Create an account", "Pick hacker, judge, mentor or volunteer. You can change it until you submit."],
                  ["Fill out your application", "Drafts save as you type. Come back on any device and pick up where you left off."],
                  ["Check your status here", "Organizers review with a shared rubric. Your decision shows on your dashboard the moment it is made."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="display grid size-9 shrink-0 place-items-center rounded-full bg-sky-navy text-[18px] text-sky-ice">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-3">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={160} className="card p-6">
              <p className="eyebrow mb-4 text-sky-teal">Since 2014</p>
              <div className="grid grid-cols-3 gap-3">
                <Image src={floor2014} alt="The hacking floor at the first Cal Hacks in 2014" loading="eager" sizes="200px" className="aspect-square w-full rounded-lg object-cover" />
                <Image src={organizers2014} alt="Cal Hacks organizers in 2014" loading="eager" sizes="200px" className="aspect-square w-full rounded-lg object-cover" />
                <Image src={sudo2014} alt="The sudo hack team in 2014" loading="eager" sizes="200px" className="aspect-square w-full rounded-lg object-cover" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                The first Cal Hacks filled Memorial Stadium in 2014. It is now run by Hackathons @ Berkeley, a student 501(c)(3), and takes over the Palace of Fine Arts every fall.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Venue */}
      <section id="venue" className="relative isolate scroll-mt-20 overflow-hidden">
        <Image src={palaceDusk} alt="" aria-hidden fill sizes="100vw" className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-navy via-sky-navy/75 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-28 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-2 text-sky-lavender">Venue</p>
            <h2 className="display text-[40px] leading-none sm:text-[52px]">Palace of Fine Arts</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-sky-ice/85">3601 Lyon St, San Francisco, CA 94123. Doors open Friday October 23; demos and judging run Sunday October 25.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-1 text-sky-lavender">Who can apply</p>
                <p className="text-sm leading-relaxed text-sky-ice/80">Hackers must be current students or within 12 months of graduation (MLH eligibility). Judges, mentors and volunteers have no student requirement.</p>
              </div>
              <div>
                <p className="eyebrow mb-1 text-sky-lavender">Questions</p>
                <p className="text-sm leading-relaxed text-sky-ice/80">
                  <a className="underline underline-offset-[3px] hover:text-white" href="mailto:team@hackberkeley.org">team@hackberkeley.org</a>
                  <br />
                  <a className="underline underline-offset-[3px] hover:text-white" href="mailto:sponsorship@hackberkeley.org">sponsorship@hackberkeley.org</a>
                </p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/signup" className={buttonClass("secondary", "lg", "rounded-full border-0 bg-sky-ice text-sky-navy hover:bg-white")}>
                Start an application
              </Link>
              <a href="https://mlh.io/code-of-conduct" target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "lg", "rounded-full text-sky-ice hover:bg-white/10 hover:text-white")}>
                MLH Code of Conduct ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter dark />
    </div>
  );
}

async function HeaderAction() {
  const user = await getSessionUser();
  const href = !user ? "/signup" : user.role === "organizer" ? "/organizer" : "/dashboard";
  const label = !user ? "Apply" : user.role === "organizer" ? "Review desk" : "My application";
  return (
    <Link href={href} className={buttonClass("secondary", "sm", "rounded-full border-0 bg-sky-ice px-5 text-sky-navy hover:bg-white")}>
      {label}
    </Link>
  );
}
