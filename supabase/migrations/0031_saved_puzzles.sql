-- Puzzle "problematici": una lista personale di puzzle che l'utente salva
-- per rigiocarli in pratica libera. Un puzzle compare una volta sola per
-- utente, qualunque sia la sessione in cui l'ha incontrato; si cancella con
-- l'account (on delete cascade da auth.users).
create table if not exists public.saved_puzzles (
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_id text not null references public.lichess_puzzles (puzzle_id),
  created_at timestamptz not null default now(),
  primary key (user_id, puzzle_id)
);

alter table public.saved_puzzles enable row level security;

drop policy if exists "Users can read own saved puzzles" on public.saved_puzzles;
create policy "Users can read own saved puzzles" on public.saved_puzzles
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can save puzzles" on public.saved_puzzles;
create policy "Users can save puzzles" on public.saved_puzzles
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can remove saved puzzles" on public.saved_puzzles;
create policy "Users can remove saved puzzles" on public.saved_puzzles
  for delete to authenticated
  using (user_id = auth.uid());

-- Filtro della pratica libera: oltre (o insieme) ai puzzle sbagliati, quelli
-- salvati. Con entrambi attivi la pratica comprende gli uni e gli altri.
alter table public.user_stats
  add column if not exists practice_only_saved boolean not null default false;
