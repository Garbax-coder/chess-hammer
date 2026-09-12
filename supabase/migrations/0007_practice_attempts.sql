-- Tentativi di "pratica libera": l'utente rigioca un puzzle gia' incontrato
-- nella sessione ufficiale (dopo aver esaurito la quota giornaliera del
-- giro) senza che il risultato influisca su session_puzzles/puzzle_attempts,
-- sull'ELO o sull'avanzamento del giro. Statistiche separate, puramente
-- informative.
create table if not exists practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_id text not null references lichess_puzzles (puzzle_id),
  result text not null check (result in ('solved', 'failed')),
  time_seconds numeric not null check (time_seconds >= 0),
  attempted_at timestamptz not null default now()
);

create index if not exists idx_practice_attempts_user_puzzle on practice_attempts (user_id, puzzle_id);

alter table practice_attempts enable row level security;

drop policy if exists "Users can read own practice attempts" on practice_attempts;
create policy "Users can read own practice attempts" on practice_attempts
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own practice attempts" on practice_attempts;
create policy "Users can insert own practice attempts" on practice_attempts
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own practice attempts" on practice_attempts;
create policy "Users can delete own practice attempts" on practice_attempts
  for delete
  to authenticated
  using (user_id = auth.uid());
