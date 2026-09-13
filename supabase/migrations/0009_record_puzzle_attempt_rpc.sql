-- Registrare un tentativo di puzzle richiedeva 4 round trip sequenziali dal
-- client (lettura ELO, insert tentativo, lettura contatori, update stats):
-- ognuno costa la latenza di rete verso Supabase, quindi "Puzzle successivo"
-- si sentiva lento. Questa funzione fa tutto in una singola chiamata RPC: le
-- istruzioni SQL al suo interno girano nella stessa connessione/transazione,
-- senza andata e ritorno di rete tra l'una e l'altra.
-- SECURITY INVOKER (default): le policy RLS di puzzle_attempts/user_stats
-- restano valide, quindi un utente puo' scrivere solo i propri dati.
create or replace function public.record_puzzle_attempt(
  p_session_puzzle_id uuid,
  p_round smallint,
  p_result text,
  p_time_seconds numeric,
  p_puzzle_rating integer
)
returns table (
  id uuid,
  elo_before integer,
  elo_after integer
)
language plpgsql
as $$
declare
  v_user_id uuid := auth.uid();
  v_elo_before integer;
  v_solved integer;
  v_failed integer;
  v_expected numeric;
  v_elo_after integer;
  v_attempt_id uuid;
begin
  select current_elo, puzzles_solved, puzzles_failed
    into v_elo_before, v_solved, v_failed
  from user_stats
  where user_id = v_user_id;

  -- Stessa formula ELO classica di src/lib/elo.ts (K=20).
  v_expected := 1.0 / (1.0 + power(10, (p_puzzle_rating - v_elo_before) / 400.0));
  v_elo_after := round(
    v_elo_before + 20 * ((case when p_result = 'solved' then 1 else 0 end) - v_expected)
  );

  insert into puzzle_attempts (session_puzzle_id, round_number, result, time_seconds, elo_before, elo_after)
  values (p_session_puzzle_id, p_round, p_result, p_time_seconds, v_elo_before, v_elo_after)
  returning puzzle_attempts.id into v_attempt_id;

  update user_stats
  set current_elo = v_elo_after,
      puzzles_solved = v_solved + (case when p_result = 'solved' then 1 else 0 end),
      puzzles_failed = v_failed + (case when p_result = 'failed' then 1 else 0 end),
      updated_at = now()
  where user_id = v_user_id;

  return query select v_attempt_id, v_elo_before, v_elo_after;
end;
$$;

revoke all on function public.record_puzzle_attempt(uuid, smallint, text, numeric, integer) from public;
grant execute on function public.record_puzzle_attempt(uuid, smallint, text, numeric, integer) to authenticated;
