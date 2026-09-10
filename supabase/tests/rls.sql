-- =============================================================================
-- Security regression suite. Runs against the local stack (scripts/psql.sh < this).
-- Each block impersonates a real JWT role via `set local role` + request.jwt.claims,
-- exactly as PostgREST does, and asserts the policy/trigger outcome.
-- Any failing assertion raises and aborts the transaction -> non-zero exit.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

create or replace function pg_temp.impersonate(p_email text) returns void language plpgsql as $$
declare uid uuid; r text;
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
  select id, role::text into uid, r from public.profiles where email = p_email;
  if uid is null then raise exception 'no such seeded user %', p_email; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated', 'email', p_email, 'user_role', r)::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

create or replace function pg_temp.reset() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
end $$;

create or replace function pg_temp.expect_error(p_sql text, p_label text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    raise notice 'PASS  %  (%)', p_label, sqlerrm;
    return;
  end;
  raise exception 'FAIL  %  -- expected an error, statement succeeded', p_label;
end $$;

create or replace function pg_temp.expect_count(p_sql text, p_expected bigint, p_label text) returns void language plpgsql as $$
declare n bigint;
begin
  execute p_sql into n;
  if n <> p_expected then raise exception 'FAIL  %  -- expected % got %', p_label, p_expected, n; end if;
  raise notice 'PASS  %  (=%)', p_label, n;
end $$;

-- ---------------------------------------------------------------- applicant isolation
select pg_temp.impersonate('hacker@calhacks.test');
select pg_temp.expect_count('select count(*) from public.profiles', 1, 'applicant sees only own profile');
select pg_temp.expect_count('select count(*) from public.applications', 1, 'applicant sees only own application');
select pg_temp.expect_count('select count(*) from public.reviews', 0, 'applicant cannot read reviews');
select pg_temp.expect_count('select count(*) from public.application_events where visibility = ''internal''', 0, 'applicant cannot read internal events');
select pg_temp.expect_error('select count(*) from public.organizer_allowlist', 'applicant cannot read allowlist (no grant)');
select pg_temp.expect_error('select count(*) from public.rate_limits', 'applicant cannot read rate limits (no grant)');

-- privilege escalation attempts
select pg_temp.expect_error('update public.profiles set role = ''organizer''', 'applicant cannot change own role (column privilege)');
select pg_temp.expect_count('with u as (update public.applications set status = ''accepted'' returning 1) select count(*) from u', 0, 'applicant cannot self-accept: RLS hides non-draft rows from update');
select pg_temp.expect_error('insert into public.reviews (application_id, reviewer_id, scores, overall) select id, user_id, ''{}'', 5 from public.applications', 'applicant cannot insert a review');
select pg_temp.expect_error('insert into public.application_events (application_id, event) select id, ''x'' from public.applications', 'applicant cannot forge audit events');
select pg_temp.expect_error('select public.consume_rate_limit(''k'', 1, 60)', 'applicant cannot call rate-limit RPC');
select pg_temp.expect_error('select public.promote_to_organizer(''hacker@calhacks.test'')', 'applicant cannot promote');
select pg_temp.expect_count('with u as (update public.applications set answers = ''{"school":"MIT"}'' returning 1) select count(*) from u', 0, 'applicant cannot edit answers after submission (0 rows)');
select pg_temp.expect_error('update public.profiles set account_type = ''judge''', 'applicant cannot switch track after submission');

-- a draft owner may save/submit but never skip ahead
select pg_temp.impersonate('mentor@calhacks.test');
select pg_temp.expect_error('update public.applications set status = ''accepted''', 'draft owner cannot self-accept (with check)');
select pg_temp.expect_error('update public.applications set status = ''under_review''', 'draft owner cannot self-advance to under_review');
select pg_temp.expect_error('update public.applications set decided_by = (select auth.uid())', 'draft owner cannot forge decided_by');
select pg_temp.expect_error('update public.applications set version = 42', 'draft owner cannot tamper with version');
select pg_temp.expect_error('update public.applications set user_id = gen_random_uuid()', 'draft owner cannot reassign ownership (immutable)');
select pg_temp.expect_error('update public.applications set track = ''judge''', 'draft owner cannot change track on the application (immutable)');
select pg_temp.expect_count('with u as (update public.applications set answers = ''{"company":"Acme"}'' returning 1) select count(*) from u', 1, 'draft owner CAN autosave answers');

-- second applicant cannot touch first applicant's rows (RLS: 0 rows affected, not an error)
select pg_temp.impersonate('hacker2@calhacks.test');
select pg_temp.expect_count('select count(*) from public.applications', 0, 'other applicant sees zero foreign applications');
select pg_temp.expect_error('insert into public.applications (user_id, track) values ((select id from public.profiles where email = ''hacker2@calhacks.test''), ''judge'')', 'applicant cannot create application for a different track than their profile');
select pg_temp.expect_error('insert into public.applications (user_id, track, status) values ((select id from public.profiles where email = ''hacker2@calhacks.test''), ''hacker'', ''accepted'')', 'applicant cannot create a pre-accepted application');

-- ---------------------------------------------------------------- organizer powers & limits
select pg_temp.impersonate('organizer@calhacks.test');
select pg_temp.expect_count('select count(*) from public.applications where status <> ''draft''', 3, 'organizer sees all submitted applications (seed has 3)');
select pg_temp.expect_count('select count(*) from public.application_events', (select count(*) from public.application_events), 'organizer sees every audit event');
select pg_temp.expect_error('update public.applications set answers = ''{}'' where status <> ''draft''', 'organizer cannot edit applicant answers');
select pg_temp.expect_error('update public.applications set status = ''draft'' where status <> ''draft''', 'organizer cannot revert to draft');
select pg_temp.expect_error('update public.applications set status = ''accepted'', version = 999 where status = ''submitted''', 'stale version is rejected (optimistic locking)');
select pg_temp.expect_error('insert into public.reviews (application_id, reviewer_id, scores, overall) select id, (select id from public.profiles where email = ''hacker@calhacks.test''), ''{}'', 5 from public.applications limit 1', 'organizer cannot write a review as someone else');
select pg_temp.expect_error('insert into public.reviews (application_id, reviewer_id, scores, overall) select id, (select id from public.profiles where email = ''organizer@calhacks.test''), ''{}'', 5 from public.applications where status = ''draft'' limit 1', 'organizer cannot review a draft');

-- ---------------------------------------------------------------- anon
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select set_config('role', 'anon', true);
select pg_temp.expect_error('select count(*) from public.profiles', 'anon cannot read profiles');
select pg_temp.expect_error('select count(*) from public.applications', 'anon cannot read applications');
select pg_temp.expect_error('select public.is_organizer()', 'anon cannot call is_organizer');

select pg_temp.reset();
rollback;
