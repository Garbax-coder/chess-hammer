-- La pausa tra i giri finisce all'inizio di un giorno (mezzanotte nel fuso
-- orario di chi gioca) invece che a ore esatte dalla fine del giro: con 2
-- giorni di riposo, chi chiude il giro il 18 alle 22 riprende il 20 da
-- mezzanotte, come annuncia l'app ("il giro 2 inizia il 20"), e non il 20
-- alle 22. Per lo stesso motivo la quota giornaliera conta da mezzanotte nel
-- fuso di chi gioca, come gia' faceva l'app, e non da mezzanotte UTC.
--
-- record_attempt_and_get_next_puzzle riceve il fuso orario (p_tz, con
-- default UTC: la versione dell'app ancora online fino al rilascio continua a
-- funzionare). Si ricrea invece di aggiungere una variante, perche' due
-- versioni con gli stessi parametri nominati sarebbero ambigue per PostgREST.

drop function if exists public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer);

create or replace function public.record_attempt_and_get_next_puzzle(
  p_session_id uuid,
  p_session_puzzle_id uuid,
  p_round smallint,
  p_result text,
  p_time_seconds numeric,
  p_puzzle_rating integer,
  p_tz text default 'UTC'
)
returns jsonb
language plpgsql
as $$
declare
  v_user_id uuid := auth.uid();
  v_elo_before integer;
  v_rd_before numeric;
  v_solved integer;
  v_failed integer;
  v_elo_after integer;
  v_rd_after numeric;
  v_puzzle_rd integer;
  v_glicko record;
  v_session training_sessions%rowtype;
  v_round smallint := p_round;
  v_pool_size integer;
  v_attempted_count integer;
  v_round_complete boolean;
  v_daily_target integer;
  v_attempted_today integer;
  v_pending_id uuid;
  v_pending_puzzle_id text;
  v_new_puzzle lichess_puzzles%rowtype;
  v_new_session_puzzle_id uuid;
  v_window integer;
  v_resting_until timestamptz;
  v_tz text := p_tz;
  v_today_start timestamptz;
begin
  -- Fuso orario di chi gioca (dal browser): "oggi" e l'inizio della pausa
  -- tra i giri si contano dalla sua mezzanotte. Un nome non valido vale UTC.
  begin
    v_today_start := date_trunc('day', now() at time zone v_tz) at time zone v_tz;
  exception when others then
    v_tz := 'UTC';
    v_today_start := date_trunc('day', now() at time zone v_tz) at time zone v_tz;
  end;

  -- 1) Registra il tentativo. L'ELO cambia solo al giro 1.
  select current_elo, rating_deviation, puzzles_solved, puzzles_failed
    into v_elo_before, v_rd_before, v_solved, v_failed
  from user_stats
  where user_id = v_user_id;

  if p_round = 1 then
    select lp.rating_deviation into v_puzzle_rd
    from session_puzzles sp
    join lichess_puzzles lp on lp.puzzle_id = sp.puzzle_id
    where sp.id = p_session_puzzle_id;

    select * into v_glicko
    from glicko_update(
      v_elo_before, v_rd_before, p_puzzle_rating, v_puzzle_rd,
      case when p_result = 'solved' then 1.0 else 0.0 end
    );
    v_elo_after := round(v_glicko.new_rating);
    v_rd_after := v_glicko.new_rd;
  else
    v_elo_after := v_elo_before;
    v_rd_after := v_rd_before;
  end if;

  insert into puzzle_attempts (session_puzzle_id, round_number, result, time_seconds, elo_before, elo_after)
  values (p_session_puzzle_id, p_round, p_result, p_time_seconds, v_elo_before, v_elo_after);

  update user_stats
  set current_elo = v_elo_after,
      rating_deviation = v_rd_after,
      puzzles_solved = v_solved + (case when p_result = 'solved' then 1 else 0 end),
      puzzles_failed = v_failed + (case when p_result = 'failed' then 1 else 0 end),
      updated_at = now()
  where user_id = v_user_id;

  -- 2) Decide il prossimo puzzle (invariato rispetto a 0015).
  select * into v_session from training_sessions where id = p_session_id;
  v_resting_until := v_session.resting_until;

  select count(*) into v_pool_size
  from session_puzzles
  where session_id = p_session_id;

  select count(*) into v_attempted_count
  from puzzle_attempts pa
  join session_puzzles sp on sp.id = pa.session_puzzle_id
  where sp.session_id = p_session_id and pa.round_number = v_round;

  v_round_complete := case
    when v_round = 1 then v_attempted_count >= v_session.total_puzzles
    else v_attempted_count >= v_pool_size
  end;

  if v_round_complete then
    if v_round = 3 then
      update training_sessions
      set status = 'completed', completed_at = now()
      where id = p_session_id;
      return jsonb_build_object('status', 'session_complete');
    end if;
    v_round := v_round + 1;
    -- La pausa finisce all'inizio del giorno: con 2 giorni di riposo, chi
    -- chiude il giro il 18 riprende il 20 da mezzanotte, a qualunque ora
    -- abbia finito.
    if v_session.rest_days > 0 then
      v_resting_until := (v_today_start at time zone v_tz
                          + (v_session.rest_days || ' days')::interval) at time zone v_tz;
    else
      v_resting_until := null;
    end if;
    update training_sessions
    set current_round = v_round, resting_until = v_resting_until
    where id = p_session_id;
  end if;

  if v_resting_until is not null and now() < v_resting_until then
    return jsonb_build_object(
      'status', 'resting',
      'round', v_round,
      'restingUntil', v_resting_until
    );
  end if;

  v_daily_target := case
    when v_round = 1 then v_session.daily_target_round1
    when v_round = 2 then v_session.daily_target_round2
    else v_session.daily_target_round3
  end;

  select count(*) into v_attempted_today
  from puzzle_attempts pa
  join session_puzzles sp on sp.id = pa.session_puzzle_id
  where sp.session_id = p_session_id
    and pa.round_number = v_round
    and pa.attempted_at >= v_today_start;

  if v_attempted_today >= v_daily_target then
    return jsonb_build_object('status', 'quota_reached', 'round', v_round);
  end if;

  select sp.id, sp.puzzle_id into v_pending_id, v_pending_puzzle_id
  from session_puzzles sp
  where sp.session_id = p_session_id
    and not exists (
      select 1 from puzzle_attempts pa
      where pa.session_puzzle_id = sp.id and pa.round_number = v_round
    )
  order by sp.order_index asc
  limit 1;

  if v_pending_id is not null then
    select lp.* into v_new_puzzle from lichess_puzzles lp where lp.puzzle_id = v_pending_puzzle_id;
    return jsonb_build_object(
      'status', 'next',
      'data', jsonb_build_object(
        'round', v_round,
        'sessionPuzzleId', v_pending_id,
        'puzzle', to_jsonb(v_new_puzzle)
      )
    );
  end if;

  if v_round <> 1 then
    return jsonb_build_object('status', 'session_complete');
  end if;

  -- Giro 1, nessun pending: sceglie un nuovo puzzle in base all'ELO
  -- appena aggiornato, ristretto ai temi selezionati dall'utente alla
  -- creazione della sessione (v_session.puzzle_themes: null/vuoto = tutti).
  v_new_puzzle := null;
  foreach v_window in array array[100, 250, 500, 1000, 3000]
  loop
    select lp.* into v_new_puzzle
    from pick_next_round1_puzzle(p_session_id, v_elo_after, v_window, v_session.puzzle_themes) lp
    limit 1;
    exit when v_new_puzzle.puzzle_id is not null;
  end loop;

  if v_new_puzzle.puzzle_id is null then
    raise exception 'Nessun puzzle disponibile per questo rating: pool esaurito.';
  end if;

  insert into session_puzzles (session_id, puzzle_id, order_index)
  values (p_session_id, v_new_puzzle.puzzle_id, v_pool_size + 1)
  returning id into v_new_session_puzzle_id;

  return jsonb_build_object(
    'status', 'next',
    'data', jsonb_build_object(
      'round', v_round,
      'sessionPuzzleId', v_new_session_puzzle_id,
      'puzzle', to_jsonb(v_new_puzzle)
    )
  );
