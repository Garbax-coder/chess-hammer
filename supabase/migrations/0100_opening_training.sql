-- Allenamento sulle aperture (analisi in docs/opening-training.md): un
-- repertorio e' un albero di mosse giocato da un colore; un Run e' un
-- cammino radice -> foglia, identificato dalla sua foglia.
--
-- Migrazione del branch feature/opening-training: numerata da 0100 per non
-- scontrarsi con quelle della manutenzione, e solo additiva (tabelle e
-- funzioni nuove, nessuna modifica a quelle esistenti).
--
-- - opening_repertoires, opening_nodes: catalogo, in sola lettura per
--   l'utente (owner_id null = repertorio di catalogo; i repertori personali
--   verranno dopo).
-- - opening_node_progress: stato per utente e mossa (ripasso dilazionato).
-- - opening_attempts: log di ogni mossa giocata, come practice_attempts.

create extension if not exists ltree with schema extensions;

create table if not exists public.opening_repertoires (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  eco text,
  color char(1) not null check (color in ('w', 'b')),
  source text,
  owner_id uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.opening_nodes (
  id bigint generated always as identity primary key,
  repertoire_id uuid not null references public.opening_repertoires (id) on delete cascade,
  parent_id bigint references public.opening_nodes (id) on delete cascade,
  -- Mosse UCI dalla radice, es. e2e4.e7e5.g1f3: i sottoalberi si
  -- interrogano per prefisso (path <@ 'e2e4.e7e5').
  path extensions.ltree not null,
  ply smallint not null check (ply >= 1),
  uci text not null,
  san text not null,
  -- Posizione dopo la mossa (senza contatori): riconosce le trasposizioni.
  epd text not null,
  -- Dalla parte dell'utente: la mossa principale (le alternative accettate
  -- verranno dopo).
  is_main boolean not null default true,
  -- Frequenza della mossa (Opening Explorer), quando nota.
  weight real,
  comment text,
  unique (repertoire_id, path)
);

create index if not exists idx_opening_nodes_path
  on public.opening_nodes using gist (path);
create index if not exists idx_opening_nodes_parent
  on public.opening_nodes (parent_id);
create index if not exists idx_opening_nodes_epd
  on public.opening_nodes (repertoire_id, epd);

create table if not exists public.opening_node_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  node_id bigint not null references public.opening_nodes (id) on delete cascade,
  attempts integer not null default 0,
  first_try_correct integer not null default 0,
  streak smallint not null default 0,
  last_seen_at timestamptz,
  due_at timestamptz,
  -- Per un futuro scheduling FSRS.
  stability real,
  primary key (user_id, node_id)
);

create table if not exists public.opening_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  run_leaf_id bigint not null references public.opening_nodes (id) on delete cascade,
  node_id bigint not null references public.opening_nodes (id) on delete cascade,
  played_uci text not null,
  result text not null check (result in ('correct', 'alternative', 'wrong')),
  ms integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_opening_attempts_user
  on public.opening_attempts (user_id, created_at);
create index if not exists idx_opening_attempts_node
  on public.opening_attempts (node_id);
create index if not exists idx_opening_attempts_leaf
  on public.opening_attempts (run_leaf_id);
create index if not exists idx_opening_node_progress_node
  on public.opening_node_progress (node_id);

-- Regole di accesso.
alter table public.opening_repertoires enable row level security;
alter table public.opening_nodes enable row level security;
alter table public.opening_node_progress enable row level security;
alter table public.opening_attempts enable row level security;

drop policy if exists "Catalog and own repertoires are readable" on public.opening_repertoires;
create policy "Catalog and own repertoires are readable" on public.opening_repertoires
  for select to authenticated
  using (owner_id is null or owner_id = auth.uid());

drop policy if exists "Nodes of readable repertoires are readable" on public.opening_nodes;
create policy "Nodes of readable repertoires are readable" on public.opening_nodes
  for select to authenticated
  using (exists (
    select 1 from public.opening_repertoires r
     where r.id = repertoire_id
       and (r.owner_id is null or r.owner_id = auth.uid())
  ));

