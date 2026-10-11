-- Conservazione degli account (informativa privacy, "Dove sono conservati i
-- dati e per quanto tempo"), eseguita ogni notte da pg_cron:
--   1. gli account mai confermati si eliminano 7 giorni dopo la registrazione;
--   2. chi non usa l'account da 23 mesi riceve un'email (Resend, nella sua
--      lingua) che annuncia l'eliminazione 30 giorni dopo;
--   3. passati quei 30 giorni senza accessi, l'account si elimina con tutti i
--      suoi dati (on delete cascade da auth.users). Se la persona torna,
--      l'avviso si annulla.
-- L'email parte solo se in Vault c'e' il segreto 'resend_api_key': senza, non
-- si avvisa nessuno e quindi non si elimina nessun account inattivo (solo
-- quelli mai confermati, che non hanno mai potuto accedere).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Avvisi inviati: uno per account, finche' l'account non viene eliminato o
-- torna attivo. Nessuna policy: lo leggono e scrivono solo le funzioni qui sotto.
create table if not exists public.account_deletion_notices (
  user_id uuid primary key references auth.users (id) on delete cascade,
  warned_at timestamptz not null default now(),
  delete_after timestamptz not null
);
alter table public.account_deletion_notices enable row level security;

-- Testi dell'email di avviso, uno per lingua (vedi la migrazione 0028,
-- generata da scripts/build-email-templates.mjs). {{DELETE_DATE}} e
-- {{LOGIN_URL}} si sostituiscono all'invio.
create table if not exists public.app_email_templates (
  name text not null,
  lang text not null,
  subject text not null,
  html text not null,
  primary key (name, lang)
);
alter table public.app_email_templates enable row level security;

-- Ultimo uso dell'account: accesso, rinnovo automatico della sessione (chi
-- resta collegato non rifa' il login) o puzzle giocato.
create or replace function public.account_last_activity(uid uuid)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    u.created_at,
    u.last_sign_in_at,
    (select max(coalesce(s.refreshed_at, s.updated_at, s.created_at))
       from auth.sessions s where s.user_id = uid),
    (select max(a.attempted_at)
       from public.puzzle_attempts a
       join public.session_puzzles sp on sp.id = a.session_puzzle_id
       join public.training_sessions ts on ts.id = sp.session_id
      where ts.user_id = uid),
    (select max(p.attempted_at) from public.practice_attempts p where p.user_id = uid)
  )
  from auth.users u
  where u.id = uid
$$;

create or replace function public.run_account_retention()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  unconfirmed_deleted int := 0;
  inactive_deleted int := 0;
  notices_cleared int := 0;
  warned int := 0;
  rec record;
  t_lang text;
  t_subject text;
  t_html text;
  delete_on timestamptz;
  date_text text;
begin
  -- Mai confermati da piu' di 7 giorni (chi entra con Google e' gia' confermato).
  with gone as (
    delete from auth.users u
     where u.email_confirmed_at is null
       and u.created_at < now() - interval '7 days'
       and not coalesce(u.is_anonymous, false)
       and not coalesce(u.is_sso_user, false)
    returning 1
  )
  select count(*) into unconfirmed_deleted from gone;

  -- Avvisi da annullare: l'account e' stato usato dopo l'email.
  with cleared as (
    delete from public.account_deletion_notices n
     where public.account_last_activity(n.user_id) > n.warned_at
    returning 1
  )
  select count(*) into notices_cleared from cleared;

  -- Avvisati da almeno 30 giorni e mai tornati.
  with gone as (
    delete from auth.users u
     using public.account_deletion_notices n
     where n.user_id = u.id
       and n.delete_after <= now()
    returning 1
  )
  select count(*) into inactive_deleted from gone;

  -- Nuovi avvisi, solo se si puo' davvero mandare l'email.
  select decrypted_secret into api_key
    from vault.decrypted_secrets where name = 'resend_api_key' limit 1;

  if api_key is not null then
    for rec in
      select u.id, u.email,
             coalesce(nullif(u.raw_user_meta_data ->> 'language', ''), 'it') as lang
        from auth.users u
       where u.email is not null
         and u.email_confirmed_at is not null
         and not coalesce(u.is_anonymous, false)
         and not exists (select 1 from public.account_deletion_notices n where n.user_id = u.id)
         and public.account_last_activity(u.id) < now() - interval '23 months'
    loop
      -- Testo nella lingua dell'account, altrimenti in italiano.
      select t.lang, t.subject, t.html into t_lang, t_subject, t_html
        from public.app_email_templates t
       where t.name = 'account-deletion-warning' and t.lang in (rec.lang, 'it')
       order by (t.lang = rec.lang) desc
       limit 1;
      continue when t_html is null;

      delete_on := now() + interval '30 days';
      date_text := case t_lang
        when 'en' then trim(to_char(delete_on, 'FMMonth FMDD, YYYY'))
        when 'de' then to_char(delete_on, 'DD.MM.YYYY')
        else to_char(delete_on, 'DD/MM/YYYY')
      end;

      perform net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || api_key,
          'Content-Type', 'application/json'),
        body := jsonb_build_object(
          'from', 'Chess Hammer <no-reply@mail.chesshammer.com>',
          'to', jsonb_build_array(rec.email),
          'subject', t_subject,
          'html', replace(replace(t_html, '{{DELETE_DATE}}', date_text),
                          '{{LOGIN_URL}}', 'https://chesshammer.com/login'))
      );

      insert into public.account_deletion_notices (user_id, warned_at, delete_after)
      values (rec.id, now(), delete_on);
      warned := warned + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'unconfirmed_deleted', unconfirmed_deleted,
    'notices_cleared', notices_cleared,
    'inactive_deleted', inactive_deleted,
    'warned', warned,
    'email_configured', api_key is not null
  );
end;
$$;

revoke all on function public.run_account_retention() from public, anon, authenticated;
revoke all on function public.account_last_activity(uuid) from public, anon, authenticated;

-- Ogni notte alle 4:30 UTC.
select cron.schedule('account-retention', '30 4 * * *', 'select public.run_account_retention()');
