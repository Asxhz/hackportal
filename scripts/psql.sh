#!/usr/bin/env bash
# Run SQL against the local Supabase database. Usage: scripts/psql.sh < file.sql  |  scripts/psql.sh -c "select 1"
set -euo pipefail
exec docker exec -i supabase_db_hackportal psql -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"
