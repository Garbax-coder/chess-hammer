-- Filtro "solo puzzle falliti" della pratica libera, salvato come le altre
-- preferenze dell'utente (auto_advance, board_theme, ...): decide anche da
-- quale puzzle riprende "Continua in pratica libera", quindi deve restare
-- lo stesso tra una visita e l'altra e tra un dispositivo e l'altro.
alter table user_stats
  add column practice_only_failed boolean not null default false,
  add column practice_failed_scope text not null default 'all'
    check (practice_failed_scope in ('all', 'lastRound'));
