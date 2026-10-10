-- Due indici creati in 0004 duplicano quelli dei vincoli di unicita' sulle
-- stesse colonne iniziali, che Postgres usa allo stesso modo per le ricerche:
-- - idx_session_puzzles_session (session_id, order_index) = vincolo
--   session_puzzles_session_id_order_index_key;
-- - idx_puzzle_attempts_session_puzzle (session_puzzle_id) e' coperto dal
--   vincolo puzzle_attempts_session_puzzle_id_round_number_key.
-- Sono le due tabelle che crescono con gli utenti: toglierli riduce di circa
-- il 15% lo spazio per riga, dentro i 500 MB del piano gratuito.
drop index if exists idx_session_puzzles_session;
drop index if exists idx_puzzle_attempts_session_puzzle;
