-- Francese, spagnolo e tedesco si aggiungono a italiano e inglese tra le
-- lingue che l'utente puo' scegliere dal profilo.
alter table user_stats drop constraint user_stats_language_check;
alter table user_stats
  add constraint user_stats_language_check
    check (language in ('it', 'en', 'fr', 'es', 'de'));
