-- Per-user Woodpecker stats (ELO, tallies). One row per auth user, created
-- automatically on signup (email/password or OAuth) via trigger below.
create table if not exists user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_elo integer not null default 1500,
  puzzles_solved integer not null default 0,
  puzzles_failed integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table user_stats enable row level security;

drop policy if exists "Users can read own stats" on user_stats;
create policy "Users can read own stats" on user_stats
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own stats" on user_stats;
create policy "Users can update own stats" on user_stats
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create the stats row for every new auth user, regardless of signup
-- method (email/password, Google, future providers).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
