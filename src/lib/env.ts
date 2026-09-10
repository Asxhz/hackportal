import { z } from "zod";

/**
 * Environment variables are validated once at module load so a misconfigured
 * deploy fails loudly at boot instead of at the first request.
 *
 * NEXT_PUBLIC_* values are safe to ship to the browser (the anon key is scoped by RLS).
 * SUPABASE_SECRET_KEY is server-only and never imported from client code
 * (`server-only` guard in admin.ts).
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const env = publicEnv;
