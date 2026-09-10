import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Application = Tables<"applications">;
export type ApplicationEvent = Tables<"application_events">;

/** The signed-in user's application, or null. RLS guarantees only their own row is visible. */
export const getMyApplication = cache(async (): Promise<Application | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("applications").select("*").maybeSingle();
  if (error) throw error;
  return data;
});

/** Applicant-visible timeline. Internal events (reviews) are filtered by RLS, not by us. */
export const getMyTimeline = cache(async (applicationId: string): Promise<ApplicationEvent[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_events")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
});

/**
 * Fetch the caller's application, creating an empty draft for their account type if
 * none exists. Deliberately NOT wrapped in React `cache`: the write path must always
 * return the fresh row (a cached null would otherwise mask the insert).
 */
export async function getOrCreateMyApplication(userId: string): Promise<Application> {
  const existing = await getMyApplication();
  if (existing) return existing;

  const supabase = await createClient();
  // Track comes from the profile server-side; the RLS insert policy asserts the same thing.
  const profile = await supabase.from("profiles").select("account_type").eq("id", userId).single();
  if (profile.error) throw profile.error;
  const { data, error } = await supabase
    .from("applications")
    .insert({ user_id: userId, track: profile.data.account_type })
    .select("*")
    .single();
  if (error) {
    // Two tabs raced: the unique(user_id) constraint fired. Read the winner.
    if (error.code === "23505") {
      const again = await supabase.from("applications").select("*").maybeSingle();
      if (again.data) return again.data;
    }
    throw error;
  }
  return data;
}

export const getMyProfile = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("id, email, full_name, account_type, role").maybeSingle();
  if (error) throw error;
  return data;
});
