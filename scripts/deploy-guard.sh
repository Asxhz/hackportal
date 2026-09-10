#!/usr/bin/env bash
# Claude Code PreToolUse hook. Reads the tool call from stdin and blocks any
# production Vercel deploy unless scripts/preflight.sh has passed on exactly the
# current working tree (tracked content + uncommitted changes).
set -uo pipefail
CMD=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$CMD" ] && exit 0
if ! printf '%s' "$CMD" | grep -Eq '\b(vercel|vc)\b.*(--prod\b|\bpromote\b)'; then exit 0; fi

ROOT=$(cd "$(dirname "$0")/.." && pwd)
STAMP="$ROOT/.preflight-ok"
if [ ! -f "$STAMP" ]; then
  echo "BLOCKED: production deploy without a preflight pass. Run: pnpm gate" >&2; exit 2
fi
CURRENT=$(cd "$ROOT" && {
    git ls-files -s 2>/dev/null
    git diff HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null | sort | while read -r f; do printf '%s ' "$f"; git hash-object "$f"; done
  } | git hash-object --stdin)
if [ "$(cat "$STAMP")" != "$CURRENT" ]; then
  echo "BLOCKED: working tree changed since the last preflight pass. Run: pnpm gate" >&2; exit 2
fi
for v in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY SUPABASE_SECRET_KEY NEXT_PUBLIC_SITE_URL; do
  if ! (cd "$ROOT" && vercel env ls production 2>/dev/null | grep -q "$v"); then
    echo "BLOCKED: production env is missing $v (vercel env ls production)" >&2; exit 2
  fi
done
exit 0
