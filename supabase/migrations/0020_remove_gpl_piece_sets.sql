-- cburnett e merida sono sotto licenza GPLv2+ (vedi
-- src/lib/piece-sets/LICENSES.md): tolti dall'app per restare liberi sulla
-- licenza dei set di pezzi. Chi li aveva scelti passa al nuovo default
-- (chessnut, Apache-2.0); l'app stessa degraderebbe comunque in modo
-- sicuro (pieceSetById ricade sul primo set disponibile), ma i dati
-- restano coerenti con le opzioni davvero selezionabili.
update user_stats set piece_set = 'chessnut' where piece_set in ('cburnett', 'merida');

alter table user_stats drop constraint if exists user_stats_piece_set_check;
alter table user_stats
  alter column piece_set set default 'chessnut',
  add constraint user_stats_piece_set_check check (piece_set in ('chessnut', 'fantasy', 'spatial'));
