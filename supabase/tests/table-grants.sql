-- Prova dei permessi espliciti sulle tabelle (migrazione 0032). Da eseguire
-- SOLO sul progetto di sviluppo: legge i permessi, non modifica nulla.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/table-grants.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
declare
  t text;
  user_tables text[] := array['user_stats', 'training_sessions', 'session_puzzles',
                              'puzzle_attempts', 'practice_attempts', 'saved_puzzles',
                              'opening_node_progress', 'opening_attempts', 'opening_cycles',
                              'opening_repertoires', 'opening_nodes', 'opening_node_notes',
                              'opening_hidden_repertoires'];
  puzzle_tables text[] := array['lichess_puzzles', 'lichess_puzzle_order', 'lichess_rating_ranges',
                                'opening_names'];
  internal_tables text[] := array['account_deletion_notices', 'app_email_templates'];
  priv text;
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;

  -- Ogni tabella di "public" e' coperta da questa prova: una tabella nuova
  -- senza i suoi GRANT (vedi CLAUDE.md) la fa fallire.
  for t in select tablename from pg_tables where schemaname = 'public' loop
    if not (t = any(user_tables || puzzle_tables || internal_tables)) then
      raise exception 'tabella % senza permessi previsti: aggiungi i GRANT nella sua migrazione e qui', t;
    end if;
  end loop;

  foreach t in array user_tables loop
    foreach priv in array array['select', 'insert', 'update', 'delete'] loop
      if not has_table_privilege('authenticated', 'public.' || t, priv) then
        raise exception 'authenticated senza % su %', priv, t;
      end if;
    end loop;
    if has_table_privilege('authenticated', 'public.' || t, 'truncate') then
      raise exception 'authenticated ha ancora truncate su %', t;
    end if;
    if has_table_privilege('anon', 'public.' || t, 'select') then
      raise exception 'anon puo'' leggere %', t;
    end if;
  end loop;

  foreach t in array puzzle_tables loop
    if not has_table_privilege('authenticated', 'public.' || t, 'select') then
      raise exception 'authenticated non puo'' leggere %', t;
    end if;
    if has_table_privilege('authenticated', 'public.' || t, 'insert')
       or has_table_privilege('authenticated', 'public.' || t, 'delete') then
      raise exception 'authenticated puo'' scrivere %', t;
    end if;
  end loop;
  if not has_table_privilege('anon', 'public.lichess_puzzles', 'select') then
    raise exception 'anon non puo'' leggere lichess_puzzles';
  end if;
  if has_table_privilege('anon', 'public.lichess_puzzle_order', 'select') then
    raise exception 'anon puo'' leggere lichess_puzzle_order';
  end if;
  if has_table_privilege('anon', 'public.opening_repertoires', 'select')
     or has_table_privilege('anon', 'public.opening_nodes', 'select')
     or has_table_privilege('anon', 'public.opening_names', 'select')
     or has_table_privilege('anon', 'public.opening_node_names', 'select') then
    raise exception 'anon puo'' leggere il catalogo delle aperture';
  end if;

  foreach t in array internal_tables loop
    if has_table_privilege('authenticated', 'public.' || t, 'select')
       or has_table_privilege('anon', 'public.' || t, 'select') then
      raise exception 'la tabella interna % e'' leggibile dall''API', t;
    end if;
  end loop;

  foreach t in array user_tables || puzzle_tables || internal_tables loop
    if not has_table_privilege('service_role', 'public.' || t, 'select, insert, update, delete') then
      raise exception 'service_role senza permessi completi su %', t;
    end if;
  end loop;

  -- Funzioni dell'allenamento: solo per chi e' loggato.
  if has_function_privilege('anon',
       'public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer, text)',
       'execute') then
    raise exception 'anon puo'' registrare tentativi';
  end if;
  if not has_function_privilege('authenticated',
       'public.record_attempt_and_get_next_puzzle(uuid, uuid, smallint, text, numeric, integer, text)',
       'execute')
     or not has_function_privilege('authenticated',
       'public.pick_next_round1_puzzle(uuid, integer, integer, text[])', 'execute')
     or not has_function_privilege('authenticated', 'public.delete_own_account()', 'execute') then
    raise exception 'authenticated ha perso una funzione dell''allenamento';
  end if;

  raise notice 'table-grants: tutti i controlli superati';
end $$;

rollback;
