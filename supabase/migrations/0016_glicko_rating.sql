-- L'ELO del giro 1 usava un K-factor fisso (K=20): un utente con un vero
-- livello molto distante da 1500 impiegava moltissimi puzzle per arrivarci,
-- perche' ogni tentativo pesava sempre uguale. Si introduce una RD (rating
-- deviation, stile Glicko): parte alta (350, poca fiducia nel numero) e si
-- restringe con ogni tentativo, cosi' i primi risultati spostano il rating
-- molto di piu' dei successivi, fino a stabilizzarsi. Niente volatility di
-- Glicko-2 (richiederebbe un risolutore numerico iterativo in PL/pgSQL):
-- l'effetto "cambia molto all'inizio, poi si stabilizza" e' gia' dato dalla
-- sola RD. Ogni tentativo e' trattato come il proprio "periodo" Glicko (una
-- partita), quindi niente termine di crescita della RD nel tempo (non ci
-- sono periodi di inattivita' da modellare qui).
alter table user_stats
  add column if not exists rating_deviation numeric not null default 350;

-- Aggiornamento Glicko per un singolo risultato (rating + RD, senza
-- volatility). L'avversario (il puzzle) ha rating/RD fissi, mai aggiornati:
-- usa lichess_puzzles.rating/rating_deviation, gia' popolati con valori
-- Glicko reali dal dump Lichess. E' clampata per sicurezza contro gap di
-- rating estremi (altrimenti d^2 potrebbe dividere per ~0).
--
-- Matematica in double precision, non numeric: numeric e' a precisione
-- arbitraria e non arrotonda mai da sola, quindi le potenze/radici di
-- questa formula (irrazionali) fanno esplodere la scala (centinaia di
-- cifre decimali) attraverso i passaggi successivi. double precision ha
-- precisione fissa (~15 cifre), esattamente cosa serve per questo calcolo.
create or replace function public.glicko_update(
  p_rating numeric,
  p_rd numeric,
  p_opp_rating numeric,
  p_opp_rd numeric,
  p_score numeric
)
returns table(new_rating numeric, new_rd numeric)
language plpgsql
immutable
as $$
declare
  rating double precision := p_rating;
  rd double precision := p_rd;
  opp_rating double precision := p_opp_rating;
  opp_rd double precision := p_opp_rd;
  score double precision := p_score;
  q constant double precision := ln(10::double precision) / 400;
  g double precision;
  e double precision;
  d2 double precision;
  denom double precision;
begin
  g := 1 / sqrt(1 + 3 * q^2 * opp_rd^2 / pi()^2);
  e := 1 / (1 + power(10::double precision, -g * (rating - opp_rating) / 400));
  e := greatest(0.0001, least(0.9999, e));
  d2 := 1 / (q^2 * g^2 * e * (1 - e));
  denom := (1 / rd^2) + (1 / d2);

  new_rating := (rating + (q / denom) * g * (score - e))::numeric;
  new_rd := greatest(30, least(350, sqrt(1 / denom)))::numeric;
  return next;
end;
$$;

revoke all on function public.glicko_update(numeric, numeric, numeric, numeric, numeric) from public;
grant execute on function public.glicko_update(numeric, numeric, numeric, numeric, numeric) to authenticated;

-- Reset una tantum di tutti gli utenti esistenti allo stato "nuovo
-- giocatore" (rating 1500, RD 350): si e' scartata l'idea di rigiocare la
-- cronologia storica del giro 1 perche' negli account attuali include
-- anche tentativi di test/debug (puzzle scelti a mano durante lo sviluppo
-- di altre feature), che il nuovo algoritmo — molto piu' sensibile ai
-- primi risultati di quanto lo fosse il K fisso — avrebbe interpretato
-- come segnale reale, producendo un rating fuorviante.
update user_stats
set current_elo = 1500,
    rating_deviation = 350;

-- Stessa firma e stesso comportamento di 0015, con l'unica modifica nel
-- blocco giro 1: invece del K fisso, usa glicko_update() leggendo la RD
-- dell'utente e quella del puzzle (via session_puzzles -> lichess_puzzles;
-- nessun nuovo parametro lato client, p_puzzle_rating resta invariato).
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
begin
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

revoke all on function public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer) from public;
grant execute on function public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer) to authenticated;
