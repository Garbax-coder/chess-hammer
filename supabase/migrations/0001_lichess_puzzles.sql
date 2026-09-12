-- Reference data imported from the public Lichess puzzle database dump
-- (https://database.lichess.org/#puzzles). Read-only for clients; only
-- the import script (via a direct DB connection) writes to this table.
create table if not exists lichess_puzzles (
  puzzle_id text primary key,
  fen text not null,
  moves text[] not null,
  rating integer not null,
  rating_deviation integer not null,
  popularity integer not null,
  nb_plays integer not null,
  themes text[] not null default '{}',
  game_url text,
  opening_tags text[] not null default '{}'
);

create index if not exists idx_lichess_puzzles_rating on lichess_puzzles (rating);
create index if not exists idx_lichess_puzzles_themes on lichess_puzzles using gin (themes);

alter table lichess_puzzles enable row level security;

drop policy if exists "Public read access" on lichess_puzzles;
create policy "Public read access" on lichess_puzzles
  for select
  to anon, authenticated
  using (true);
