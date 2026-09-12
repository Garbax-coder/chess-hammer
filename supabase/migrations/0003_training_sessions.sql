-- Una sessione di allenamento Woodpecker: un pool fisso di puzzle da
-- risolvere per 3 giri, con target giornaliero configurabile per giro.
create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  total_puzzles integer not null check (total_puzzles > 0),
  daily_target_round1 integer not null check (daily_target_round1 > 0),
  daily_target_round2 integer not null check (daily_target_round2 > 0),
  daily_target_round3 integer not null check (daily_target_round3 > 0),
  current_round smallint not null default 1 check (current_round in (1, 2, 3)),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_training_sessions_user on training_sessions (user_id);

-- Al massimo una sessione 'in_progress' per utente: vincolo applicato anche
-- a livello DB, non solo lato UI.
create unique index if not exists idx_training_sessions_one_active_per_user
  on training_sessions (user_id)
  where status = 'in_progress';

alter table training_sessions enable row level security;

drop policy if exists "Users can read own sessions" on training_sessions;
create policy "Users can read own sessions" on training_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own sessions" on training_sessions;
create policy "Users can create own sessions" on training_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own sessions" on training_sessions;
create policy "Users can update own sessions" on training_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
