-- Statistiche sulle aperture (branch feature/opening-training, solo
-- additiva): i tentativi dell'utente gia' aggregati, per non scaricarli
-- tutti (PostgREST ne restituisce al massimo 1000 per richiesta).
--
-- Restituisce:
-- - nodes: per mossa, tentativi, errori e tempo di risposta medio;
-- - days: gli ultimi 30 giorni con almeno un tentativo (giorno UTC);
-- - cycles: per repertorio, cicli completati e il piu' veloce.
-- Security invoker: la RLS limita tutto alle righe dell'utente.

create or replace function public.opening_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'nodes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'node_id', node_id,
        'attempts', attempts,
        'wrong', wrong,
        'avg_ms', avg_ms
      ))
      from (
        select node_id,
               count(*) as attempts,
               count(*) filter (where result = 'wrong') as wrong,
               round(avg(ms))::integer as avg_ms
          from opening_attempts
         where user_id = auth.uid()
         group by node_id
      ) n
    ), '[]'::jsonb),
    'days', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day', day,
        'attempts', attempts,
        'correct', correct
      ) order by day)
      from (
        select (created_at at time zone 'utc')::date as day,
               count(*) as attempts,
               count(*) filter (where result <> 'wrong') as correct
          from opening_attempts
         where user_id = auth.uid()
           and created_at >= now() - interval '30 days'
         group by 1
      ) d
    ), '[]'::jsonb),
    'cycles', coalesce((
      select jsonb_agg(jsonb_build_object(
        'repertoire_id', repertoire_id,
        'cycles', cycles,
        'best_ms', best_ms
      ))
      from (
        select repertoire_id, count(*) as cycles, min(total_ms) as best_ms
          from opening_cycles
         where user_id = auth.uid()
         group by repertoire_id
      ) c
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.opening_stats() from public, anon;
grant execute on function public.opening_stats() to authenticated;
