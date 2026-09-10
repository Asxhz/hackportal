import "server-only";

import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAccountType, type AccountType } from "@/lib/tracks";

export type SessionUser = {
  id: string;
  email: string;
  role: "applicant" | "organizer";
  accountType: AccountType;
};

/**
 * Data Access Layer for identity.
 *
 * `getClaims()` verifies the access token's signature locally against the
 * project's public JWKS (cached), so a normal authenticated request costs zero
 * round trips to the auth server. The custom access-token hook stamps
 * `user_role` and `account_type` into the JWT, so we can render role-aware UI
 * without a profile lookup. RLS in Postgres is the authority for *data*; these
 * claims only decide what we show.
 *
 * Wrapped in React `cache` so any number of components in a render tree share
 * one verification.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  const c = data.claims as Record<string, unknown>;
  if (typeof c.sub !== "string" || typeof c.email !== "string") return null;

  // Fast path: role + account type come from the JWT (custom access-token hook).
  if (typeof c.user_role === "string" && isAccountType(c.account_type)) {
    return { id: c.sub, email: c.email, role: c.user_role === "organizer" ? "organizer" : "applicant", accountType: c.account_type };
  }
  // Fallback: hook not enabled or token predates it. One indexed lookup, RLS-scoped.
  const { data: p } = await supabase.from("profiles").select("role, account_type").eq("id", c.sub).maybeSingle();
  return {
    id: c.sub,
    email: c.email,
    role: p?.role === "organizer" ? "organizer" : "applicant",
    accountType: p?.account_type ?? "hacker",
  };
});

/** Redirect to login when unauthenticated. Use in pages/actions that need a user. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}

/**
 * Organizer gate. Confirms the role against the database (not just the JWT) so a
 * revoked organizer loses access on their very next request rather than at token
 * refresh. Costs one indexed primary-key lookup.
 */
export const requireOrganizer = cache(async (): Promise<SessionUser> => {
  const user = await requireUser("/organizer");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "organizer") forbidden();
  return { ...user, role: "organizer" };
});
