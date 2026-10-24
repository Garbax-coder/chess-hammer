-- Statistiche dell'utente (pagina /stats), per l'allenamento ufficiale e per
-- la pratica libera: tutto aggregato qui, in una sola chiamata. Al browser
-- arrivano solo pochi totali (per sessione x giro x esito, per sessione x
-- esito della pratica, e per tema), non le migliaia di tentativi singoli: le
-- percentuali, le medie e le classifiche si ricavano da questi totali nel
-- browser.
--
-- Un tentativo di pratica libera registra la sessione da cui e' stato fatto
-- (migrazione 0033); quelli precedenti si attribuiscono alla sessione piu'
-- recente, gia' creata in quel momento, che contiene quel puzzle (la stessa
-- regola di "Continua in pratica libera").
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
  ),
  practice as (
    select coalesce(
             p.session_id,
             (select ts.id
                from training_sessions ts
                join session_puzzles sp on sp.session_id = ts.id
               where ts.user_id = auth.uid()
                 and sp.puzzle_id = p.puzzle_id
                 and ts.created_at <= p.attempted_at
               order by ts.created_at desc
               limit 1)
           ) as session_id,
           p.result,
           p.time_seconds,
           p.puzzle_id
      from practice_attempts p
     where p.user_id = auth.uid()
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
         and (exists (select 1 from attempts a where a.session_id = ts.id)
              or exists (select 1 from practice p where p.session_id = ts.id))
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
    ), '[]'::jsonb),
    'practice', jsonb_build_object(
      'sessions', coalesce((
        select jsonb_agg(jsonb_build_object(
                 'session_id', r.session_id,
                 'result', r.result,
                 'attempts', r.attempts,
                 'total_seconds', r.total_seconds
               ))
          from (
            select session_id, result,
                   count(*)::integer as attempts,
                   sum(time_seconds) as total_seconds
              from practice
             group by session_id, result
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
                   (count(*) filter (where p.result = 'solved'))::integer as solved,
                   sum(p.time_seconds) as total_seconds
              from practice p
              join lichess_puzzles lp on lp.puzzle_id = p.puzzle_id
              cross join lateral unnest(lp.themes) as theme
             group by theme
          ) t
      ), '[]'::jsonb)
    )
  )
$$;

revoke all on function public.my_training_stats() from public, anon;
grant execute on function public.my_training_stats() to authenticated;
