-- Prova della migrazione 0035 (prossimo puzzle in una sola chiamata). Da
-- eseguire SOLO sul progetto di sviluppo: tutto avviene in una transazione
-- annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/next-puzzle.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'next-test-%@example.com';

-- Utente A: sessione da 2 puzzle, quota 2 al giorno, 1 giorno di pausa, con
-- un solo puzzle gia' nel pool. Utente B: nessuna sessione.
create temp table ids as
select gen_random_uuid() as user_a, gen_random_uuid() as user_b,
       gen_random_uuid() as session_a;
grant select on ids to authenticated;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, u, 'authenticated', 'authenticated',
       e, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  from ids, lateral (values (user_a, 'next-test-a@example.com'),
                            (user_b, 'next-test-b@example.com')) v(u, e);

insert into public.training_sessions (id, user_id, total_puzzles, daily_target_round1,
                                      daily_target_round2, daily_target_round3, rest_days)
select session_a, user_a, 2, 2, 2, 2, 1 from ids;

insert into public.session_puzzles (session_id, puzzle_id, order_index)
select session_a, (select puzzle_id from public.lichess_puzzles order by puzzle_id limit 1), 1
  from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  r jsonb;
  first_sp uuid := (select id from public.session_puzzles
                     where session_id = (select session_a from ids) and order_index = 1);
  second_sp uuid;
begin
  -- 1) Il puzzle gia' nel pool e non ancora tentato, completo per la scacchiera.
  r := public.get_next_puzzle((select session_a from ids), null, 'Europe/Rome');
  if r ->> 'status' <> 'next' or (r -> 'data' ->> 'sessionPuzzleId')::uuid <> first_sp
     or (r -> 'data' ->> 'round')::int <> 1 or r -> 'data' -> 'puzzle' ->> 'fen' is null then
    raise exception 'pool con un puzzle da fare: atteso quel puzzle, ottenuto %', r;
  end if;

  -- 2) Tentato quello, ne pesca uno nuovo in fondo al pool.
  insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                      elo_before, elo_after)
  values (first_sp, 1, 'solved', 10, 1500, 1500);
  r := public.get_next_puzzle((select session_a from ids), null, 'Europe/Rome');
  second_sp := (r -> 'data' ->> 'sessionPuzzleId')::uuid;
  if r ->> 'status' <> 'next' or second_sp = first_sp
     or (select order_index from public.session_puzzles where id = second_sp) <> 2 then
    raise exception 'pool esaurito al giro 1: atteso un puzzle nuovo in posizione 2, ottenuto %', r;
  end if;

  -- 3) Giro 1 completo: passa al giro 2, in pausa fino alla mezzanotte di
  --    domani (ora di Roma).
  insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                      elo_before, elo_after)
  values (second_sp, 1, 'failed', 20, 1500, 1490);
  r := public.get_next_puzzle((select session_a from ids), null, 'Europe/Rome');
  if r ->> 'status' <> 'resting' or (r ->> 'round')::int <> 2
     or (r ->> 'restingUntil')::timestamptz <>
        (date_trunc('day', now() at time zone 'Europe/Rome') + interval '1 day')
          at time zone 'Europe/Rome' then
    raise exception 'fine giro 1: atteso resting fino a domani, ottenuto %', r;
  end if;
  if (select current_round from public.training_sessions
       where id = (select session_a from ids)) <> 2 then
    raise exception 'fine giro 1: la sessione non e'' passata al giro 2';
  end if;

  -- 4) Finita la pausa: il giro 2 riparte dal primo puzzle del pool.
  update public.training_sessions set resting_until = now() - interval '1 minute'
   where id = (select session_a from ids);
  r := public.get_next_puzzle((select session_a from ids), null, 'Europe/Rome');
  if r ->> 'status' <> 'next' or (r -> 'data' ->> 'round')::int <> 2
     or (r -> 'data' ->> 'sessionPuzzleId')::uuid <> first_sp then
    raise exception 'giro 2: atteso il primo puzzle del pool, ottenuto %', r;
  end if;

  -- 5) Quota del giorno raggiunta (2 tentativi oggi nel giro 2).
  insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                      elo_before, elo_after)
  values (first_sp, 2, 'solved', 8, 1490, 1490);
  update public.training_sessions set daily_target_round2 = 1
   where id = (select session_a from ids);
  r := public.get_next_puzzle((select session_a from ids), null, 'Europe/Rome');
  if r ->> 'status' <> 'quota_reached' or (r ->> 'round')::int <> 2 then
    raise exception 'quota del giro 2: atteso quota_reached, ottenuto %', r;
  end if;

  -- 6) Giro 3 completo: la sessione si conclude.
  insert into public.puzzle_attempts (session_puzzle_id, round_number, result, time_seconds,
                                      elo_before, elo_after)
  values (first_sp, 3, 'solved', 5, 1490, 1490),
         (second_sp, 3, 'solved', 6, 1490, 1490);
  r := public.get_next_puzzle((select session_a from ids), 3::smallint, 'Europe/Rome');
  if r ->> 'status' <> 'session_complete'
     or (select status from public.training_sessions
          where id = (select session_a from ids)) <> 'completed' then
    raise exception 'fine giro 3: attesa la sessione conclusa, ottenuto %', r;
  end if;
end $$;
reset role;

-- La sessione di un altro utente non si vede: nessun puzzle, nessuna modifica.
select set_config('request.jwt.claims',
                  json_build_object('sub', user_b, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
begin
  begin
    perform public.get_next_puzzle((select session_a from ids), null, 'UTC');
    raise exception 'sessione di un altro utente: attesa un''eccezione';
  exception when raise_exception then
    if sqlerrm <> 'Sessione non trovata.' then
      raise;
    end if;
  end;
end $$;
reset role;

-- Solo per utenti loggati.
do $$
begin
  if has_function_privilege('anon', 'public.get_next_puzzle(uuid, smallint, text)', 'execute')
     or has_function_privilege('anon',
          'public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer, text)',
          'execute') then
    raise exception 'anon puo'' chiedere il prossimo puzzle';
  end if;
  if not has_function_privilege('authenticated',
       'public.get_next_puzzle(uuid, smallint, text)', 'execute') then
    raise exception 'authenticated non puo'' chiedere il prossimo puzzle';
  end if;
  raise notice 'next-puzzle: tutti i controlli superati';
end $$;

rollback;
