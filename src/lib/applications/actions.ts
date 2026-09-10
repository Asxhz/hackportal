"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { TRACKS, isAccountType, type AccountType } from "@/lib/tracks";
import { buildSchema, formDataToAnswers } from "@/lib/tracks/fields";
import type { Json } from "@/lib/supabase/types";

export type SaveState = {
  status: "idle" | "saved" | "submitted" | "error" | "conflict";
  savedAt?: string;
  version?: number;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function zodFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

/** Ensure the caller has a draft row for their account type; returns it. */
export async function ensureDraft(): Promise<{ id: string; version: number; track: AccountType }> {
  const user = await requireUser("/apply");
  const supabase = await createClient();
  const existing = await supabase.from("applications").select("id, version, track").maybeSingle();
  if (existing.data) return existing.data as { id: string; version: number; track: AccountType };

  // Track is taken from the profile server-side; RLS also asserts it.
  const profile = await supabase.from("profiles").select("account_type").eq("id", user.id).single();
  if (profile.error) throw profile.error;
  const { data, error } = await supabase
    .from("applications")
    .insert({ user_id: user.id, track: profile.data.account_type })
    .select("id, version, track")
    .single();
  if (error) throw error;
  return data as { id: string; version: number; track: AccountType };
}

/**
 * Persist answers. `mode = "draft"` accepts partial input (used by autosave);
 * `mode = "submit"` validates every required field and flips status.
 * Optimistic concurrency: the client sends the version it loaded; the DB
 * trigger rejects the write if another tab already advanced it.
 */
export async function saveApplication(prev: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser("/apply");
  const mode = formData.get("__mode") === "submit" ? "submit" : "draft";
  const version = Number(formData.get("__version"));
  const track = formData.get("__track");
  if (!isAccountType(track) || !Number.isInteger(version)) return { status: "error", error: "Malformed request." };

  if (!(await checkRateLimit(mode === "submit" ? "mutation" : "autosave", user.id))) {
    return { status: "error", error: "Slow down a little — too many saves." };
  }

  const def = TRACKS[track];
  const raw = formDataToAnswers(def.sections, formData);
  const parsed = buildSchema(def.sections, mode).safeParse(raw);
  if (!parsed.success) {
    if (mode === "submit") return { status: "error", error: "A few answers need attention.", fieldErrors: zodFieldErrors(parsed.error) };
    // Autosave: store whatever is valid-shaped; drop only offending keys.
    const lenient = buildSchema(def.sections, "draft").safeParse(raw);
    if (!lenient.success) return { status: "error", error: "Could not save draft." };
  }
  const answers = (parsed.success ? parsed.data : buildSchema(def.sections, "draft").parse(raw)) as unknown as Json;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ answers, status: mode === "submit" ? "submitted" : "draft", version })
    .eq("user_id", user.id)
    .eq("track", track)
    .eq("status", "draft")
    .select("version, updated_at")
    .maybeSingle();

  if (error) {
    if (error.code === "40001") return { status: "conflict", error: "This application was changed in another tab. Reload to continue." };
    if (error.code === "42501") return { status: "error", error: "This application is locked." };
    console.error("[saveApplication]", error);
    return { status: "error", error: "Could not save. Try again." };
  }
  if (!data) return { status: "conflict", error: "This application is no longer editable. Reload to see its status." };

  revalidatePath("/dashboard");
  revalidatePath("/apply");
  if (mode === "submit") {
    revalidateTag("applications", "max");
    redirect("/dashboard?submitted=1");
  }
  return { status: "saved", savedAt: data.updated_at, version: data.version };
}

const nameSchema = z.object({ full_name: z.string().trim().min(2, "Tell us your name").max(120) });

export async function updateName(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const user = await requireUser("/account");
  const parsed = nameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data.full_name }).eq("id", user.id);
  if (error) return { error: "Could not update your name." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function switchAccountType(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const user = await requireUser("/account");
  const next = formData.get("account_type");
  if (!isAccountType(next)) return { error: "Pick a valid role." };
  const supabase = await createClient();
  // The profiles_guard trigger refuses this once an application is submitted and
  // deletes any stale draft for the old track.
  const { error } = await supabase.from("profiles").update({ account_type: next }).eq("id", user.id);
  if (error) return { error: "Your role is locked because your application has been submitted." };
  // Role/account claims live in the JWT; refresh so the header reflects the change immediately.
  await supabase.auth.refreshSession();
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
