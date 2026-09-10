#!/usr/bin/env bash
# =============================================================================
# Deploy gate. `pnpm gate` must pass before anything reaches Vercel production.
# The Claude Code hook in .claude/settings.json refuses `vercel --prod` unless
# .preflight-ok exists AND matches the current tree hash, so a stale pass never
# authorizes a new deploy.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

RED=$'\e[31m'; GRN=$'\e[32m'; DIM=$'\e[2m'; NC=$'\e[0m'
step() { printf '\n%s▶ %s%s\n' "$DIM" "$1" "$NC"; }
fail() { printf '%s✗ %s%s\n' "$RED" "$1" "$NC"; /bin/rm -f .preflight-ok; exit 1; }
ok()   { printf '%s✓ %s%s\n' "$GRN" "$1" "$NC"; }

/bin/rm -f .preflight-ok

step "1/8 Secrets never leave the machine"
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then fail ".env.local is tracked by git"; fi
if git ls-files | grep -qE 'signing_keys\.json$'; then fail "JWT signing key is tracked by git"; fi
if grep -rInE '(sb_secret_|eyJhbGciOi)' src --include='*.ts' --include='*.tsx'; then fail "secret-looking literal in src/"; fi
ADMIN_IMPORTS=$(grep -rl "supabase/admin" src | grep -vE 'src/lib/(rate-limit|organizer/queries)\.ts$' || true)
[ -z "$ADMIN_IMPORTS" ] || fail "unexpected admin-client import: $ADMIN_IMPORTS"
for f in $(grep -rl '^"use client"' src); do
  if grep -qE 'from "@/lib/(supabase/(server|admin)|auth/session|rate-limit)"' "$f"; then fail "client component imports server-only module: $f"; fi
  if grep -qE 'process\.env\.(?!NEXT_PUBLIC_)' "$f" 2>/dev/null; then fail "client component reads a private env var: $f"; fi
done
ok "no secrets or server modules leak to the client"

step "2/8 Lint"
pnpm -s lint || fail "eslint"
ok "eslint clean"

step "3/8 Types"
pnpm -s tsc --noEmit -p . || fail "typescript"
ok "typescript clean"

step "4/8 Database: fresh migration + seed"
pnpm -s supabase db reset >/tmp/preflight-db.log 2>&1 || { tail -20 /tmp/preflight-db.log; fail "supabase db reset"; }
ok "migrations apply from zero"

step "5/8 Database: RLS / privilege regression suite"
OUT=$(scripts/psql.sh -q < supabase/tests/rls.sql 2>&1 || true)
echo "$OUT" | grep -E 'PASS|FAIL|ERROR' | sed 's/NOTICE:  //'
if echo "$OUT" | grep -qE 'FAIL|ERROR'; then fail "RLS suite"; fi
PASSES=$(echo "$OUT" | grep -c PASS || true)
[ "$PASSES" -ge 30 ] || fail "RLS suite ran only $PASSES assertions (expected >= 30)"
ok "$PASSES security assertions pass"

step "6/8 Every table has RLS enabled and anon has no table grants"
OPEN=$(scripts/psql.sh -qAt -c "select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relkind='r' and not relrowsecurity;")
[ -z "$OPEN" ] || fail "tables without RLS: $OPEN"
ANON=$(scripts/psql.sh -qAt -c "select table_name from information_schema.role_table_grants where grantee='anon' and table_schema='public';")
[ -z "$ANON" ] || fail "anon has grants on: $ANON"
DEFINERS=$(scripts/psql.sh -qAt -c "select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef and not coalesce(array_to_string(p.proconfig, ','), '') like '%search_path=%';")
[ -z "$DEFINERS" ] || fail "security definer functions without pinned search_path: $DEFINERS"
ok "RLS on every table; anon has zero grants; definers pin search_path"

step "7/8 Production build"
pnpm -s build >/tmp/preflight-build.log 2>&1 || { tail -40 /tmp/preflight-build.log; fail "next build"; }
grep -q "Proxy (Middleware)" /tmp/preflight-build.log || fail "proxy.ts not in build output"
ok "next build succeeded with proxy"

step "8/8 Security headers on a real production response"
PORT=3123
pkill -f "next start -p $PORT" >/dev/null 2>&1 || true
(pnpm -s start -p $PORT >/tmp/preflight-start.log 2>&1 &)
for i in $(seq 1 30); do curl -sf -o /dev/null "http://localhost:$PORT/" && break; sleep 1; done
HDRS=$(curl -sI "http://localhost:$PORT/" | tr -d '\r')
REDIR=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "http://localhost:$PORT/organizer")
pkill -f "next start -p $PORT" >/dev/null 2>&1 || true
for h in "content-security-policy: default-src 'self'" "x-frame-options: DENY" "strict-transport-security:" "x-content-type-options: nosniff" "referrer-policy:"; do
  echo "$HDRS" | grep -qi "$h" || fail "missing header: $h"
done
if echo "$HDRS" | grep -qi "x-powered-by"; then fail "x-powered-by leaks framework"; fi
if echo "$HDRS" | grep -qi "unsafe-eval"; then fail "production CSP contains unsafe-eval"; fi
echo "$REDIR" | grep -q "^307 .*/login" || fail "/organizer not gated for anonymous users ($REDIR)"
ok "CSP / HSTS / frame / sniff / referrer present; organizer routes gated"

TREE=$(git rev-parse 'HEAD^{tree}' 2>/dev/null || echo no-git)
DIRTY=$(git status --porcelain 2>/dev/null | sort | git hash-object --stdin)
printf '%s\n%s\n' "$TREE" "$DIRTY" | git hash-object --stdin > .preflight-ok
printf '\n%s✓ Preflight passed. Stamp %s%s\n' "$GRN" "$(cat .preflight-ok)" "$NC"
