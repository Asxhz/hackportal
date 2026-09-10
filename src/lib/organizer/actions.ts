"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrganizer } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { TRACKS, isAccountType } from "@/lib/tracks";
import { nextUnreviewed } from "./queries";

export type ActionState = { error?: string; ok?: boolean; message?: string };

const uuid = z.string().uuid();

/** Upsert this organizer's review for an application. Rubric keys come from the track definition. */
export async function submitReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOrganizer();
  if (!(await checkRateLimit("mutation", user.id))) return { error: "Too many actions. Take a breath." };

  const appId = uuid.safeParse(formData.get("application_id"));
  const track = formData.get("track");
  if (!appId.success || !isAccountType(track)) return { error: "Malformed request." };

  const rubric = TRACKS[track].rubric;
  const scoreSchema = z.object(Object.fromEntries(rubric.map((c) => [c.key, z.coerce.number().int().min(1).max(5)]))).strict();
  const scores = scoreSchema.safeParse(Object.fromEntries(rubric.map((c) => [c.key, formData.get(`score_${c.key}`)])));
  const overall = z.coerce.number().int().min(1).max(5).safeParse(formData.get("overall"));
  const notes = z.string().trim().max(4000).safeParse(formData.get("notes") ?? "");
  if (!scores.success || !overall.success || !notes.success) return { error: "Score every criterion from 1 to 5." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .upsert(
      { application_id: appId.data, reviewer_id: user.id, scores: scores.data, overall: overall.data, notes: notes.data },
      { onConflict: "application_id,reviewer_id" },
    );
  if (error) {
    console.error("[submitReview]", error);
    return { error: error.code === "42501" ? "This application can't be reviewed." : "Could not save review." };
  }
  revalidateTag("applications", "max");
  revalidatePath(`/organizer/applications/${appId.data}`);
  revalidatePath("/organizer");
  return { ok: true, message: "Review saved." };
}

const decisionSchema = z.object({
  application_id: uuid,
  status: z.enum(["accepted", "waitlisted", "rejected", "under_review"]),
  version: z.coerce.number().int(),
});

/** Set the final decision. Uses the version the organizer saw to avoid clobbering a concurrent decision. */
export async function decide(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOrganizer();
  if (!(await checkRateLimit("mutation", user.id))) return { error: "Too many actions. Take a breath." };
  const parsed = decisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Malformed request." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: parsed.data.status, version: parsed.data.version })
    .eq("id", parsed.data.application_id)
    .neq("status", "draft")
    .select("id")
    .maybeSingle();
  if (error) {
    if (error.code === "40001") return { error: "Someone else just updated this application. Reload to see the latest." };
    console.error("[decide]", error);
    return { error: "Could not update status." };
  }
  if (!data) return { error: "Application not found." };

  revalidateTag("applications", "max");
  revalidatePath("/organizer");
  revalidatePath(`/organizer/applications/${parsed.data.application_id}`);
  revalidatePath("/dashboard");
  return { ok: true, message: "Decision saved." };
}

/** Jump to the next application this organizer hasn't scored. */
export async function goToNextUnreviewed(formData: FormData) {
  const user = await requireOrganizer();
  const track = formData.get("track");
  const id = await nextUnreviewed(user.id, isAccountType(track) ? track : undefined);
  redirect(id ? `/organizer/applications/${id}` : "/organizer?done=1");
}

export async function promoteOrganizer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOrganizer();
  if (!(await checkRateLimit("mutation", user.id))) return { error: "Too many actions." };
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("promote_to_organizer", { target_email: email.data });
  if (error) return { error: "Could not promote that user." };
  revalidatePath("/organizer/team");
  return { ok: true, message: `${email.data} is now an organizer (or will be when they sign up).` };
}
