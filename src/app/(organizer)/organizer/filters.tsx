"use client";

import type { Route } from "next";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { ListFilters } from "@/lib/organizer/queries";
import { ACCOUNT_TYPES, APP_STATUSES, STATUS_LABEL, TRACKS } from "@/lib/tracks";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/cn";

/** URL-driven filters so views are shareable and the back button works. */
export function Filters({ filters }: { filters: ListFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  function apply(fd: FormData) {
    const p = new URLSearchParams();
    for (const [k, v] of fd.entries()) if (typeof v === "string" && v) p.set(k, v);
    start(() => router.replace(`${pathname}${p.size ? `?${p}` : ""}` as Route));
  }

  return (
    <form
      action={apply}
      onChange={(e) => apply(new FormData(e.currentTarget))}
      className={cn("rise-2 mb-4 flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-70")}
    >
      <Input name="q" placeholder="Search name or email" defaultValue={filters.q ?? ""} className="h-9 w-56 py-0 text-sm" aria-label="Search" />
      <div className="w-40">
        <Select name="track" defaultValue={filters.track ?? ""} aria-label="Track" className="h-9 py-0 text-sm">
          <option value="">All tracks</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRACKS[t].plural}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-44">
        <Select name="status" defaultValue={filters.status ?? ""} aria-label="Status" className="h-9 py-0 text-sm">
          <option value="">All statuses</option>
          {APP_STATUSES.filter((s) => s !== "draft").map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-44">
        <Select name="sort" defaultValue={filters.sort ?? "newest"} aria-label="Sort" className="h-9 py-0 text-sm">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="unreviewed">Fewest reviews</option>
        </Select>
      </div>
    </form>
  );
}
