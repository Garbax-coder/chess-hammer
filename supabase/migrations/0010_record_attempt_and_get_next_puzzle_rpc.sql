-- Anche dopo la RPC di 0009, "Puzzle successivo" restava lento: il client
-- faceva ANCORA la RPC di scrittura (record_puzzle_attempt) seguita da una
-- catena di 4-6 letture sequenziali per decidere il prossimo puzzle
-- (session_puzzles, puzzle_attempts, eventuale pick+insert, lichess_puzzles),
-- oltre a query duplicate perche' altri hook (session-progress, session-
-- detail, active-session) rileggono in parte gli stessi dati in parallelo.
--
-- Questa funzione accorpa scrittura del tentativo E decisione del prossimo
-- puzzle in un'unica RPC: dal client e' UNA sola chiamata di rete invece di
-- due catene separate. Rispecchia esattamente la logica di
-- src/lib/puzzle-engine.ts (recordAttempt + getNextPuzzle): stessa formula
-- ELO, stesso criterio di completamento giro/quota giornaliera, stessa
-- selezione del prossimo puzzle in pool o (giro 1) scelta di uno nuovo
-- tramite pick_next_round1_puzzle.
--
-- SECURITY INVOKER (default): le policy RLS di tutte le tabelle coinvolte
-- restano valide, un utente puo' toccare solo i propri dati.
create or replace function public.record_attempt_and_get_next_puzzle(
  p_session_id uuid,
  p_session_puzzle_id uuid,
  p_round smallint,
  p_result text,
  p_time_seconds numeric,
  p_puzzle_rating integer
)
returns jsonb
language plpgsql
as $$
declare
  v_user_id uuid := auth.uid();
  v_elo_before integer;
  v_solved integer;
  v_failed integer;
  v_expected numeric;
  v_elo_after integer;
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
begin
  -- 1) Registra il tentativo (stessa logica di record_puzzle_attempt/0009).
  select current_elo, puzzles_solved, puzzles_failed
    into v_elo_before, v_solved, v_failed
  from user_stats
  where user_id = v_user_id;

  v_expected := 1.0 / (1.0 + power(10, (p_puzzle_rating - v_elo_before) / 400.0));
  v_elo_after := round(
    v_elo_before + 20 * ((case when p_result = 'solved' then 1 else 0 end) - v_expected)
  );

  insert into puzzle_attempts (session_puzzle_id, round_number, result, time_seconds, elo_before, elo_after)
  values (p_session_puzzle_id, p_round, p_result, p_time_seconds, v_elo_before, v_elo_after);

  update user_stats
  set current_elo = v_elo_after,
      puzzles_solved = v_solved + (case when p_result = 'solved' then 1 else 0 end),
      puzzles_failed = v_failed + (case when p_result = 'failed' then 1 else 0 end),
      updated_at = now()
  where user_id = v_user_id;

  -- 2) Decide il prossimo puzzle (stessa logica di getNextPuzzle).
  select * into v_session from training_sessions where id = p_session_id;

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
    update training_sessions set current_round = v_round where id = p_session_id;
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
    and pa.attempted_at >= date_trunc('day', now());

  if v_attempted_today >= v_daily_target then
    return jsonb_build_object('status', 'quota_reached', 'round', v_round);
  end if;

  -- Prossimo puzzle del pool non ancora tentato in questo giro (stesso
  -- ordine di order_index per i giri 2/3, che ripercorrono il pool fisso).
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
    -- Difesa in profondita': non dovrebbe accadere dato il check sul
    -- completamento del giro sopra.
    return jsonb_build_object('status', 'session_complete');
  end if;

  -- Giro 1, nessun pending: sceglie un nuovo puzzle in base all'ELO
  -- appena aggiornato (stesse finestre di rating di pickAndInsertNewRound1Puzzle).
  v_new_puzzle := null;
  foreach v_window in array array[100, 250, 500, 1000, 3000]
  loop
    select lp.* into v_new_puzzle
    from pick_next_round1_puzzle(p_session_id, v_elo_after, v_window) lp
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

revoke all on function public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer) from public;
grant execute on function public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer) to authenticated;
