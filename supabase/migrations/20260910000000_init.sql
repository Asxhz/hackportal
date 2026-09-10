-- =============================================================================
-- HackPortal schema
-- Design principles:
--   * Every table has RLS enabled. No table is readable/writable by default.
--   * Roles/privileges are stored server-side only (profiles.role). Clients can
--     never write them; column-level GRANTs + triggers enforce this.
--   * State transitions (draft -> submitted -> decision) are enforced in the DB
--     by triggers, so the app layer cannot be bypassed via direct PostgREST calls.
--   * All audit rows are written by SECURITY DEFINER trigger functions only.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- enums --------------------------------------------------------------
create type public.account_type as enum ('hacker', 'judge', 'mentor', 'volunteer');
create type public.user_role    as enum ('applicant', 'organizer');
create type public.app_status   as enum ('draft', 'submitted', 'under_review', 'accepted', 'waitlisted', 'rejected');

-- ---------- helpers ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Authoritative organizer check for RLS. Reads the DB, not the JWT, so a role
-- revocation takes effect immediately (the JWT claim is only used for fast UI gating).
create or replace function public.is_organizer()
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  return exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'organizer'
  );
end $$;
revoke all on function public.is_organizer() from public, anon;
grant execute on function public.is_organizer() to authenticated;

-- ---------- organizer allowlist -------------------------------------------------
-- Emails here become organizers at signup. No client policies -> only service role / SQL.
create table public.organizer_allowlist (
  email      text primary key check (email = lower(email)),
  added_at   timestamptz not null default now()
);
alter table public.organizer_allowlist enable row level security;
revoke all on public.organizer_allowlist from anon, authenticated;

-- ---------- profiles -------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text not null default '' check (char_length(full_name) <= 120),
  account_type  public.account_type not null,
  role          public.user_role not null default 'applicant',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.profiles enable row level security;
