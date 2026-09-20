-- La scelta del puzzle al giro 1 (pick_next_round1_puzzle) faceva
-- "order by random() limit 1" su tutti i puzzle della finestra di rating:
-- ~16.000 righe lette, filtrate e ordinate a ogni tentativo (~460 ms di
-- CPU misurati sul piano gratuito, dove la CPU e' condivisa).
--
-- Ora si sceglie a caso una POSIZIONE nella finestra e si legge solo quella
-- riga, con una ricerca per chiave. Serve sapere, per ogni puzzle, la sua
-- posizione nell'ordinamento per rating, e per ogni rating l'intervallo di
-- posizioni: due tabelle di supporto (~11 MB) che si ricostruiscono da
-- lichess_puzzles con rebuild_lichess_puzzle_order() (da rieseguire dopo
-- ogni nuovo import dei puzzle, vedi scripts/import-lichess-puzzles).
--
-- Stessa distribuzione di prima: ogni puzzle della finestra ha la stessa
-- probabilita', e se la riga scelta non va bene (tema non richiesto, puzzle
-- gia' nella sessione) se ne estrae un'altra (campionamento per
-- scarto, uniforme tra i puzzle ammessi). Solo se dopo 25 estrazioni non ne
-- esce uno valido (filtri molto selettivi: pochi puzzle ammessi nella
-- finestra) si ripiega sulla query esatta di prima, che in quel caso e'
-- comunque rapida perche' i candidati sono pochi (indice GIN sui temi).
-- Senza filtri o con molti temi ne basta una estrazione (~0,1 ms); ogni
-- tentativo a vuoto costa ~0,1 ms, quindi 25 sono comunque pochi ms.

create table if not exists lichess_puzzle_order (
  pos integer primary key,
  puzzle_id text not null
);

create table if not exists lichess_rating_ranges (
  rating integer primary key,
  first_pos integer not null,
  last_pos integer not null
);

-- Stesso schema di accesso di lichess_puzzles (dati di riferimento in sola
-- lettura), ma solo per gli utenti autenticati: la funzione di scelta gira
-- con i loro privilegi (security invoker, come prima).
alter table lichess_puzzle_order enable row level security;
alter table lichess_rating_ranges enable row level security;

drop policy if exists "Authenticated read access" on lichess_puzzle_order;
create policy "Authenticated read access" on lichess_puzzle_order
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated read access" on lichess_rating_ranges;
create policy "Authenticated read access" on lichess_rating_ranges
  for select
  to authenticated
  using (true);

-- Ricostruisce le due tabelle da lichess_puzzles: posizioni dense 1..N in
-- ordine (rating, puzzle_id) e, per ogni rating, prima e ultima posizione.
-- Solo per chi ha accesso diretto al DB (import, migration): non e' esposta
-- ai client.
create or replace function public.rebuild_lichess_puzzle_order()
returns void
language plpgsql
as $$
begin
  truncate lichess_puzzle_order;
  insert into lichess_puzzle_order (pos, puzzle_id)
  select row_number() over (order by rating, puzzle_id)::integer, puzzle_id
  from lichess_puzzles;

  truncate lichess_rating_ranges;
  insert into lichess_rating_ranges (rating, first_pos, last_pos)
  select rating,
         (sum(n) over (order by rating) - n + 1)::integer,
         sum(n) over (order by rating)::integer
  from (select rating, count(*) as n from lichess_puzzles group by rating) g;
end;
$$;

revoke all on function public.rebuild_lichess_puzzle_order() from public, anon, authenticated;

select public.rebuild_lichess_puzzle_order();

-- Stessa firma e stesso comportamento di 0015 (finestra di rating attorno
-- al target, temi opzionali, esclusione dei puzzle gia' nella sessione);
-- cambia solo come si sceglie a caso. Volatile e non stable: usa random().
create or replace function public.pick_next_round1_puzzle(
  p_session_id uuid,
  p_target_rating integer,
  p_window integer default 100,
  p_themes text[] default null
)
returns setof lichess_puzzles
language plpgsql
volatile
as $$
declare
  v_use_themes boolean := p_themes is not null and array_length(p_themes, 1) is not null;
  v_first integer;
  v_last integer;
  v_span integer;
  v_puzzle lichess_puzzles%rowtype;
  v_pos integer;
  v_try integer;
begin
  select min(first_pos), max(last_pos) into v_first, v_last
  from lichess_rating_ranges
  where rating between p_target_rating - p_window and p_target_rating + p_window;

  -- Nessun puzzle in questa finestra (il chiamante prova quella piu' larga).
  if v_first is null then
    return;
  end if;
  v_span := v_last - v_first + 1;

  for v_try in 1..25 loop
    -- In una variabile, non inline nel WHERE: random() e' volatile e li'
    -- verrebbe rivalutata riga per riga, impedendo l'uso dell'indice.
    v_pos := v_first + floor(random() * v_span)::integer;
    select lp.* into v_puzzle
    from lichess_puzzle_order o
    join lichess_puzzles lp on lp.puzzle_id = o.puzzle_id
    where o.pos = v_pos
      and (not v_use_themes or lp.themes && p_themes)
      and not exists (
        select 1 from session_puzzles sp
        where sp.session_id = p_session_id and sp.puzzle_id = lp.puzzle_id
      );
    if found then
      return next v_puzzle;
      return;
    end if;
  end loop;

  -- Filtri molto selettivi: query esatta (quella di 0015). SQL dinamico e
  -- due varianti (con e senza temi) invece di un unico "not v_use_themes
  -- or ..." con variabili: PL/pgSQL, dalla 6a chiamata nella stessa
  -- connessione, riusa un piano generico che non puo' semplificare quella
  -- condizione e smette di usare l'indice GIN sui temi (misurato: 26 ms
  -- invece di 0,2 ms). Col SQL dinamico il piano si calcola sui valori
  -- reali a ogni chiamata; il ripiego e' raro, quindi il costo e' trascurabile.
  if v_use_themes then
    return query execute
      'select lp.* from lichess_puzzles lp
       where lp.rating between $1 and $2
         and lp.themes && $3
         and not exists (
           select 1 from session_puzzles sp
           where sp.session_id = $4 and sp.puzzle_id = lp.puzzle_id
         )
       order by random() limit 1'
      using p_target_rating - p_window, p_target_rating + p_window, p_themes, p_session_id;
  else
    return query execute
      'select lp.* from lichess_puzzles lp
       where lp.rating between $1 and $2
         and not exists (
           select 1 from session_puzzles sp
           where sp.session_id = $3 and sp.puzzle_id = lp.puzzle_id
         )
       order by random() limit 1'
      using p_target_rating - p_window, p_target_rating + p_window, p_session_id;
  end if;
end;
$$;

revoke all on function public.pick_next_round1_puzzle(uuid, integer, integer, text[]) from public;
grant execute on function public.pick_next_round1_puzzle(uuid, integer, integer, text[]) to authenticated;
