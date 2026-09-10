import "server-only";

import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAccountType, isAppStatus, type AccountType, type AppStatus } from "@/lib/tracks";
import type { Tables } from "@/lib/supabase/types";

export type Review = Tables<"reviews">;

export type ListFilters = { track?: AccountType; status?: AppStatus; q?: string; sort?: "newest" | "oldest" | "unreviewed" };

export function parseFilters(sp: Record<string, string | string[] | undefined>): ListFilters {
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const track = pick("track");
  const status = pick("status");
  const sort = pick("sort");
  return {
    track: isAccountType(track) ? track : undefined,
    status: isAppStatus(status) && status !== "draft" ? status : undefined,
    q: pick("q")?.trim().slice(0, 80) || undefined,
    sort: sort === "oldest" || sort === "unreviewed" ? sort : "newest",
  };
}

export type ListRow = {
  id: string;
  track: AccountType;
  status: AppStatus;
  submitted_at: string | null;
  profile: { full_name: string; email: string } | null;
  reviews: { overall: number; reviewer_id: string }[];
};

/** Organizer list. Drafts are excluded at the query level; RLS hides them from nobody here but they aren't reviewable. */
export const listApplications = cache(async (f: ListFilters): Promise<ListRow[]> => {
  const supabase = await createClient();
  let q = supabase
    .from("applications")
    .select("id, track, status, submitted_at, profile:profiles!applications_user_id_fkey(full_name, email), reviews(overall, reviewer_id)")
    .neq("status", "draft")
    .limit(500);
  if (f.track) q = q.eq("track", f.track);
  if (f.status) q = q.eq("status", f.status);
  if (f.q) {
    // Sanitize for PostgREST `or` filter syntax; search on the joined profile.
    const term = f.q.replace(/[%,()"'\\]/g, "");
    q = q.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`, { referencedTable: "profiles" });
  }
  q = q.order("submitted_at", { ascending: f.sort === "oldest", nullsFirst: false });
  const { data, error } = await q;
  if (error) throw error;
  let rows = data as unknown as ListRow[];
  if (f.q) rows = rows.filter((r) => r.profile !== null); // inner-join semantics for the search
  if (f.sort === "unreviewed") rows = [...rows].sort((a, b) => a.reviews.length - b.reviews.length);
  return rows;
});

export type ApplicationDetail = Tables<"applications"> & {
  profile: { full_name: string; email: string } | null;
  reviews: (Review & { reviewer: { full_name: string; email: string } | null })[];
  events: (Tables<"application_events"> & { actor: { full_name: string } | null })[];
};

export const getApplicationDetail = cache(async (id: string): Promise<ApplicationDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "*, profile:profiles!applications_user_id_fkey(full_name, email), reviews(*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, email)), events:application_events(*, actor:profiles!application_events_actor_id_fkey(full_name))",
    )
    .eq("id", id)
    .neq("status", "draft")
    .order("created_at", { referencedTable: "application_events", ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ApplicationDetail | null;
});

/** Next application this organizer hasn't reviewed yet, oldest submission first. */
export async function nextUnreviewed(reviewerId: string, track?: AccountType): Promise<string | null> {
  const supabase = await createClient();
  let q = supabase
    .from("applications")
    .select("id, reviews(reviewer_id)")
    .in("status", ["submitted", "under_review"])
    .order("submitted_at", { ascending: true })
    .limit(50);
  if (track) q = q.eq("track", track);
  const { data, error } = await q;
  if (error) throw error;
  const row = (data as { id: string; reviews: { reviewer_id: string }[] }[]).find((r) => !r.reviews.some((x) => x.reviewer_id === reviewerId));
  return row?.id ?? null;
}

/**
 * Aggregate counts for the dashboard header. Shared across all organizers and
 * cached across requests; tagged so any decision/submission invalidates it via
 * revalidateTag('applications'). Runs with the service role because a cached
 * function cannot read request cookies, and the totals are identical for every
 * organizer anyway. Callers MUST gate with requireOrganizer() first.
 */
export async function getStats() {
  "use cache";
  cacheTag("applications");
  cacheLife("minutes");
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { data, error } = await createAdminClient().rpc("application_stats");
  if (error) throw error;
  const byStatus: Record<string, number> = {};
  const byTrack: Record<string, number> = {};
  let total = 0;
  for (const r of data) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + Number(r.count);
    byTrack[r.track] = (byTrack[r.track] ?? 0) + Number(r.count);
    total += Number(r.count);
  }
  return { total, byStatus, byTrack };
}

export const listOrganizers = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "organizer").order("created_at");
  if (error) throw error;
  return data;
});