drop policy if exists "Users manage own opening progress" on public.opening_node_progress;
create policy "Users manage own opening progress" on public.opening_node_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own opening attempts" on public.opening_attempts;
create policy "Users manage own opening attempts" on public.opening_attempts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Permessi espliciti (vedi 0032): il catalogo in sola lettura, i dati
-- dell'utente con le operazioni che la RLS limita alle sue righe.
revoke all on table
  public.opening_repertoires,
  public.opening_nodes,
  public.opening_node_progress,
  public.opening_attempts
from anon, authenticated;

grant select on table public.opening_repertoires, public.opening_nodes to authenticated;

grant select, insert, update, delete on table
  public.opening_node_progress,
  public.opening_attempts
to authenticated;

grant all on table
  public.opening_repertoires,
  public.opening_nodes,
  public.opening_node_progress,
  public.opening_attempts
to service_role;

-- Prossimo ripasso di una mossa, con intervalli fissi come Chessable:
-- sbagliata (streak 0) subito, poi 4 ore, 1, 3, 7, 21 e 60 giorni.
create or replace function public.opening_due_at(p_streak integer, p_from timestamptz)
returns timestamptz
language sql
immutable
set search_path = public
as $$
  select p_from + case
    when p_streak <= 0 then interval '0'
    when p_streak = 1 then interval '4 hours'
    when p_streak = 2 then interval '1 day'
    when p_streak = 3 then interval '3 days'
    when p_streak = 4 then interval '7 days'
    when p_streak = 5 then interval '21 days'
    else interval '60 days'
  end
$$;

-- Registra la prima risposta dell'utente a una sua mossa del repertorio e
-- aggiorna il ripasso, in una sola chiamata. Security invoker: la RLS
-- limita le righe a quelle di chi chiama, e la mossa deve appartenere a un
-- repertorio che puo' leggere.
create or replace function public.record_opening_move(
  p_node_id bigint,
  p_run_leaf_id bigint,
  p_played_uci text,
  p_result text,
  p_ms integer default null
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_ok boolean := p_result in ('correct', 'alternative');
  v_progress opening_node_progress%rowtype;
begin
  if v_user_id is null then
    raise exception 'Utente non autenticato.';
  end if;
  if p_result not in ('correct', 'alternative', 'wrong') then
    raise exception 'Esito non valido: %', p_result;
  end if;
  if not exists (select 1 from opening_nodes where id = p_node_id)
     or not exists (select 1 from opening_nodes where id = p_run_leaf_id) then
    raise exception 'Mossa del repertorio non trovata.';
  end if;

  insert into opening_attempts (user_id, run_leaf_id, node_id, played_uci, result, ms)
  values (v_user_id, p_run_leaf_id, p_node_id, p_played_uci, p_result, p_ms);

  insert into opening_node_progress as p
    (user_id, node_id, attempts, first_try_correct, streak, last_seen_at, due_at)
  values (
    v_user_id, p_node_id, 1, case when v_ok then 1 else 0 end,
    case when v_ok then 1 else 0 end, now(),
    opening_due_at(case when v_ok then 1 else 0 end, now())
  )
  on conflict (user_id, node_id) do update set
    attempts = p.attempts + 1,
    first_try_correct = p.first_try_correct + case when v_ok then 1 else 0 end,
    streak = case when v_ok then least(p.streak + 1, 100) else 0 end,
    last_seen_at = now(),
    due_at = opening_due_at(case when v_ok then p.streak + 1 else 0 end, now())
  returning * into v_progress;

  return to_jsonb(v_progress);
end;
$$;

revoke all on function public.opening_due_at(integer, timestamptz) from public, anon;
grant execute on function public.opening_due_at(integer, timestamptz) to authenticated;
revoke all on function public.record_opening_move(bigint, bigint, text, text, integer)
  from public, anon;
grant execute on function public.record_opening_move(bigint, bigint, text, text, integer)
  to authenticated;
