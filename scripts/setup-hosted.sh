#!/usr/bin/env bash
# =============================================================================
# One-shot provisioning of the hosted Supabase project + Vercel environment.
#
# Prereqs (interactive, once):   supabase login     vercel login
# Usage:  scripts/setup-hosted.sh <org-id> <project-name> <db-password> <organizer-email> [region]
#
# What it does, in order:
#   1. creates the Supabase project (or reuses one with the same name)
#   2. links this repo to it and pushes supabase/migrations
#   3. enables the custom access-token hook, sets site/redirect URLs,
#      disables email confirmation (no SMTP on free tier), 10-char passwords
#   4. seeds the organizer allowlist with your email
#   5. writes NEXT_PUBLIC_* / SUPABASE_SECRET_KEY into Vercel production+preview
# Idempotent: safe to re-run.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

ORG_ID=${1:?org id (supabase orgs list)}
NAME=${2:?project name}
DB_PASS=${3:?db password}
ORGANIZER_EMAIL=${4:?organizer email}
REGION=${5:-us-west-1}
SITE_URL=${SITE_URL:-}

TOKEN=${SUPABASE_ACCESS_TOKEN:-$(security find-generic-password -s "Supabase CLI" -w 2>/dev/null || true)}
[ -n "$TOKEN" ] || { echo "run: supabase login" >&2; exit 1; }
api() { curl -sfS -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }

echo "▶ project"
REF=$(api https://api.supabase.com/v1/projects | jq -r --arg n "$NAME" '.[] | select(.name==$n) | .id' | head -1)
if [ -z "$REF" ]; then
  REF=$(api -X POST https://api.supabase.com/v1/projects \
    -d "$(jq -n --arg o "$ORG_ID" --arg n "$NAME" --arg p "$DB_PASS" --arg r "$REGION" '{organization_id:$o,name:$n,db_pass:$p,region:$r}')" | jq -r .id)
  echo "  created $REF"
else
  echo "  reusing $REF"
fi
for i in $(seq 1 60); do
  STATUS=$(api "https://api.supabase.com/v1/projects/$REF" | jq -r .status)
  [ "$STATUS" = "ACTIVE_HEALTHY" ] && break
  printf '  waiting (%s)\r' "$STATUS"; sleep 5
done
echo "  status $STATUS"

echo "▶ link + push migrations"
pnpm -s supabase link --project-ref "$REF" -p "$DB_PASS" >/dev/null
pnpm -s supabase db push -p "$DB_PASS" --include-all

echo "▶ api keys"
fetch_keys() { api "https://api.supabase.com/v1/projects/$REF/api-keys?reveal=true"; }
KEYS=$(fetch_keys)
PUBLISHABLE=$(echo "$KEYS" | jq -r '[.[] | select(.type=="publishable")][0].api_key // empty')
SECRET=$(echo "$KEYS" | jq -r '[.[] | select(.type=="secret")][0].api_key // empty')
if [ -z "$PUBLISHABLE" ] || [ -z "$SECRET" ]; then
  [ -n "$PUBLISHABLE" ] || api -X POST "https://api.supabase.com/v1/projects/$REF/api-keys" -d '{"type":"publishable","name":"default"}' >/dev/null
  [ -n "$SECRET" ]      || api -X POST "https://api.supabase.com/v1/projects/$REF/api-keys" -d '{"type":"secret","name":"default"}' >/dev/null
  KEYS=$(fetch_keys)
  PUBLISHABLE=$(echo "$KEYS" | jq -r '[.[] | select(.type=="publishable")][0].api_key')
  SECRET=$(echo "$KEYS" | jq -r '[.[] | select(.type=="secret")][0].api_key')
fi
SUPA_URL="https://$REF.supabase.co"

echo "▶ vercel env"
if [ -z "$SITE_URL" ]; then
  SITE_URL="https://$(vercel project inspect hackportal 2>/dev/null | grep -oE '[a-z0-9-]+\.vercel\.app' | head -1)"
fi
setenv() { # name value environment
  vercel env remove "$1" "$3" --yes >/dev/null 2>&1 || true
  printf '%s' "$2" | vercel env add "$1" "$3" >/dev/null
}
for ENV in production preview; do
  setenv NEXT_PUBLIC_SUPABASE_URL "$SUPA_URL" $ENV
  setenv NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY "$PUBLISHABLE" $ENV
  setenv SUPABASE_SECRET_KEY "$SECRET" $ENV
  setenv NEXT_PUBLIC_SITE_URL "$SITE_URL" $ENV
done
echo "  site url $SITE_URL"

echo "▶ auth config"
api -X PATCH "https://api.supabase.com/v1/projects/$REF/config/auth" -d "$(jq -n --arg s "$SITE_URL" '{
  site_url: $s,
  uri_allow_list: ($s + "/**"),
  mailer_autoconfirm: true,
  password_min_length: 10,
  jwt_exp: 3600,
  refresh_token_rotation_enabled: true,
  security_refresh_token_reuse_interval: 10,
  hook_custom_access_token_enabled: true,
  hook_custom_access_token_uri: "pg-functions://postgres/public/custom_access_token_hook",
  disable_signup: false,
  external_email_enabled: true
}')" >/dev/null && echo "  hook enabled, autoconfirm on, site url set"

echo "▶ organizer allowlist"
ESCAPED=${ORGANIZER_EMAIL//\'/\'\'}
SQL="insert into public.organizer_allowlist (email) values (lower('$ESCAPED')) on conflict do nothing; update public.profiles set role = 'organizer' where email = lower('$ESCAPED');"
api -X POST "https://api.supabase.com/v1/projects/$REF/database/query" -d "$(jq -n --arg q "$SQL" '{query:$q}')" >/dev/null \
  && echo "  $ORGANIZER_EMAIL will be an organizer"

echo
echo "Done. Next: pnpm gate && vercel --prod"
