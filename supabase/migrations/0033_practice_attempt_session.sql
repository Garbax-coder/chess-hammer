-- I tentativi di pratica libera ricordano in quale sessione sono stati fatti:
-- "Continua in pratica libera" (allenamento e riepilogo di una sessione
-- conclusa) riprende dall'ultimo puzzle praticato in QUESTA sessione. Prima
-- si deduceva dai tentativi fatti dopo la creazione della sessione, che si
-- confonde quando lo stesso puzzle compare in piu' sessioni. I tentativi gia'
-- registrati restano senza sessione e per loro vale la deduzione di prima.
--
-- Nessuna tabella nuova: i permessi della tabella (migrazione 0032) coprono
-- anche la colonna nuova.

alter table public.practice_attempts
  add column if not exists session_id uuid
    references public.training_sessions (id) on delete set null;

create index if not exists idx_practice_attempts_session
  on public.practice_attempts (session_id, attempted_at)
  where session_id is not null;

-- Un tentativo si puo' legare solo a una propria sessione.
drop policy if exists "Users can insert own practice attempts" on public.practice_attempts;
create policy "Users can insert own practice attempts" on public.practice_attempts
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      session_id is null
      or exists (
        select 1 from public.training_sessions ts
         where ts.id = session_id and ts.user_id = auth.uid()
      )
    )
  );
