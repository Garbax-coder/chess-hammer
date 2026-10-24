-- Statistiche dell'utente (pagina /stats): tutto aggregato qui, in una sola
-- chiamata. Al browser arrivano solo pochi totali (per sessione x giro x
-- esito, e per tema), non le migliaia di tentativi singoli: le percentuali,
-- le medie e le classifiche si ricavano da questi totali nel browser.
--
-- Security invoker: la RLS limita gia' le righe alle sessioni di chi chiama.
-- Usa gli indici gia' esistenti (sessioni per utente, puzzle per sessione,
-- tentativi per puzzle) e la chiave primaria dei puzzle Lichess: nessuna
-- tabella o indice nuovo.
create or replace function public.my_training_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  with attempts as (
    select ts.id as session_id,
           a.round_number,
           a.result,
           a.time_seconds,
           sp.puzzle_id
      from training_sessions ts
      join session_puzzles sp on sp.session_id = ts.id
      join puzzle_attempts a on a.session_puzzle_id = sp.id
     where ts.user_id = auth.uid()
  )
  select jsonb_build_object(
    'sessions', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', ts.id,
               'name', ts.name,
               'status', ts.status,
               'total_puzzles', ts.total_puzzles,
               'created_at', ts.created_at,
               'completed_at', ts.completed_at
             ) order by ts.created_at)
        from training_sessions ts
       where ts.user_id = auth.uid()
         and exists (select 1 from attempts a where a.session_id = ts.id)
    ), '[]'::jsonb),
    'rounds', coalesce((
      select jsonb_agg(jsonb_build_object(
               'session_id', r.session_id,
               'round', r.round_number,
               'result', r.result,
               'attempts', r.attempts,
               'total_seconds', r.total_seconds
             ))
        from (
          select session_id, round_number, result,
                 count(*)::integer as attempts,
                 sum(time_seconds) as total_seconds
            from attempts
           group by session_id, round_number, result
        ) r
    ), '[]'::jsonb),
    'themes', coalesce((
      select jsonb_agg(jsonb_build_object(
               'theme', t.theme,
               'attempts', t.attempts,
               'solved', t.solved,
               'total_seconds', t.total_seconds
             ))
        from (
          select theme,
                 count(*)::integer as attempts,
                 (count(*) filter (where a.result = 'solved'))::integer as solved,
                 sum(a.time_seconds) as total_seconds
            from attempts a
            join lichess_puzzles lp on lp.puzzle_id = a.puzzle_id
            cross join lateral unnest(lp.themes) as theme
           group by theme
        ) t
    ), '[]'::jsonb)
  )
$$;

revoke all on function public.my_training_stats() from public, anon;
grant execute on function public.my_training_stats() to authenticated;
