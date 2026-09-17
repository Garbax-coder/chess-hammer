-- Nome opzionale scelto dall'utente alla creazione della sessione (es.
-- "Ripasso forchette"), per distinguerla a colpo d'occhio in dashboard e
-- nello storico invece di doversi affidare solo alla data di creazione.
-- Null = nessun nome, l'interfaccia mostra un titolo generico.
alter table training_sessions
  add column if not exists name text;
