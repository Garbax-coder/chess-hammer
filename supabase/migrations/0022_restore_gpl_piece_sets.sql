-- cburnett e merida (GPLv2+) erano stati tolti dalla 0020 perche' a quel
-- punto l'app non era ancora interamente GPL. Ora che lo e' (vedi LICENSE),
-- sono di nuovo compatibili: si riallarga il vincolo per permettere di
-- selezionarli. Il default resta 'chessnut' (nessun dato da migrare: nessun
-- account e' rimasto su cburnett/merida dopo la 0020).
alter table user_stats drop constraint if exists user_stats_piece_set_check;
alter table user_stats
  add constraint user_stats_piece_set_check
    check (piece_set in ('cburnett', 'merida', 'chessnut', 'fantasy', 'spatial'));
