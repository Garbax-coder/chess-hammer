-- Stile grafico dell'app (colori dell'interfaccia e logo), salvato come le
-- altre preferenze di aspetto (board_theme, piece_set) cosi' resta lo stesso
-- su ogni dispositivo. 'sage' (Salvia) e' lo stile predefinito.
alter table user_stats
  add column app_style text not null default 'sage'
    check (app_style in ('sage', 'slatewood', 'ochre'));
