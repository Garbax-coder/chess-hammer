-- Permessi espliciti sulle tabelle di "public".
--
-- Dal 30 ottobre 2026 Supabase non da' piu' in automatico all'API dati
-- (PostgREST, supabase-js) l'accesso alle tabelle create in "public": ogni
-- tabella nuova va accompagnata dai suoi GRANT nella stessa migrazione (vedi
-- CLAUDE.md). Le tabelle esistenti tengono i permessi automatici di prima, ma
-- un database ricostruito da queste migrazioni (progetto nuovo, ramo di
-- anteprima, "supabase db reset") nascerebbe senza: questa migrazione li
-- scrive per tutte, cosi' le migrazioni bastano a riprodurre un database
-- funzionante.
--
-- Gli stessi permessi sono anche ridotti al necessario: prima i ruoli anon e
-- authenticated avevano tutti i privilegi su ogni tabella (compresi TRUNCATE,
-- TRIGGER, REFERENCES), e solo la RLS li fermava. Ora:
--   - authenticated (utente loggato): lettura e scrittura delle tabelle con i
--     propri dati, sola lettura dei puzzle Lichess; quali righe e quali
--     operazioni decide sempre la RLS;
--   - anon (nessun utente loggato): solo lettura dei puzzle Lichess, l'unica
--     tabella con una regola RLS aperta a chi non e' loggato;
--   - service_role (chiave di servizio, mai nel client): tutto;
--   - nessuno dei due ruoli dell'API sulle tabelle interne
--     (account_deletion_notices, app_email_templates), che usano solo le
--     funzioni "security definer" della conservazione degli account.

revoke all on table
  public.user_stats,
  public.training_sessions,
  public.session_puzzles,
  public.puzzle_attempts,
  public.practice_attempts,
  public.saved_puzzles,
  public.lichess_puzzles,
  public.lichess_puzzle_order,
  public.lichess_rating_ranges,
  public.account_deletion_notices,
  public.app_email_templates
from anon, authenticated;

-- Dati dell'utente.
grant select, insert, update, delete on table
  public.user_stats,
  public.training_sessions,
  public.session_puzzles,
  public.puzzle_attempts,
  public.practice_attempts,
  public.saved_puzzles
to authenticated;

-- Archivio dei puzzle, in sola lettura.
grant select on table
  public.lichess_puzzles,
  public.lichess_puzzle_order,
  public.lichess_rating_ranges
to authenticated;

grant select on table public.lichess_puzzles to anon;

grant all on table
  public.user_stats,
  public.training_sessions,
  public.session_puzzles,
  public.puzzle_attempts,
  public.practice_attempts,
  public.saved_puzzles,
  public.lichess_puzzles,
  public.lichess_puzzle_order,
  public.lichess_rating_ranges,
  public.account_deletion_notices,
  public.app_email_templates
to service_role;

-- Funzioni dell'allenamento: hanno senso solo per un utente loggato. Erano
-- eseguibili anche da anon (innocuo: la RLS blocca comunque ogni riga), ora
-- solo da authenticated. Le funzioni admin_* e le altre gia' limitate non
-- cambiano.
revoke execute on function
  public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer, text),
  public.record_puzzle_attempt(uuid, smallint, text, numeric, integer),
  public.pick_next_round1_puzzle(uuid, integer, integer, text[]),
  public.glicko_update(numeric, numeric, numeric, numeric, numeric),
  public.delete_own_account()
from anon, public;