create index profiles_role_idx on public.profiles(role) where role = 'organizer';

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Clients can only edit their display name and account type. role/email/id are locked.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, account_type) on public.profiles to authenticated;

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: organizers read all"
  on public.profiles for select to authenticated
  using ((select public.is_organizer()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Account type may only change while no non-draft application exists.
create or replace function public.profiles_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.account_type <> old.account_type then
    if exists (
      select 1 from public.applications a
      where a.user_id = old.id and a.status <> 'draft'
    ) then
      raise exception 'account type is locked after submission' using errcode = 'P0001';
    end if;
    -- a draft for the old track is no longer meaningful
    delete from public.applications where user_id = old.id and status = 'draft';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.profiles_guard();

-- Create the profile row when an auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested text := coalesce(new.raw_user_meta_data ->> 'account_type', 'hacker');
  acct public.account_type;
  is_org boolean;
begin
  -- Validate the client-supplied metadata; fall back rather than fail signup.
  begin
    acct := requested::public.account_type;
  exception when others then
    acct := 'hacker';
  end;

  is_org := exists (select 1 from public.organizer_allowlist w where w.email = lower(new.email));

  insert into public.profiles (id, email, full_name, account_type, role)
  values (
    new.id,
    lower(new.email),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    acct,
    case when is_org then 'organizer'::public.user_role else 'applicant'::public.user_role end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- applications -------------------------------------------------------------
create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references public.profiles(id) on delete cascade,
  track         public.account_type not null,
  status        public.app_status not null default 'draft',
  answers       jsonb not null default '{}'::jsonb
                check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 32768),
  version       integer not null default 1,            -- optimistic concurrency
  submitted_at  timestamptz,
  decided_at    timestamptz,
  decided_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.applications enable row level security;
create index applications_status_idx on public.applications(status);
create index applications_track_status_idx on public.applications(track, status);
create index applications_submitted_idx on public.applications(submitted_at desc) where status <> 'draft';

create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

revoke all on public.applications from anon, authenticated;
grant select, insert, update on public.applications to authenticated;

create policy "applications: read own"
  on public.applications for select to authenticated
  using (user_id = (select auth.uid()));

create policy "applications: organizers read all"
  on public.applications for select to authenticated
  using ((select public.is_organizer()));

create policy "applications: create own draft"
  on public.applications for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'draft'
    and track = (select p.account_type from public.profiles p where p.id = (select auth.uid()))
  );

create policy "applications: applicant edits own draft"
  on public.applications for update to authenticated
  using (user_id = (select auth.uid()) and status = 'draft')
  with check (user_id = (select auth.uid()) and status in ('draft', 'submitted'));

create policy "applications: organizers update"
  on public.applications for update to authenticated
  using ((select public.is_organizer()))
  with check ((select public.is_organizer()));

-- State machine + field-level protection, enforced regardless of caller path.
create or replace function public.applications_guard()
returns trigger language plpgsql set search_path = '' as $$
declare
  -- An organizer editing their *own* application is treated as an applicant.
  org boolean := public.is_organizer() and old.user_id <> (select auth.uid());
begin
  if new.user_id <> old.user_id or new.track <> old.track or new.created_at <> old.created_at then
    raise exception 'immutable column changed' using errcode = '42501';
  end if;

  if not org then
    -- Applicants: only draft -> draft (autosave) or draft -> submitted.
    if old.status <> 'draft' then
      raise exception 'application is locked after submission' using errcode = '42501';
    end if;
    if new.status not in ('draft', 'submitted') then
      raise exception 'invalid status transition' using errcode = '42501';
    end if;
    if new.decided_at is distinct from old.decided_at or new.decided_by is distinct from old.decided_by then
      raise exception 'immutable column changed' using errcode = '42501';
    end if;
  else
    -- Organizers: may move status forward, never touch answers.
    if new.answers <> old.answers then
      raise exception 'organizers cannot edit answers' using errcode = '42501';
    end if;
    if old.status = 'draft' then
      raise exception 'drafts cannot be reviewed' using errcode = '42501';
    end if;
    if new.status = 'draft' then
      raise exception 'cannot revert to draft' using errcode = '42501';
    end if;
  end if;

  -- optimistic concurrency: writers must send the version they read
  if new.version <> old.version then
    raise exception 'version conflict' using errcode = '40001';
  end if;
  new.version := old.version + 1;

  if new.status = 'submitted' and old.status = 'draft' then
    new.submitted_at := now();
  end if;
  if new.status in ('accepted', 'waitlisted', 'rejected') and old.status <> new.status then
    new.decided_at := now();
    new.decided_by := (select auth.uid());
  end if;
  return new;
end $$;
create trigger applications_guard before update on public.applications
  for each row execute function public.applications_guard();

-- ---------- reviews ---------------------------------------------------------------
create table public.reviews (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  reviewer_id     uuid not null references public.profiles(id) on delete cascade,
  scores          jsonb not null check (jsonb_typeof(scores) = 'object' and pg_column_size(scores) <= 2048),
  overall         smallint not null check (overall between 1 and 5),
  notes           text not null default '' check (char_length(notes) <= 4000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (application_id, reviewer_id)
);
alter table public.reviews enable row level security;
create index reviews_application_idx on public.reviews(application_id);

create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

revoke all on public.reviews from anon, authenticated;
grant select, insert, update, delete on public.reviews to authenticated;

create policy "reviews: organizers read"
  on public.reviews for select to authenticated
  using ((select public.is_organizer()));

create policy "reviews: organizers write own"
  on public.reviews for insert to authenticated
  with check ((select public.is_organizer()) and reviewer_id = (select auth.uid()));

create policy "reviews: organizers edit own"
  on public.reviews for update to authenticated
  using ((select public.is_organizer()) and reviewer_id = (select auth.uid()))
  with check (reviewer_id = (select auth.uid()));

create policy "reviews: organizers delete own"
  on public.reviews for delete to authenticated
  using ((select public.is_organizer()) and reviewer_id = (select auth.uid()));

-- Reviews are only allowed on submitted / under_review applications; first review
-- moves the application into under_review.
create or replace function public.reviews_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  st public.app_status;
begin
  select status into st from public.applications where id = new.application_id;
  if st is null or st = 'draft' then
    raise exception 'cannot review a draft' using errcode = '42501';
  end if;
  if tg_op = 'INSERT' and st = 'submitted' then
    update public.applications
       set status = 'under_review'
     where id = new.application_id;
  end if;
  return new;
end $$;
create trigger reviews_guard before insert or update on public.reviews
  for each row execute function public.reviews_guard();

-- ---------- audit log -----------------------------------------------------------------
create table public.application_events (
  id              bigint generated always as identity primary key,
  application_id  uuid not null references public.applications(id) on delete cascade,
  actor_id        uuid references public.profiles(id) on delete set null,
  event           text not null check (char_length(event) <= 40),
  -- 'applicant' events are visible to the applicant; 'internal' only to organizers
  visibility      text not null default 'internal' check (visibility in ('applicant', 'internal')),
  meta            jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);
alter table public.application_events enable row level security;
create index application_events_app_idx on public.application_events(application_id, created_at desc);

revoke all on public.application_events from anon, authenticated;
grant select on public.application_events to authenticated;
-- No insert/update/delete grants: only trigger functions (security definer) write here.

create policy "events: applicant reads own public events"
  on public.application_events for select to authenticated
  using (
    visibility = 'applicant'
    and exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = (select auth.uid())
    )
  );

create policy "events: organizers read all"
  on public.application_events for select to authenticated
  using ((select public.is_organizer()));

create or replace function public.log_application_event()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
begin
  if tg_table_name = 'applications' then
    if tg_op = 'INSERT' then
      insert into public.application_events (application_id, actor_id, event, visibility)
      values (new.id, actor, 'created', 'applicant');
    elsif new.status <> old.status then
      insert into public.application_events (application_id, actor_id, event, visibility, meta)
      values (
        new.id, actor, 'status_changed',
        case when new.status = 'under_review' then 'internal' else 'applicant' end,
        jsonb_build_object('from', old.status, 'to', new.status)
      );
    end if;
  elsif tg_table_name = 'reviews' then
    insert into public.application_events (application_id, actor_id, event, visibility, meta)
    values (
      new.application_id, actor,
      case when tg_op = 'INSERT' then 'review_added' else 'review_updated' end,
      'internal',
      jsonb_build_object('overall', new.overall)
    );
  end if;
  return null;
end $$;
create trigger applications_audit after insert or update on public.applications
  for each row execute function public.log_application_event();
create trigger reviews_audit after insert or update on public.reviews
  for each row execute function public.log_application_event();

-- ---------- organizer RPCs -------------------------------------------------------------
-- Promote another user to organizer. Only organizers may call it. Logged.
create or replace function public.promote_to_organizer(target_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  updated int;
begin
  if not public.is_organizer() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.profiles set role = 'organizer' where email = lower(target_email) and role <> 'organizer';
  get diagnostics updated = row_count;
  if updated = 0 then
    -- Allowlist so the promotion applies when they sign up later.
    insert into public.organizer_allowlist (email) values (lower(target_email)) on conflict do nothing;
  end if;
end $$;
revoke all on function public.promote_to_organizer(text) from public, anon;
grant execute on function public.promote_to_organizer(text) to authenticated;

-- Aggregated organizer dashboard stats in one round trip.
create or replace function public.application_stats()
returns table (track public.account_type, status public.app_status, count bigint)
language sql stable security invoker set search_path = '' as $$
  select a.track, a.status, count(*)::bigint
  from public.applications a
  where a.status <> 'draft'
  group by a.track, a.status;
$$;
revoke all on function public.application_stats() from public, anon;
grant execute on function public.application_stats() to authenticated;

-- ---------- rate limiting (service role only) -------------------------------------------
-- Fixed-window counter keyed by an opaque hash computed server-side. Called only via the
-- service-role client, so anonymous clients cannot poison counters.
create table public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null,
  hits          integer not null default 0
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  now_ts timestamptz := now();
  allowed boolean;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now_ts, 1)
  on conflict (key) do update
    set hits = case when r.window_start + make_interval(secs => p_window_seconds) < now_ts then 1 else r.hits + 1 end,
        window_start = case when r.window_start + make_interval(secs => p_window_seconds) < now_ts then now_ts else r.window_start end
  returning hits <= p_limit into allowed;
  -- opportunistic cleanup of stale windows (cheap: primary key scan bounded by table size)
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now_ts - interval '1 day';
  end if;
  return allowed;
end $$;
revoke all on function public.consume_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, int, int) to service_role;

-- ---------- JWT claims hook ------------------------------------------------------------------
-- Adds user_role + account_type to the access token so the Next.js proxy can gate routes
-- with a local signature check (no DB round trip). RLS never trusts these claims.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  claims jsonb := coalesce(event -> 'claims', '{}'::jsonb);
  p record;
begin
  select role, account_type into p from public.profiles where id = (event ->> 'user_id')::uuid;
  if found then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(p.role::text));
    claims := jsonb_set(claims, '{account_type}', to_jsonb(p.account_type::text));
  end if;
  return jsonb_set(event, '{claims}', claims);
end $$;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant select on public.profiles to supabase_auth_admin;
create policy "profiles: auth admin reads for claims"
  on public.profiles for select to supabase_auth_admin using (true);

-- ---------- privilege hygiene ------------------------------------------------------------------
-- Trigger functions are invoked by Postgres, never by API callers. Supabase's default privileges
-- would otherwise grant EXECUTE to anon/authenticated; take it away so `information_schema`
-- shows exactly the surface we intend to expose.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.profiles_guard() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.applications_guard() from public, anon, authenticated;
revoke all on function public.reviews_guard() from public, anon, authenticated;
revoke all on function public.log_application_event() from public, anon, authenticated;
