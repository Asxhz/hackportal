import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { Starfield } from "@/components/sky";
import { Reveal } from "@/components/reveal";
import { buttonClass } from "@/components/ui/button";
import { ACCOUNT_TYPES, TRACKS } from "@/lib/tracks";
import { getSessionUser } from "@/lib/auth/session";
import logo13 from "@/images/ch/logo13.svg";
import mlhBadge from "@/images/ch/mlh-badge.svg";
import earth from "@/images/ch/earth.webp";
import oskiPlane from "@/images/ch/oski-plane.webp";
import cloud9 from "@/images/ch/cloud-9.webp";
import cloud10 from "@/images/ch/cloud-10.webp";
import cloud12 from "@/images/ch/cloud-12.webp";
import mountains from "@/images/ch/mountains.webp";
import palace from "@/images/ch/palace-flowers.webp";
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

const PHOTOS = [p423, p425, p426, p429, p431, p434, p435, p436, p437];
const TRACK_PHOTO = { hacker: p429, judge: p431, mentor: p437, volunteer: p434 } as const;

const TIMELINE = [
  { d: "Sep 13", t: "Priority deadline", s: "Apply by this date to hear back first." },
  { d: "Sep 17", t: "Priority decisions", s: "Released to priority applicants." },
  { d: "Sep 20", t: "Regular deadline", s: "Final day to submit any application." },
  { d: "Sep 25", t: "Regular decisions", s: "All remaining decisions released." },
  { d: "Oct 23–25", t: "Cal Hacks 13.0", s: "Palace of Fine Arts, San Francisco." },
];

const STEPS = [
  { n: "1", t: "Create an account", d: "Pick hacker, judge, mentor or volunteer. You can change it until you submit." },
  { n: "2", t: "Fill out your application", d: "Drafts save as you type. Come back on any device and pick up where you left off." },
  { n: "3", t: "Check your status here", d: "Organizers review with a shared rubric. Your decision shows on your dashboard the moment it is made." },
];

