import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client. Bypasses RLS, so its use is deliberately narrow:
 *   1. the rate-limit counter RPC (must not be callable by anonymous clients);
 *   2. the cached, organizer-only aggregate stats (a cached scope has no cookies).
 * Never pass this client to anything that reads or writes per-user rows.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
