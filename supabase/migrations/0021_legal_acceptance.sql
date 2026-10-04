-- Checkbox di accettazione Termini/Privacy al signup (stessa dichiarazione
-- copre anche la conferma di avere almeno 14 anni, vedi il testo del
-- checkbox in SignupPage.tsx): data e versione del testo legale accettato,
-- cosi' se i testi cambiano si distingue chi ha accettato quale versione.
--
-- Scritto dal trigger handle_new_user leggendo i metadata passati a
-- supabase.auth.signUp (options.data.legal_version, vedi src/lib/auth.ts):
-- e' l'unico modo per salvarlo in modo atomico anche quando la conferma
-- email e' richiesta, prima che esista una sessione autenticata con cui
-- un semplice UPDATE lato client supererebbe le policy RLS.
alter table user_stats
  add column if not exists legal_accepted_at timestamptz,
  add column if not exists legal_version text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_stats (user_id, legal_accepted_at, legal_version)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'legal_version' is not null then now() end,
    new.raw_user_meta_data ->> 'legal_version'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
