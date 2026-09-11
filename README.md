# Cal Hacks Portal

A miniature hackathon management platform: applicants sign in and submit a role-specific application (hacker, judge, mentor, volunteer); organizers review with a shared rubric, decide, and see everything in one place.

**Stack:** Next.js 16 (App Router, Cache Components, `proxy.ts`), TypeScript, Tailwind v4, Supabase (Postgres + Auth), Vercel.

**Live:** https://hackportal-two.vercel.app — demo organizer login `organizer@calhacks.test` / `Password123!!`. Sign up with any email to see the applicant side.

---

## How it fits together

```
browser ──▶ proxy.ts ──▶ Server Component / Server Action ──▶ Supabase (RLS) ──▶ Postgres
              │                     │
              │ verifies JWT        │ requireUser() / requireOrganizer()
              │ locally (JWKS)      │ zod-validates every input
              │ sets CSP nonce      │ rate-limits every mutation
              ▼                     ▼
        redirect / 403        typed, RLS-scoped client (acts *as the user*)
```

Three layers say "no" independently. A bug in one cannot leak data:

| Layer | What it enforces | Where |
|---|---|---|
| **Proxy** | Coarse route gating from verified JWT claims. No DB call. | `src/proxy.ts` |
| **Server** | Auth + authorization on every action, zod on every input, rate limits. | `src/lib/**/actions.ts`, `src/lib/auth/session.ts` |
| **Database** | Row Level Security on every table, column-level grants, state-machine triggers, audit log written only by `security definer` triggers. | `supabase/migrations/*.sql` |

### Identity and roles

* `profiles.role` (`applicant` \| `organizer`) and `profiles.account_type` (hacker/judge/mentor/volunteer) live **only** in Postgres. Clients hold `UPDATE` privilege on `full_name` and `account_type` and nothing else, so no request can self-promote.
* A custom access-token hook stamps `user_role` and `account_type` into the JWT. `getClaims()` verifies the ES256 signature against the project's public JWKS locally, so an authenticated request costs **zero** auth-server round trips. Login and logout are single Server Actions that set/clear httpOnly cookies; nothing is stored in `localStorage`.
* Organizer pages re-check the role in the DB (`requireOrganizer`), so revoking someone takes effect on their next request, not at token refresh.
* Bootstrap: emails in `organizer_allowlist` become organizers at signup. Organizers can add more from **Team**.

### Application lifecycle

`draft → submitted → under_review → accepted | waitlisted | rejected`

* Applicants can only write while `draft`, and only to `draft`/`submitted`. Organizers can never touch `answers`, never revert to `draft`, and can't review drafts. Enforced by RLS **and** the `applications_guard` trigger.
* `version` implements optimistic concurrency. Every write sends the version it read; the trigger rejects stale writes (`40001`), which the UI surfaces as "changed in another tab."
* Every transition and review lands in `application_events` with `visibility` = `applicant` or `internal`. Applicants see their own public timeline; organizers see everything with actor attribution.

### Forms are data

`src/lib/tracks/index.ts` declares each role's sections, fields, and scoring rubric. The same definition drives the rendered form, the zod validator on the server (draft = lenient, submit = strict, `.strict()` rejects unknown keys), the read-only answers view, and the organizer's rubric. Adding a question is one line.

### Caching

* **JWT verification is cached** (JWKS in memory) — the fast path for every request.
* **React `cache()`** dedupes identity and data lookups within a render.
* **`"use cache"` + `cacheTag("applications")`** for the organizer stats tiles; any decision or submission calls `revalidateTag`, so the numbers are shared across organizers but never stale.
* **Partial Prerendering**: every route ships a static shell instantly; only session-aware fragments stream.

### Rate limiting

Fixed-window counters in Postgres (`consume_rate_limit`), keyed by a SHA-256 of `scope:subject` so the table never stores raw IPs or emails. The RPC is executable **only** by the service role, so clients can't poison counters. Rules live in `src/lib/rate-limit.ts`.

### The extra features

1. **Autosaving drafts** — ~1.2 s after the last keystroke, through the same Server Action as submit, with a flush on `pagehide`. Applicants never lose work.
2. **Review queue** — "Review next" jumps to the oldest submission the current organizer hasn't scored; per-track rubrics; running average; blind to other reviewers' notes until you've saved yours.
3. **Audit timeline** — applicant-safe and organizer-full views of the same event log.
4. **CSV export** of the current filtered view (formula-injection-safe).

---

## Run it locally

```bash
pnpm install
pnpm supabase start          # Docker; prints keys. Copy into .env.local (see .env.example)
pnpm dev
```

Seeded accounts (password `Password123!!`): `organizer@calhacks.test`, `hacker@calhacks.test`, `judge@calhacks.test`, `mentor@calhacks.test` (draft), `volunteer@calhacks.test`.

## Deploy gate

```bash
pnpm gate
```

Eight steps: secret/boundary scan → lint → types → migrations from zero → 30+ RLS/privilege assertions (`supabase/tests/rls.sql`) → schema invariants (RLS on every table, anon has no grants, definers pin `search_path`) → production build → live header check (CSP, HSTS, frame, sniff, referrer, gated routes). A pass writes `.preflight-ok` hashed to the exact working tree.

`.claude/settings.json` installs a hook that **blocks `vercel --prod`** unless that stamp matches the current tree and production env has every required variable. `.claude/agents/portal-auditor.md` is a reusable auditor that runs the gate and walks each trust boundary.

## Environment

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Anon key; every query it makes is RLS-scoped |
| `SUPABASE_SECRET_KEY` | server | Service role. Used for exactly three things: rate-limit RPC, cached organizer stats, creating pre-confirmed auth users at signup |
| `NEXT_PUBLIC_SITE_URL` | public | Absolute origin for auth redirects |
