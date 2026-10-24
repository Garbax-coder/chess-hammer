-- Prova delle statistiche dell'utente (migrazione 0034). Da eseguire SOLO sul
-- progetto di sviluppo: tutto avviene in una transazione annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/training-stats.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'stats-test-%@example.com';

create temp table ids as
select gen_random_uuid() as user_a, gen_random_uuid() as user_b,
       gen_random_uuid() as session_a, gen_random_uuid() as session_b;
grant select on ids to authenticated;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, u, 'authenticated', 'authenticated',
       e, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  from ids, lateral (values (user_a, 'stats-test-a@example.com'),
                            (user_b, 'stats-test-b@example.com')) v(u, e);

insert into public.training_sessions (id, user_id, total_puzzles, daily_target_round1,
                                      daily_target_round2, daily_target_round3)
select session_a, user_a, 3, 10, 10, 10 from ids
union all
select session_b, user_b, 3, 10, 10, 10 from ids;

-- Tre puzzle per sessione (gli stessi per i due utenti).
insert into public.session_puzzles (session_id, puzzle_id, order_index)
select s, p.puzzle_id, p.n
  from ids, lateral (values (session_a), (session_b)) v(s),
       (select puzzle_id, row_number() over (order by puzzle_id) as n
          from public.lichess_puzzles order by puzzle_id limit 3) p;

-- Utente A: giro 1 con 2 risolti (10 s e 20 s) e 1 sbagliato (60 s), giro 2
-- con 1 risolto (5 s). Utente B: 3 sbagliati, che A non deve vedere.
insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                    elo_before, elo_after)
select sp.id, 1, case when sp.order_index = 3 then 'failed' else 'solved' end,
       case sp.order_index when 1 then 10 when 2 then 20 else 60 end, 1500, 1500
  from public.session_puzzles sp, ids where sp.session_id = ids.session_a
union all
select sp.id, 2, 'solved', 5, 1500, 1500
  from public.session_puzzles sp, ids where sp.session_id = ids.session_a and sp.order_index = 1
union all
select sp.id, 1, 'failed', 30, 1500, 1500
  from public.session_puzzles sp, ids where sp.session_id = ids.session_b;

select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  s jsonb := public.my_training_stats();
  total int;
  solved int;
  seconds numeric;
  theme_attempts int;
  first_puzzle_themes int;
begin
  if jsonb_array_length(s -> 'sessions') <> 1
     or s -> 'sessions' -> 0 ->> 'id' <> (select session_a::text from ids) then
    raise exception 'sessioni: attesa solo la sessione di A, ottenuto %', s -> 'sessions';
  end if;

  select sum((r ->> 'attempts')::int),
         sum((r ->> 'attempts')::int) filter (where r ->> 'result' = 'solved'),
         sum((r ->> 'total_seconds')::numeric)
    into total, solved, seconds
    from jsonb_array_elements(s -> 'rounds') r;
  if total <> 4 or solved <> 3 or seconds <> 95 then
    raise exception 'totali: attesi 4 tentativi, 3 risolti, 95 s; ottenuti %, %, %', total, solved, seconds;
  end if;
  if (select count(*) from jsonb_array_elements(s -> 'rounds') r
       where (r ->> 'round')::int = 1 and r ->> 'result' = 'failed'
         and (r ->> 'attempts')::int = 1 and (r ->> 'total_seconds')::numeric = 60) <> 1 then
    raise exception 'giro 1 sbagliati: atteso 1 tentativo da 60 s';
  end if;

  -- Ogni tentativo conta una volta per ciascun tema del suo puzzle.
  select sum((t ->> 'attempts')::int) into theme_attempts
    from jsonb_array_elements(s -> 'themes') t;
  select sum(cardinality(lp.themes) * (case sp.order_index when 1 then 2 else 1 end))
    into first_puzzle_themes
    from public.session_puzzles sp
    join public.lichess_puzzles lp on lp.puzzle_id = sp.puzzle_id
   where sp.session_id = (select session_a from ids);
  if theme_attempts <> first_puzzle_themes then
    raise exception 'temi: attesi % conteggi, ottenuti %', first_puzzle_themes, theme_attempts;
  end if;

  raise notice 'training-stats: tutti i controlli superati';
end $$;
reset role;

-- Gli anonimi non possono chiamarla.
set local role anon;
do $$
begin
  begin
    perform public.my_training_stats();
    raise exception 'un anonimo ha potuto leggere le statistiche';
  exception when insufficient_privilege then
    null;
  end;
end $$;
reset role;

rollback;
