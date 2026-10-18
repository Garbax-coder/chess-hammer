-- Prova delle funzioni della dashboard di amministrazione (migrazione 0029).
-- Da eseguire SOLO sul progetto di sviluppo: tutto avviene in una transazione
-- annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/admin-dashboard.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'admin-test-%@example.com';

-- Un amministratore e un utente qualsiasi, con una sessione da 2 puzzle il cui
-- giro 1 si e' concluso un'ora fa, e un tentativo in pratica libera.
create temp table ids as
select gen_random_uuid() as admin_id, gen_random_uuid() as user_id, gen_random_uuid() as session_id;
grant select on ids to authenticated, anon;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, admin_id, 'authenticated', 'authenticated',
       'admin-test-admin@example.com', '', now(), now() - interval '40 days', now(),
       '{"provider": "email", "providers": ["email"], "admin": true}'::jsonb, '{}'::jsonb
  from ids
union all
select '00000000-0000-0000-0000-000000000000'::uuid, user_id, 'authenticated', 'authenticated',
       'admin-test-user@example.com', '', now(), now() - interval '2 hours', now(),
       '{"provider": "email", "providers": ["email"]}'::jsonb, '{}'::jsonb
  from ids;

insert into public.training_sessions (id, user_id, total_puzzles, daily_target_round1,
                                      daily_target_round2, daily_target_round3, current_round)
select session_id, user_id, 2, 10, 20, 40, 2 from ids;

insert into public.session_puzzles (session_id, puzzle_id, order_index)
select i.session_id, p.puzzle_id, p.n
  from ids i,
       (select puzzle_id, row_number() over (order by puzzle_id) as n
          from public.lichess_puzzles order by puzzle_id limit 2) p;

insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                    elo_before, elo_after, attempted_at)
select sp.id, 1, case when sp.order_index = 1 then 'solved' else 'failed' end, 10,
       1500, 1500, now() - interval '1 hour' - (2 - sp.order_index) * interval '1 minute'
  from public.session_puzzles sp, ids i
 where sp.session_id = i.session_id;

insert into public.practice_attempts (user_id, puzzle_id, result, time_seconds)
select i.user_id, sp.puzzle_id, 'solved', 5
  from ids i join public.session_puzzles sp on sp.session_id = i.session_id
 where sp.order_index = 1;

-- Chi non e' amministratore riceve un errore da ogni funzione.
select set_config('request.jwt.claims',
                  json_build_object('sub', user_id, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  calls text[] := array[
    'select public.admin_stats(''UTC'')',
    'select public.admin_list_users()',
    'select public.admin_user_detail((select user_id from ids))',
    'select public.admin_session_puzzles((select session_id from ids))'
  ];
  c text;
begin
  if public.is_admin() then
    raise exception 'is_admin() vero per un utente normale';
  end if;
  foreach c in array calls loop
    begin
      execute c;
      raise exception 'un utente normale ha potuto eseguire: %', c;
    exception when insufficient_privilege then
      null;
    end;
  end loop;
end $$;
reset role;

-- Anonimi: nemmeno il permesso di chiamarle.
set local role anon;
do $$
begin
  begin
    perform public.admin_list_users();
    raise exception 'un anonimo ha potuto chiamare admin_list_users()';
  exception when insufficient_privilege then
    null;
  end;
end $$;
reset role;

-- L'amministratore vede i dati di tutti.
select set_config('request.jwt.claims',
                  json_build_object('sub', admin_id, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  s jsonb;
  d jsonb;
  hourly_sum int;
  daily_sum int;
  ok boolean;
begin
  if not public.is_admin() then
    raise exception 'is_admin() falso per l''amministratore';
  end if;

  s := public.admin_stats('Europe/Rome');
  if jsonb_array_length(s -> 'hourly') <> 24 or jsonb_array_length(s -> 'daily') <> 30 then
    raise exception 'admin_stats: attesi 24 intervalli orari e 30 giornalieri, trovati % e %',
      jsonb_array_length(s -> 'hourly'), jsonb_array_length(s -> 'daily');
  end if;
  select sum((h ->> 'rounds_completed')::int) into hourly_sum from jsonb_array_elements(s -> 'hourly') h;
  select sum((h ->> 'rounds_completed')::int) into daily_sum from jsonb_array_elements(s -> 'daily') h;
  if hourly_sum < 1 or daily_sum < 1 then
    raise exception 'admin_stats: il giro 1 concluso non risulta (ore %, giorni %)', hourly_sum, daily_sum;
  end if;
  select sum((h ->> 'signups')::int) into hourly_sum from jsonb_array_elements(s -> 'hourly') h;
  if hourly_sum < 1 then
    raise exception 'admin_stats: la registrazione di 2 ore fa non risulta';
  end if;
  select sum((h ->> 'practice_attempts')::int) into daily_sum from jsonb_array_elements(s -> 'daily') h;
  if daily_sum < 1 then
    raise exception 'admin_stats: il tentativo in pratica libera non risulta';
  end if;

  select exists (
    select 1 from public.admin_list_users() u, ids
     where u.id = ids.user_id and u.sessions_count = 1 and u.active_session_round = 2
       and not u.is_admin
  ) into ok;
  if not ok then
    raise exception 'admin_list_users: utente di prova assente o con dati sbagliati';
  end if;

  d := public.admin_user_detail((select user_id from ids));
  if d -> 'account' ->> 'email' <> 'admin-test-user@example.com'
     or jsonb_array_length(d -> 'sessions') <> 1
     or (d -> 'sessions' -> 0 ->> 'pool_size')::int <> 2
     or jsonb_array_length(d -> 'elo_history') <> 2
     or (d -> 'practice' ->> 'attempted')::int <> 1 then
    raise exception 'admin_user_detail: dati inattesi %', d;
  end if;

  d := public.admin_session_puzzles((select session_id from ids));
  if jsonb_array_length(d) <> 2 or jsonb_array_length(d -> 0 -> 'attempts') <> 1 then
    raise exception 'admin_session_puzzles: dati inattesi %', d;
  end if;

  raise notice 'admin-dashboard: tutti i controlli superati';
end $$;
reset role;

rollback;
