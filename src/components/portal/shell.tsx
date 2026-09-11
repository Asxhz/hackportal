import { Logo } from "@/components/logo";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/lib/auth/session";
import { NavLinks, type NavItem } from "./nav-links";
import { SiteFooter } from "@/components/site-footer";

/** Shared chrome for both signed-in areas. Nav differs by role; sign-out is a Server Action (POST, same-origin only). */
export function Shell({ user, nav, children }: { user: SessionUser; nav: NavItem[]; children: React.ReactNode }) {
  const isOrganizer = user.role === "organizer";
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-sky-navy text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Logo href={isOrganizer ? "/organizer" : "/dashboard"} className="text-white" />
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
              <NavLinks items={nav} />
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-[13px] text-sky-ice/80 md:inline-flex">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider", isOrganizer ? "bg-gold text-sky-navy" : "bg-sky-ice text-sky-navy")}>
                {isOrganizer ? "Organizer" : user.accountType}
              </span>
              {user.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="rounded-md px-3 py-1.5 text-sm text-sky-ice/80 transition hover:bg-white/10 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:hidden" aria-label="Primary mobile">
          <NavLinks items={nav} mobile />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      <SiteFooter compact />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="rise mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="display text-[36px] leading-none">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-[15px] text-ink-3">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