end;
$$;

revoke all on function public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer, text) from public;
grant execute on function public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer, text) to authenticated;

-- Le pause gia' in corso, calcolate a ore esatte, finiscono all'inizio dello
-- stesso giorno (ora italiana: il fuso degli utenti di oggi).
update public.training_sessions
   set resting_until = date_trunc('day', resting_until at time zone 'Europe/Rome') at time zone 'Europe/Rome'
 where status = 'in_progress'
   and resting_until > now();

-- Statistiche per sessione e giro dell'utente corrente (riepiloghi di fine
-- giro e di fine sessione, confronto con le sessioni precedenti). Security
-- invoker: la RLS limita gia' le righe alle sessioni di chi chiama.
create or replace function public.my_session_round_stats()
returns table (
  session_id uuid,
  session_name text,
  status text,
  total_puzzles integer,
  created_at timestamptz,
  completed_at timestamptz,
  pool_size integer,
  round smallint,
  attempted integer,
  solved integer,
  total_seconds numeric,
  first_attempt_at timestamptz,
  last_attempt_at timestamptz,
  elo_start integer,
  elo_end integer
)
language sql
stable
set search_path = public
as $$
  select ts.id,
         ts.name,
         ts.status,
         ts.total_puzzles,
         ts.created_at,
         ts.completed_at,
         (select count(*)::integer from session_puzzles p where p.session_id = ts.id),
         a.round_number,
         count(*)::integer,
         (count(*) filter (where a.result = 'solved'))::integer,
         sum(a.time_seconds),
         min(a.attempted_at),
         max(a.attempted_at),
         (array_agg(a.elo_before order by a.attempted_at asc))[1],
         (array_agg(a.elo_after order by a.attempted_at desc))[1]
    from training_sessions ts
    join session_puzzles sp on sp.session_id = ts.id
    join puzzle_attempts a on a.session_puzzle_id = sp.id
   where ts.user_id = auth.uid()
   group by ts.id, a.round_number
   order by ts.created_at, a.round_number
$$;

revoke all on function public.my_session_round_stats() from public, anon;
grant execute on function public.my_session_round_stats() to authenticated;
