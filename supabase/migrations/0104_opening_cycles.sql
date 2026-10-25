-- Cicli Woodpecker sulle aperture (branch feature/opening-training, solo
-- additiva): tutte le linee di un repertorio giocate di fila, a tempo, e
-- ripetute per farle ogni volta piu' in fretta. Si salva solo il ciclo
-- completato, con tempo e precisione, per confrontarlo con i precedenti; le
-- singole mosse finiscono come sempre in opening_attempts.
create table if not exists public.opening_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  repertoire_id uuid not null references public.opening_repertoires (id) on delete cascade,
  cycle smallint not null check (cycle >= 1),
  lines integer not null check (lines >= 0),
  moves integer not null check (moves >= 0),
  correct integer not null check (correct >= 0 and correct <= moves),
  -- Tempo di risposta dell'utente sommato su tutte le sue mosse.
  total_ms integer not null check (total_ms >= 0),
  started_at timestamptz not null,
  completed_at timestamptz not null default now(),
  unique (user_id, repertoire_id, cycle)
);

create index if not exists idx_opening_cycles_repertoire
  on public.opening_cycles (repertoire_id);

alter table public.opening_cycles enable row level security;

drop policy if exists "Users manage own opening cycles" on public.opening_cycles;
create policy "Users manage own opening cycles" on public.opening_cycles
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.opening_repertoires r
       where r.id = repertoire_id
         and (r.owner_id is null or r.owner_id = auth.uid())
    )
  );

revoke all on table public.opening_cycles from anon, authenticated;
grant select, insert, update, delete on table public.opening_cycles to authenticated;
grant all on table public.opening_cycles to service_role;
