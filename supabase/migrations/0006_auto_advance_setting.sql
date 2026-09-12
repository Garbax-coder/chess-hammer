-- Preferenza utente: passare automaticamente al puzzle successivo a fine
-- puzzle (risolto o fallito). Sul profilo utente (non su localStorage) cosi'
-- resta consistente tra dispositivi/browser diversi.
alter table user_stats add column if not exists auto_advance boolean not null default true;
