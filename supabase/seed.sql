-- Local development seed. NEVER run against production.
-- Password for every seeded account: Password123!!

insert into public.organizer_allowlist (email) values ('organizer@calhacks.test');

create or replace function pg_temp.seed_user(p_email text, p_name text, p_type text)
returns uuid language plpgsql as $$
declare uid uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', p_email,
    extensions.crypt('Password123!!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_name, 'account_type', p_type),
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', p_email, 'email_verified', true), 'email', now(), now(), now());
  return uid;
end $$;

do $$
declare
  org uuid; h1 uuid; h2 uuid; j1 uuid; m1 uuid; v1 uuid; app uuid;
begin
  org := pg_temp.seed_user('organizer@calhacks.test', 'Oski Bear', 'hacker');
  h1  := pg_temp.seed_user('hacker@calhacks.test', 'Ada Lovelace', 'hacker');
  h2  := pg_temp.seed_user('hacker2@calhacks.test', 'Grace Hopper', 'hacker');
  j1  := pg_temp.seed_user('judge@calhacks.test', 'Alan Turing', 'judge');
  m1  := pg_temp.seed_user('mentor@calhacks.test', 'Katherine Johnson', 'mentor');
  v1  := pg_temp.seed_user('volunteer@calhacks.test', 'Linus Torvalds', 'volunteer');

  -- A submitted hacker application
  insert into public.applications (user_id, track, status, answers) values (h1, 'hacker', 'draft', '{}') returning id into app;
  update public.applications set answers = jsonb_build_object(
      'school','UC Berkeley','grad_year','2027','level_of_study','undergraduate','major','EECS',
      'hackathons_attended','1-3','github','https://github.com/ada','linkedin','','portfolio','',
      'why','I want to build something with people who care about craft. Cal Hacks is the place where ideas get shipped in 36 hours and I want to be in that room.',
      'proud_project','Built a compiler for a toy language in Rust over a summer; learned more from the failing tests than from any lecture.',
      'team_status','looking','dietary','none','shirt_size','M','agree_coc',true,'agree_mlh_data',true
    ), status = 'submitted' where id = app;

  -- A submitted judge application
  insert into public.applications (user_id, track, status, answers) values (j1, 'judge', 'draft', '{}') returning id into app;
  update public.applications set answers = jsonb_build_object(
      'company','Anthropic','title','Staff Engineer','years_experience','10+','expertise',array['ai_ml','systems'],
      'judged_before','yes','linkedin','https://linkedin.com/in/alan','availability',array['sunday_am','sunday_pm'],
      'motivation','I love seeing what students build when constraints are tight and the stakes are low.','agree_coc',true
    ), status = 'submitted' where id = app;

  -- Draft mentor application (should not be visible to organizers' review queue)
  insert into public.applications (user_id, track, status, answers) values (m1, 'mentor', 'draft', '{"company":"Stripe"}');

  -- A submitted volunteer application
  insert into public.applications (user_id, track, status, answers) values (v1, 'volunteer', 'draft', '{}') returning id into app;
  update public.applications set answers = jsonb_build_object(
      'school','UC Berkeley','shifts',array['sat_am','sat_pm','sun_am'],'why','I attended last year and want to give back.',
      'has_car','no','shirt_size','L','agree_coc',true
    ), status = 'submitted' where id = app;
end $$;
