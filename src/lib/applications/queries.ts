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

export const getMyProfile = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("id, email, full_name, account_type, role").maybeSingle();
  if (error) throw error;
  return data;
});
