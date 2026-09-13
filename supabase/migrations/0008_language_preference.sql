-- Preferenza di lingua esplicita dell'utente (sincronizzata tra dispositivi).
-- NULL significa "non ancora scelta esplicitamente": in quel caso il client
-- usa la lingua del browser (italiano se il browser e' in italiano, inglese
-- altrimenti) senza scrivere nulla qui finche' l'utente non sceglie
-- attivamente una lingua dal selettore.
alter table user_stats
  add column if not exists language text check (language in ('it', 'en'));
