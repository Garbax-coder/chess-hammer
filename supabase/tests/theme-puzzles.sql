-- Prova della migrazione 0036 (puzzle di una categoria per la pratica
-- libera). Da eseguire SOLO sul progetto di sviluppo: tutto avviene in una
-- transazione annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/theme-puzzles.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'theme-test-%@example.com';

-- Due puzzle "fork" (f1, f2) e uno senza (x).
create temp table ids as
select gen_random_uuid() as user_a, gen_random_uuid() as user_b,
       gen_random_uuid() as old_session, gen_random_uuid() as new_session,
       (select puzzle_id from public.lichess_puzzles
         where 'fork' = any(themes) order by puzzle_id limit 1) as f1,
       (select puzzle_id from public.lichess_puzzles
         where 'fork' = any(themes) order by puzzle_id offset 1 limit 1) as f2,
       (select puzzle_id from public.lichess_puzzles
         where not ('fork' = any(themes)) order by puzzle_id limit 1) as x;
grant select on ids to authenticated;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, u, 'authenticated', 'authenticated',
       e, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  from ids, lateral (values (user_a, 'theme-test-a@example.com'),
                            (user_b, 'theme-test-b@example.com')) v(u, e);

-- Una sola sessione in corso per utente: la vecchia e' conclusa.
insert into public.training_sessions (id, user_id, total_puzzles, daily_target_round1,
                                      daily_target_round2, daily_target_round3, created_at,
                                      status, completed_at)
select old_session, user_a, 2, 2, 2, 2, now() - interval '10 days',
       'completed', now() - interval '6 days' from ids
union all
select new_session, user_a, 2, 2, 2, 2, now() - interval '5 days',
       'in_progress', null from ids;

-- f1 in entrambe le sessioni, x nella vecchia, f2 nella nuova.
insert into public.session_puzzles (session_id, puzzle_id, order_index)
select old_session, f1, 1 from ids union all
select old_session, x, 2 from ids union all
select new_session, f1, 1 from ids union all
select new_session, f2, 2 from ids;

-- Allenamento: f1 tentato nella vecchia sessione (9 giorni fa) e nella nuova
-- (4 giorni fa, ultimo); f2 tentato 3 giorni fa; x tentato.
insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                    elo_before, elo_after, attempted_at)
select sp.id, 1, r, 10, 1500, 1500, now() - d
  from ids,
       lateral (values (old_session, f1, 'solved', interval '9 days'),
                       (old_session, x, 'failed', interval '9 days'),
                       (new_session, f1, 'failed', interval '4 days'),
                       (new_session, f2, 'solved', interval '3 days')) v(s, p, r, d)
  join public.session_puzzles sp on sp.session_id = v.s and sp.puzzle_id = v.p;

-- Pratica libera: solo f2, un tentativo senza sessione registrata.
insert into public.practice_attempts (user_id, puzzle_id, result, time_seconds, attempted_at)
select user_a, f2, 'failed', 30, now() - interval '1 day' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  r jsonb;
begin
  -- Allenamento: f1 e f2 (non x), una volta sola, dal primo tentato.
  r := public.my_theme_puzzles('fork', 'training');
  if jsonb_array_length(r) <> 2
     or r -> 0 ->> 'puzzle_id' <> (select f1 from ids)
     or r -> 1 ->> 'puzzle_id' <> (select f2 from ids) then
    raise exception 'allenamento: attesi f1 e f2 in quest''ordine, ottenuto %', r;
  end if;
  -- f1 con i tentativi della sessione in cui e' stato tentato per ultimo.
  if (r -> 0 ->> 'session_id')::uuid <> (select new_session from ids)
     or jsonb_array_length(r -> 0 -> 'attempts') <> 1
     or r -> 0 -> 'attempts' -> 0 ->> 'result' <> 'failed'
     or r -> 0 ->> 'fen' is null then
    raise exception 'allenamento: f1 atteso dalla sessione nuova, ottenuto %', r -> 0;
  end if;

  -- Pratica libera: solo f2, attribuito alla sessione che lo contiene.
  r := public.my_theme_puzzles('fork', 'practice');
  if jsonb_array_length(r) <> 1
     or r -> 0 ->> 'puzzle_id' <> (select f2 from ids)
     or (r -> 0 ->> 'session_id')::uuid <> (select new_session from ids)
     or r -> 0 ->> 'session_puzzle_id' is null then
    raise exception 'pratica: atteso solo f2 dalla sessione nuova, ottenuto %', r;
  end if;

  -- Fonte sconosciuta: nessun puzzle.
  if jsonb_array_length(public.my_theme_puzzles('fork', 'other')) <> 0 then
    raise exception 'fonte sconosciuta: attesa una lista vuota';
  end if;
end $$;
reset role;

-- Un altro utente non vede i puzzle di A.
select set_config('request.jwt.claims',
                  json_build_object('sub', user_b, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
begin
  if jsonb_array_length(public.my_theme_puzzles('fork', 'training')) <> 0
     or jsonb_array_length(public.my_theme_puzzles('fork', 'practice')) <> 0 then
    raise exception 'un altro utente vede i puzzle di A';
  end if;
end $$;
reset role;

do $$
begin
  if has_function_privilege('anon', 'public.my_theme_puzzles(text, text)', 'execute') then
    raise exception 'anon puo'' leggere i puzzle per categoria';
  end if;
  if not has_function_privilege('authenticated',
       'public.my_theme_puzzles(text, text)', 'execute') then
    raise exception 'authenticated non puo'' leggere i puzzle per categoria';
  end if;
  raise notice 'theme-puzzles: tutti i controlli superati';
end $$;

rollback;
