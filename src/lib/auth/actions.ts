"use server";

import { z } from "zod";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { ACCOUNT_TYPES } from "@/lib/tracks";

export type AuthState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean; message?: string };

const email = z.string().trim().toLowerCase().email("Enter a valid email").max(254);
const password = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Password is too long")
  .refine((p) => !/^(.)\1+$/.test(p), "Pick something less repetitive");

/** Only allow same-origin relative paths for post-login redirects (no open redirect). */
function safeNext(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  return raw;
}

function zodFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

const signInSchema = z.object({ email, password: z.string().min(1, "Enter your password").max(128), next: z.string().optional() });

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const ip = await clientIp();
  const [ipOk, emailOk] = await Promise.all([
    checkRateLimit("loginIp", ip),
    checkRateLimit("loginEmail", parsed.data.email),
  ]);
  if (!ipOk || !emailOk) return { error: "Too many attempts. Try again in a few minutes." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    // Same message for wrong password / unknown user: no account enumeration.
    if (error.code === "email_not_confirmed") return { error: "Confirm your email first. Check your inbox for the link." };
    return { error: "Email or password is incorrect." };
  }

  // Resolves role from the JWT claim, falling back to the DB if the hook isn't stamping it.
  const user = await getSessionUser();
  revalidatePath("/", "layout");
  redirect((safeNext(parsed.data.next) ?? (user?.role === "organizer" ? "/organizer" : "/dashboard")) as Route);
}

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Tell us your name").max(120),
  email,
  password,
  account_type: z.enum(ACCOUNT_TYPES, { message: "Choose how you want to participate" }),
});

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const ip = await clientIp();
  if (!(await checkRateLimit("signupIp", ip))) return { error: "Too many sign-ups from this network. Try again later." };

  // Create the user already confirmed via the server-side admin API. This portal
  // doesn't gate on email verification (organizers decide who gets in), and it
  // removes the dependency on outbound email entirely. The admin client never
  // touches user data here; it only creates the auth identity.
  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    // Read by the `handle_new_user` trigger; validated there as well.
    user_metadata: { full_name: parsed.data.full_name, account_type: parsed.data.account_type },
  });
  if (createError) {
    if (createError.code === "email_exists" || createError.code === "user_already_exists" || createError.status === 422) {
      return { error: "An account with that email already exists. Sign in instead." };
    }
    if (createError.code === "weak_password") return { fieldErrors: { password: "That password is too easy to guess." } };
    console.error("[signUp]", createError);
    return { error: "Could not create your account. Please try again." };
  }

  // Sign the new user in with their own credentials so cookies are issued normally.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (signInError) return { ok: true, message: "Account created. Sign in to continue." };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  // `local` clears this device only; other sessions stay signed in.
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/login");
}
