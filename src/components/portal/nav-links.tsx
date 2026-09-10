"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavItem = { href: "/dashboard" | "/apply" | "/account" | "/organizer" | "/organizer/team"; label: string };

export function NavLinks({ items, mobile = false }: { items: NavItem[]; mobile?: boolean }) {
  const path = usePathname();
  return (
    <>
      {items.map((n) => {
        const active =
          path === n.href ||
          (n.href !== "/organizer" && path.startsWith(n.href + "/")) ||
          (n.href === "/organizer" && path.startsWith("/organizer/applications"));
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition whitespace-nowrap",
              active ? "bg-white text-ink shadow-card" : "text-ink-3 hover:bg-paper-2 hover:text-ink",
              mobile && "text-[13px]",
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </>
  );
}