export default function HomePage() {
  return (
    <div className="relative min-h-dvh bg-sky-navy text-white">
      <Starfield />

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:pr-36 xl:pr-40">
          <a href="https://hackberkeley.org" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-sky-lavender hover:text-white">
            Hackathons @ Berkeley
          </a>
          <nav className="flex items-center gap-1 text-[13px] font-bold uppercase tracking-wider text-sky-lavender sm:gap-4" aria-label="Site">
            <a href="https://calhacks.io" target="_blank" rel="noopener noreferrer" className="hidden px-2 py-1 hover:text-white md:inline">About</a>
            <a href="https://calhacks.io/#venue" target="_blank" rel="noopener noreferrer" className="hidden px-2 py-1 hover:text-white md:inline">Venue</a>
            <a href="https://calhacks.io/#sponsors" target="_blank" rel="noopener noreferrer" className="hidden px-2 py-1 hover:text-white md:inline">Sponsors</a>
            <Link href="/login" className="px-2 py-1 hover:text-white">Sign in</Link>
            <Suspense fallback={<span className="h-9 w-24 rounded-full bg-sky-ice/30" />}>
              <HeaderAction />
            </Suspense>
          </nav>
        </div>
        <a href="https://mlh.io/seasons/2027/events" target="_blank" rel="noopener noreferrer" className="absolute right-6 top-0 hidden w-[92px] lg:block xl:right-12" aria-label="MLH Official 2027 Season">
          <Image src={mlhBadge} alt="MLH Official 2027 Season" width={92} height={160} priority />
        </a>
      </header>

      {/* Hero: earth rising, Oski in his plane, cloud pills */}
      <section className="relative isolate overflow-hidden pt-28 sm:pt-36">
        <div className="pointer-events-none absolute left-1/2 top-[38%] -z-[5] w-[160vw] max-w-[1800px] -translate-x-1/2 sm:top-[30%] sm:w-[125vw]">
          <Image src={earth} alt="" priority sizes="(min-width: 640px) 125vw, 160vw" className="anim-spin-slow w-full opacity-95" />
        </div>
        <Image src={oskiPlane} alt="Oski the bear flying a red biplane" priority sizes="(min-width: 640px) 260px, 160px" className="anim-plane absolute left-[4%] top-[14%] z-10 w-[160px] sm:w-[260px]" />
        <Image src={cloud10} alt="" aria-hidden sizes="420px" className="anim-drift-slow pointer-events-none absolute -right-10 top-[24%] w-[320px] opacity-90 sm:w-[420px]" />
        <Image src={cloud12} alt="" aria-hidden sizes="380px" className="anim-drift pointer-events-none absolute -left-16 top-[58%] w-[300px] opacity-80 sm:w-[380px]" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <Image src={logo13} alt="Cal Hacks 13.0" priority className="w-[300px] drop-shadow-[0_12px_40px_rgba(2,32,94,0.6)] sm:w-[520px]" />
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-sky-ice sky-text-shadow">
            The world&apos;s largest collegiate hackathon. Hackers, judges, mentors and volunteers all apply here.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup?as=hacker" className="cloud-pill h-12 px-7 text-[13px] transition hover:-translate-y-0.5 hover:bg-white">
              Become a hacker →
            </Link>
            <Link href="/signup" className="cloud-pill h-12 px-7 text-[13px] transition hover:-translate-y-0.5 hover:bg-white">
              Judge · Mentor · Volunteer
            </Link>
          </div>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-3 text-[12px] font-bold uppercase tracking-wider text-sky-navy">
            {[
              ["Palace of Fine Arts", "San Francisco"],
              ["Oct 23–25", "2026"],
              ["Priority due", "Sep 13"],
              ["Regular due", "Sep 20"],
            ].map(([a, b], i) => (
              <li key={a} className="cloud-pill h-14 min-w-[150px] flex-col px-6 leading-tight" style={{ transform: `translateY(${i % 2 ? 8 : 0}px)` }}>
                <span>{a}</span>
                <span className="text-sky-teal">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="h-[34vh] sm:h-[42vh]" />
      </section>

      {/* Photo marquee */}
      <section className="relative -mt-8 overflow-hidden bg-gradient-to-b from-sky-navy via-[#3a4a9a] to-[#8fb3e6] py-16">
        <Image src={cloud9} alt="" aria-hidden sizes="520px" className="anim-drift pointer-events-none absolute -left-10 top-4 w-[380px] opacity-70 sm:w-[520px]" />
        <Reveal className="mx-auto mb-10 max-w-6xl px-6 text-center">
          <p className="display text-[22px] italic text-sky-lavender">The world&apos;s</p>
          <h2 className="display text-[44px] leading-none text-white sky-text-shadow sm:text-[64px]">Largest collegiate hackathon</h2>
          <p className="mt-3 text-sky-ice">Photos from Cal Hacks 12.0, October 2025.</p>
        </Reveal>
        <div className="relative flex w-full overflow-hidden">
          <div className="anim-marquee flex w-max gap-6 pr-6">
            {[...PHOTOS, ...PHOTOS].map((p, i) => (
              <Image key={i} src={p} alt={i < PHOTOS.length ? "Cal Hacks attendees" : ""} width={240} height={300} sizes="240px" className="h-[300px] w-auto shrink-0 drop-shadow-[0_18px_40px_rgba(2,32,94,0.45)]" />
            ))}
          </div>
        </div>
      </section>

      {/* Roles over the mountains */}
      <section className="relative isolate overflow-hidden">
        <Image src={mountains} alt="" aria-hidden fill sizes="100vw" className="-z-10 object-cover object-[center_62%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#8fb3e6] via-[#8fb3e6]/20 to-[#c9d9f5]" />
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto mb-10 max-w-3xl rounded-2xl bg-white/85 p-8 text-center text-sky-navy shadow-pop backdrop-blur">
            <h2 className="display text-[40px] leading-none"><span className="text-sky-teal">You</span> belong at Cal Hacks.</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
              Whether you have never coded or have been to twenty hackathons, there is a role for you. Choose one below. Each application is short and saves as you go.
            </p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ACCOUNT_TYPES.map((t, i) => (
              <Reveal key={t} delay={i * 80}>
                <Link href={`/signup?as=${t}`} className="group block overflow-hidden rounded-2xl bg-white text-sky-navy shadow-pop transition hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden bg-sky-ice">
                    <Image src={TRACK_PHOTO[t]} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-bottom transition duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="p-5">
                    <h3 className="display text-[26px] leading-none">{TRACKS[t].plural}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-3">{TRACKS[t].description}</p>
                    <p className="mt-4 text-[13px] font-bold uppercase tracking-wider text-sky-teal">Apply →</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline + steps + story */}
      <section className="relative bg-[#c9d9f5] text-sky-navy">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-2 text-sky-teal">Timeline</p>
            <h2 className="display text-[36px] leading-none">Dates that matter</h2>
            <ol className="mt-8 space-y-0 border-l-2 border-sky-teal/30">
              {TIMELINE.map((x) => (
                <li key={x.t} className="relative pb-7 pl-7 last:pb-0">
                  <span className="absolute -left-[9px] top-1 size-4 rounded-full border-[3px] border-[#c9d9f5] bg-sky-teal" aria-hidden />
                  <p className="text-[12px] font-bold uppercase tracking-wider text-sky-teal">{x.d}</p>
                  <p className="display text-[22px] leading-tight">{x.t}</p>
                  <p className="text-sm text-ink-3">{x.s}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <div className="space-y-10">
            <Reveal delay={100}>
              <p className="eyebrow mb-2 text-sky-teal">How the portal works</p>
              <h2 className="display text-[36px] leading-none">Three steps</h2>
              <ol className="mt-6 space-y-5">
                {STEPS.map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <span className="display grid size-9 shrink-0 place-items-center rounded-full bg-sky-navy text-[18px] text-sky-ice">{s.n}</span>
                    <div>
                      <p className="font-semibold">{s.t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-3">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={200} className="rounded-2xl bg-white/70 p-6">
              <p className="eyebrow mb-3 text-sky-teal">Since 2014</p>
              <div className="flex gap-3">
                <Image src={floor2014} alt="The hacking floor at the first Cal Hacks in 2014" width={180} height={165} className="h-[120px] w-auto rounded-xl object-cover" />
                <Image src={organizers2014} alt="Cal Hacks organizers in 2014" width={120} height={157} className="h-[120px] w-auto rounded-xl object-cover" />
                <Image src={sudo2014} alt="The sudo hack team in 2014" width={130} height={148} className="h-[120px] w-auto rounded-xl object-cover" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                Cal Hacks started in 2014 with a few hundred students in Berkeley. It is now run by Hackathons @ Berkeley, a student 501(c)(3), and fills the Palace of Fine Arts every fall.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Venue */}
      <section className="relative isolate overflow-hidden bg-[#c9d9f5]">
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#75bcff] to-[#dfeeff] shadow-pop">
            <Image src={palace} alt="The Palace of Fine Arts in San Francisco" sizes="(min-width: 1152px) 1152px, 100vw" className="w-full" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-navy/90 to-transparent p-8 text-white">
              <p className="eyebrow text-sky-lavender">Venue</p>
              <p className="display text-[32px] leading-none">Palace of Fine Arts, San Francisco</p>
              <p className="mt-1 text-sm text-sky-ice">3601 Lyon St, San Francisco, CA 94123 · October 23–25, 2026</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 text-sky-navy md:grid-cols-3">
            <div>
              <p className="eyebrow mb-2 text-sky-teal">Who can apply</p>
              <p className="text-sm leading-relaxed text-ink-2">Hackers must be currently enrolled students or within 12 months of graduation, per MLH eligibility. Judges, mentors and volunteers have no student requirement.</p>
            </div>
            <div>
              <p className="eyebrow mb-2 text-sky-teal">Questions</p>
              <p className="text-sm leading-relaxed text-ink-2">
                Email <a className="link" href="mailto:team@hackberkeley.org">team@hackberkeley.org</a>. For sponsorship, <a className="link" href="mailto:sponsorship@hackberkeley.org">sponsorship@hackberkeley.org</a>.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2 text-sky-teal">Code of conduct</p>
              <p className="text-sm leading-relaxed text-ink-2">Cal Hacks is an MLH member event. Everyone agrees to the <a className="link" href="https://mlh.io/code-of-conduct" target="_blank" rel="noopener noreferrer">MLH Code of Conduct</a>.</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter dark />
    </div>
  );
}

async function HeaderAction() {
  const user = await getSessionUser();
  const href = !user ? "/signup" : user.role === "organizer" ? "/organizer" : "/dashboard";
  const label = !user ? "Register" : user.role === "organizer" ? "Review desk" : "My application";
  return (
    <Link href={href} className={buttonClass("secondary", "sm", "rounded-full border-0 bg-sky-ice px-5 font-bold uppercase tracking-wider text-sky-navy hover:bg-white")}>
      {label}
    </Link>
  );
}
