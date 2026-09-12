-- Consente agli utenti di eliminare i propri session_puzzles/puzzle_attempts
-- (usato dal pannello di debug in sviluppo per resettare quota/sessione
-- durante i test, ma scoperto genericamente: sono comunque dati propri
-- dell'utente, stesso pattern di ownership delle policy SELECT/INSERT).
drop policy if exists "Users can delete own session puzzles" on session_puzzles;
create policy "Users can delete own session puzzles" on session_puzzles
  for delete
  to authenticated
  using (
    exists (
      select 1 from training_sessions ts
      where ts.id = session_puzzles.session_id and ts.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own attempts" on puzzle_attempts;
create policy "Users can delete own attempts" on puzzle_attempts
  for delete
  to authenticated
  using (
    exists (
      select 1 from session_puzzles sp
      join training_sessions ts on ts.id = sp.session_id
      where sp.id = puzzle_attempts.session_puzzle_id and ts.user_id = auth.uid()
    )
  );
