-- Il metodo Woodpecker originale consiglia qualche giorno di pausa tra un
-- giro e l'altro: la memoria si consolida a riposo, cosi' il giro
-- successivo diventa un vero richiamo (recall) invece di una semplice
-- ripetizione a breve termine. rest_days e' configurabile alla creazione
-- della sessione (0 = nessuna pausa, comportamento precedente); quando un
-- giro finisce e rest_days > 0, resting_until viene impostato a
-- now() + rest_days e la sessione resta "in pausa" finche' non scade.
alter table training_sessions
  add column if not exists rest_days integer not null default 0 check (rest_days >= 0);
alter table training_sessions
  add column if not exists resting_until timestamptz;

-- Stessa firma e stesso comportamento di 0012, con l'aggiunta della pausa
-- tra i giri: dopo l'avanzamento di giro, se resting_until e' nel futuro
-- si ritorna status 'resting' invece di procedere a quota/prossimo puzzle.
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
  v_resting_until timestamptz;
begin
  -- 1) Registra il tentativo. L'ELO cambia solo al giro 1.
  select current_elo, puzzles_solved, puzzles_failed
    into v_elo_before, v_solved, v_failed
  from user_stats
  where user_id = v_user_id;

  if p_round = 1 then
    v_expected := 1.0 / (1.0 + power(10, (p_puzzle_rating - v_elo_before) / 400.0));
    v_elo_after := round(
      v_elo_before + 20 * ((case when p_result = 'solved' then 1 else 0 end) - v_expected)
    );
  else
    v_elo_after := v_elo_before;
  end if;

  insert into puzzle_attempts (session_puzzle_id, round_number, result, time_seconds, elo_before, elo_after)
  values (p_session_puzzle_id, p_round, p_result, p_time_seconds, v_elo_before, v_elo_after);

  update user_stats
  set current_elo = v_elo_after,
      puzzles_solved = v_solved + (case when p_result = 'solved' then 1 else 0 end),
      puzzles_failed = v_failed + (case when p_result = 'failed' then 1 else 0 end),
      updated_at = now()
  where user_id = v_user_id;

  -- 2) Decide il prossimo puzzle (invariato rispetto a 0012, con l'aggiunta
  -- della pausa tra i giri).
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
    if v_session.rest_days > 0 then
      v_resting_until := now() + (v_session.rest_days || ' days')::interval;
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
    and pa.attempted_at >= date_trunc('day', now());

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
