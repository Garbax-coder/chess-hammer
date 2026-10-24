-- I puzzle di una categoria (tema Lichess) che l'utente ha tentato: la lista
-- che si apre dalle classifiche delle statistiche (migliori e peggiori
-- categorie) per ripassarli in pratica libera.
--
-- p_source dice quali tentativi contano, come le due schede della pagina
-- /stats: 'training' i puzzle tentati nell'allenamento ufficiale, 'practice'
-- quelli tentati in pratica libera. Un puzzle compare una volta sola, con i
-- tentativi ufficiali della sessione in cui e' stato tentato per ultimo
-- (per la pratica: la sessione dell'ultimo tentativo libero, attribuita con
-- la stessa regola di my_training_stats, migrazione 0034). Ordine: dal primo
-- tentato all'ultimo.
--
-- Security invoker: la RLS limita gia' le righe a quelle di chi chiama. Usa
-- gli indici gia' esistenti e la chiave primaria dei puzzle Lichess: nessuna
-- tabella o indice nuovo.
create or replace function public.my_theme_puzzles(p_theme text, p_source text)
returns jsonb
language sql
stable
set search_path = public
as $$
  with training_rows as (
    select sp.puzzle_id,
           sp.id as session_puzzle_id,
           ts.id as session_id,
           max(a.attempted_at) as last_at,
           min(min(a.attempted_at)) over (partition by sp.puzzle_id) as first_at
      from training_sessions ts
      join session_puzzles sp on sp.session_id = ts.id
      join puzzle_attempts a on a.session_puzzle_id = sp.id
     where ts.user_id = auth.uid()
       and p_source = 'training'
     group by sp.puzzle_id, sp.id, ts.id
  ),
  practice_rows as (
    select p.puzzle_id,
           coalesce(
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
           p.attempted_at as last_at,
           min(p.attempted_at) over (partition by p.puzzle_id) as first_at
      from practice_attempts p
     where p.user_id = auth.uid()
       and p_source = 'practice'
  ),
  candidates as (
    select puzzle_id, session_puzzle_id, session_id, last_at, first_at
      from training_rows
    union all
    select pr.puzzle_id, sp.id, pr.session_id, pr.last_at, pr.first_at
      from practice_rows pr
      left join session_puzzles sp
        on sp.session_id = pr.session_id and sp.puzzle_id = pr.puzzle_id
  ),
  picked as (
    select distinct on (c.puzzle_id) c.*
      from candidates c
      join lichess_puzzles lp on lp.puzzle_id = c.puzzle_id
     where p_theme = any(lp.themes)
     order by c.puzzle_id, c.last_at desc
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'puzzle_id', pk.puzzle_id,
           'session_id', pk.session_id,
           'session_puzzle_id', pk.session_puzzle_id,
           'rating', lp.rating,
           'fen', lp.fen,
           'moves', lp.moves,
           'themes', lp.themes,
           'attempts', coalesce((
             select jsonb_agg(to_jsonb(a) order by a.round_number)
               from puzzle_attempts a
              where a.session_puzzle_id = pk.session_puzzle_id
           ), '[]'::jsonb)
         ) order by pk.first_at, pk.puzzle_id), '[]'::jsonb)
    from picked pk
    join lichess_puzzles lp on lp.puzzle_id = pk.puzzle_id
$$;

revoke all on function public.my_theme_puzzles(text, text) from public, anon;
grant execute on function public.my_theme_puzzles(text, text) to authenticated;
