import Link from "next/link";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "https://calhacks.io", label: "calhacks.io" },
  { href: "https://hackberkeley.org", label: "Hackathons @ Berkeley" },
  { href: "https://mlh.io/code-of-conduct", label: "MLH Code of Conduct" },
  { href: "https://github.com/calhacks", label: "GitHub" },
  { href: "https://instagram.com/calhacks", label: "Instagram" },
];

export function SiteFooter({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  if (compact) {
    return (
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-ink-4">
          <span>© 2026 Cal Hacks · Hackathons @ Berkeley · 501(c)(3)</span>
          <span className="flex flex-wrap gap-4">
            <a className="hover:text-ink" href="mailto:team@hackberkeley.org">team@hackberkeley.org</a>
            <a className="hover:text-ink" href="https://mlh.io/code-of-conduct" target="_blank" rel="noopener noreferrer">Code of Conduct</a>
          </span>
        </div>
      </footer>
    );
  }
  const t = dark
    ? { wrap: "border-t border-white/10 bg-sky-navy text-white", muted: "text-sky-ice/70", link: "text-sky-ice hover:text-white", eyebrow: "eyebrow text-sky-lavender", rule: "border-t border-white/10", foot: "text-sky-ice/50", a: "text-sky-lavender underline underline-offset-[3px] hover:text-white" }
    : { wrap: "border-t border-line bg-white", muted: "text-ink-3", link: "text-ink-2 hover:text-ink", eyebrow: "eyebrow", rule: "border-t border-line", foot: "text-ink-4", a: "link" };
  return (
    <footer className={t.wrap}>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo className={dark ? "text-white [&_.eyebrow]:text-white/60" : undefined} />
          <p className={`max-w-sm text-sm leading-relaxed ${t.muted}`}>
            Cal Hacks is run by Hackathons @ Berkeley, a student organization at UC Berkeley and a registered 501(c)(3)
            non-profit. Cal Hacks 13.0 takes place October 23–25, 2026 at the Palace of Fine Arts, San Francisco.
          </p>
          <p className="text-sm">
            <a className={t.a} href="mailto:team@hackberkeley.org">team@hackberkeley.org</a>
            <span className={t.foot}> · </span>
            <a className={t.a} href="mailto:sponsorship@hackberkeley.org">sponsorship@hackberkeley.org</a>
          </p>
        </div>
        <div>
          <p className={`${t.eyebrow} mb-3`}>Cal Hacks</p>
          <ul className="space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a className={t.link} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={`${t.eyebrow} mb-3`}>Portal</p>
          <ul className="space-y-2 text-sm">
            <li><Link className={t.link} href="/signup">Create account</Link></li>
            <li><Link className={t.link} href="/login">Sign in</Link></li>
            <li><Link className={t.link} href="/dashboard">Application status</Link></li>
          </ul>
        </div>
      </div>
      <div className={t.rule}>
        <div className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs ${t.foot}`}>
          <span>© 2026 Cal Hacks · Cal Hacks is a registered 501(c)(3) non-profit</span>
          <span>Event photos: Hackathons @ Berkeley · Venue photos: Will Truettner, Spencer DeMera (Unsplash)</span>
        </div>
      </div>
    </footer>
  );
}
