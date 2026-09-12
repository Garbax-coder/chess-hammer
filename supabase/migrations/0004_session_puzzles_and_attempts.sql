-- Il set fisso e ordinato di puzzle di una sessione. Popolato in modo
-- incrementale durante il giro 1 (un puzzle scelto per volta in base
-- all'ELO corrente), poi riletto invariato per il giro 2 e 3.
create table if not exists session_puzzles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions (id) on delete cascade,
  puzzle_id text not null references lichess_puzzles (puzzle_id),
  order_index integer not null,
  created_at timestamptz not null default now(),
  unique (session_id, order_index),
  unique (session_id, puzzle_id)
);

create index if not exists idx_session_puzzles_session on session_puzzles (session_id, order_index);

alter table session_puzzles enable row level security;

drop policy if exists "Users can read own session puzzles" on session_puzzles;
create policy "Users can read own session puzzles" on session_puzzles
  for select
  to authenticated
  using (
    exists (
      select 1 from training_sessions ts
      where ts.id = session_puzzles.session_id and ts.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own session puzzles" on session_puzzles;
create policy "Users can insert own session puzzles" on session_puzzles
  for insert
  to authenticated
  with check (
    exists (
      select 1 from training_sessions ts
      where ts.id = session_puzzles.session_id and ts.user_id = auth.uid()
    )
  );

-- Ogni tentativo di risoluzione di un puzzle, in un giro specifico.
create table if not exists puzzle_attempts (
  id uuid primary key default gen_random_uuid(),
  session_puzzle_id uuid not null references session_puzzles (id) on delete cascade,
  round_number smallint not null check (round_number in (1, 2, 3)),
  result text not null check (result in ('solved', 'failed')),
  time_seconds numeric not null check (time_seconds >= 0),
  elo_before integer not null,
  elo_after integer not null,
  attempted_at timestamptz not null default now(),
  unique (session_puzzle_id, round_number)
);

create index if not exists idx_puzzle_attempts_session_puzzle on puzzle_attempts (session_puzzle_id);

alter table puzzle_attempts enable row level security;

drop policy if exists "Users can read own attempts" on puzzle_attempts;
create policy "Users can read own attempts" on puzzle_attempts
  for select
  to authenticated
  using (
    exists (
      select 1 from session_puzzles sp
      join training_sessions ts on ts.id = sp.session_id
      where sp.id = puzzle_attempts.session_puzzle_id and ts.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own attempts" on puzzle_attempts;
create policy "Users can insert own attempts" on puzzle_attempts
  for insert
  to authenticated
  with check (
    exists (
      select 1 from session_puzzles sp
      join training_sessions ts on ts.id = sp.session_id
      where sp.id = puzzle_attempts.session_puzzle_id and ts.user_id = auth.uid()
    )
  );

-- Sceglie un puzzle candidato per il giro 1: rating vicino a p_target_rating
-- (finestra +/- p_window), escludendo i puzzle gia' nel pool della sessione.
-- SECURITY INVOKER (default): la RLS di session_puzzles resta valida, quindi
-- un utente puo' interrogare solo le proprie sessioni.
create or replace function public.pick_next_round1_puzzle(
  p_session_id uuid,
  p_target_rating integer,
  p_window integer default 100
)
returns setof lichess_puzzles
language sql
stable
as $$
  select lp.*
  from lichess_puzzles lp
  where lp.rating between p_target_rating - p_window and p_target_rating + p_window
    and not exists (
      select 1 from session_puzzles sp
      where sp.session_id = p_session_id and sp.puzzle_id = lp.puzzle_id
    )
  order by random()
  limit 1
$$;

revoke all on function public.pick_next_round1_puzzle(uuid, integer, integer) from public;
grant execute on function public.pick_next_round1_puzzle(uuid, integer, integer) to authenticated;
