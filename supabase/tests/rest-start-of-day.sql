-- Prova della migrazione 0030 (pausa fino all'inizio del giorno, quota nel
-- fuso di chi gioca, statistiche per giro). Da eseguire SOLO sul progetto di
-- sviluppo: tutto avviene in una transazione annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/rest-start-of-day.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'rest-test-%@example.com';

-- Due utenti, ciascuno con una sessione da 2 puzzle e quota 2 al giorno.
create temp table ids as
select gen_random_uuid() as user_a, gen_random_uuid() as user_b,
       gen_random_uuid() as session_a, gen_random_uuid() as session_b;
grant select on ids to authenticated;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, u, 'authenticated', 'authenticated',
       e, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  from ids, lateral (values (user_a, 'rest-test-a@example.com'),
                            (user_b, 'rest-test-b@example.com')) v(u, e);

insert into public.training_sessions (id, user_id, total_puzzles, daily_target_round1,
                                      daily_target_round2, daily_target_round3, rest_days)
select session_a, user_a, 2, 2, 2, 2, 2 from ids
union all
select session_b, user_b, 5, 2, 2, 2, 0 from ids;

insert into public.session_puzzles (session_id, puzzle_id, order_index)
select s, p.puzzle_id, p.n
  from ids, lateral (values (session_a), (session_b)) v(s),
       (select puzzle_id, row_number() over (order by puzzle_id) as n
          from public.lichess_puzzles order by puzzle_id limit 2) p;

-- Utente B: un tentativo di oggi per l'ora italiana ma di ieri per l'UTC
-- (un minuto dopo la mezzanotte di Roma, che in UTC e' ancora il giorno prima).
insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                    elo_before, elo_after, attempted_at)
select sp.id, 1, 'solved', 10, 1500, 1500,
       (date_trunc('day', now() at time zone 'Europe/Rome') at time zone 'Europe/Rome')
         + interval '1 minute'
  from public.session_puzzles sp, ids
 where sp.session_id = ids.session_b and sp.order_index = 1;

-- Utente A: conclude il giro 1 (2 puzzle su 2) dichiarando il fuso di Roma.
select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  r jsonb;
  sp record;
  expected timestamptz :=
    (date_trunc('day', now() at time zone 'Europe/Rome') + interval '2 days') at time zone 'Europe/Rome';
begin
  for sp in select p.id, l.rating from public.session_puzzles p
              join public.lichess_puzzles l on l.puzzle_id = p.puzzle_id
             where p.session_id = (select session_a from ids) order by p.order_index loop
    r := public.record_attempt_and_get_next_puzzle(
      (select session_a from ids), sp.id, 1::smallint, 'solved', 12, sp.rating, 'Europe/Rome');
  end loop;
  if r ->> 'status' <> 'resting' then
    raise exception 'fine giro 1: atteso resting, ottenuto %', r;
  end if;
  if (r ->> 'restingUntil')::timestamptz <> expected then
    raise exception 'pausa: attesa fino a % (mezzanotte di Roma), ottenuta %', expected, r ->> 'restingUntil';
  end if;

  if (select count(*) from public.my_session_round_stats()) <> 1
     or (select attempted from public.my_session_round_stats()) <> 2
     or (select solved from public.my_session_round_stats()) <> 2 then
    raise exception 'my_session_round_stats: dati inattesi';
  end if;
end $$;
reset role;

-- Utente B: con il fuso di Roma il tentativo di mezzanotte conta come oggi,
-- quindi con il secondo la quota (2) e' raggiunta.
select set_config('request.jwt.claims',
                  json_build_object('sub', user_b, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  r jsonb;
  sp record;
begin
  select p.id, l.rating into sp from public.session_puzzles p
    join public.lichess_puzzles l on l.puzzle_id = p.puzzle_id
   where p.session_id = (select session_b from ids) and p.order_index = 2;
  r := public.record_attempt_and_get_next_puzzle(
    (select session_b from ids), sp.id, 1::smallint, 'failed', 30, sp.rating, 'Europe/Rome');
  if r ->> 'status' <> 'quota_reached' then
    raise exception 'quota nel fuso di Roma: atteso quota_reached, ottenuto %', r;
  end if;

  -- Le statistiche vedono solo le sessioni di chi chiama.
  if (select count(distinct session_id) from public.my_session_round_stats()) <> 1 then
    raise exception 'my_session_round_stats: vede sessioni di altri utenti';
  end if;
  if (select solved from public.my_session_round_stats()) <> 1 then
    raise exception 'my_session_round_stats: risolti attesi 1';
  end if;
end $$;
reset role;

-- Un fuso orario non valido non blocca il tentativo (vale UTC).
select set_config('request.jwt.claims',
                  json_build_object('sub', user_b, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  r jsonb;
begin
  r := public.record_attempt_and_get_next_puzzle(
    (select session_b from ids),
    (select id from public.session_puzzles
      where session_id = (select session_b from ids) and order_index = 1),
    2::smallint, 'solved', 9, 1500, 'Non/Esiste');
  if r ->> 'status' is null then
    raise exception 'fuso non valido: risposta inattesa %', r;
  end if;
  raise notice 'rest-start-of-day: tutti i controlli superati';
end $$;
reset role;

rollback;
