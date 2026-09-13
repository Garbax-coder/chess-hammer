-- Consente agli utenti di eliminare le proprie training_sessions (usato dal
-- pannello di debug in sviluppo per liberare lo slot di "sessione attiva"
-- e poter testare la creazione di una nuova sessione, senza aspettare il
-- completamento dei 3 giri). Stesso pattern di ownership delle altre
-- policy su questa tabella e delle policy di delete gia' concesse su
-- session_puzzles/puzzle_attempts in 0005 (cascade automatico su entrambe
-- alla cancellazione della sessione, grazie a "on delete cascade").
drop policy if exists "Users can delete own sessions" on training_sessions;
create policy "Users can delete own sessions" on training_sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);
