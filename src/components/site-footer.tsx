import Link from "next/link";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "https://calhacks.io", label: "calhacks.io" },
  { href: "https://hackberkeley.org", label: "Hackathons @ Berkeley" },
  { href: "https://mlh.io/code-of-conduct", label: "MLH Code of Conduct" },
  { href: "https://github.com/calhacks", label: "GitHub" },
  { href: "https://instagram.com/calhacks", label: "Instagram" },
];

export function SiteFooter({ compact = false }: { compact?: boolean }) {
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
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-ink-3">
            Cal Hacks is run by Hackathons @ Berkeley, a student organization at UC Berkeley and a registered 501(c)(3)
            non-profit. Cal Hacks 13.0 takes place at the Palace of Fine Arts, San Francisco.
          </p>
          <p className="text-sm">
            <a className="link" href="mailto:team@hackberkeley.org">team@hackberkeley.org</a>
            <span className="text-ink-4"> · </span>
            <a className="link" href="mailto:sponsorship@hackberkeley.org">sponsorship@hackberkeley.org</a>
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Cal Hacks</p>
          <ul className="space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a className="text-ink-2 hover:text-ink" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Portal</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-ink-2 hover:text-ink" href="/signup">Create account</Link></li>
            <li><Link className="text-ink-2 hover:text-ink" href="/login">Sign in</Link></li>
            <li><Link className="text-ink-2 hover:text-ink" href="/dashboard">Application status</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs text-ink-4">
          <span>© 2026 Cal Hacks</span>
          <span>Photos: Alex Kotliarskyi, Janet Ganbold, Van Tay Media, Annie Spratt, Vitaly Gariev via Unsplash</span>
        </div>
      </div>
    </footer>
  );
}
