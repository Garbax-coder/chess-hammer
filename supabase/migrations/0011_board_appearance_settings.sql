-- Preferenze di aspetto scacchiera (stile scacchiera e set di pezzi),
-- sincronizzate tra dispositivi come auto_advance/language. I valori di
-- default (classic / cburnett) coincidono con l'aspetto attuale della
-- scacchiera (colori #F0D9B5/#B58863 e set di pezzi di default di
-- react-chessboard), quindi nessun cambiamento visivo per chi non ha ancora
-- scelto esplicitamente.
alter table user_stats
  add column if not exists board_theme text not null default 'classic'
    check (board_theme in ('classic', 'ocean', 'forest', 'slate', 'coral'));
alter table user_stats
  add column if not exists piece_set text not null default 'cburnett'
    check (piece_set in ('cburnett', 'merida', 'chessnut', 'fantasy', 'spatial'));
