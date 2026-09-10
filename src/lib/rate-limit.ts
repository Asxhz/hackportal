import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fixed-window rate limiter backed by Postgres (no extra infrastructure).
 * Keys are hashed before storage so the table never holds raw IPs or emails.
 * Only the service-role client can call the RPC, so clients cannot poison counters.
 */
export type RateLimitRule = { limit: number; windowSeconds: number };

export const RULES = {
  loginIp: { limit: 20, windowSeconds: 10 * 60 },
  loginEmail: { limit: 8, windowSeconds: 15 * 60 },
  signupIp: { limit: 6, windowSeconds: 60 * 60 },
  autosave: { limit: 120, windowSeconds: 60 },
  mutation: { limit: 60, windowSeconds: 60 },
} satisfies Record<string, RateLimitRule>;

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

function hashKey(scope: string, subject: string) {
  return createHash("sha256").update(`${scope}:${subject.toLowerCase()}`).digest("hex");
}

/** Returns true when the request is allowed. Fails open on infrastructure error (logged). */
export async function checkRateLimit(scope: keyof typeof RULES, subject: string): Promise<boolean> {
  const rule = RULES[scope];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_key: hashKey(scope, subject),
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    });
    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error("[rate-limit] unavailable, allowing request", err);
    return true;
  }
}
