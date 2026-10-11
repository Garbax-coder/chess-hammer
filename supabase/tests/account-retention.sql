-- Prova di run_account_retention() (migrazione 0027). Da eseguire SOLO sul
-- progetto di sviluppo: tutto avviene in una transazione annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/account-retention.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

-- Eventuali resti di prove precedenti.
delete from auth.users where email like 'retention-%@example.com';

create temp table cases (k text primary key, email text, id uuid);

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

with created as (
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                          email_confirmed_at, last_sign_in_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'retention-a@example.com', '', null, null, now() - interval '8 days', now(), '{}', '{}'),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'retention-b@example.com', '', null, null, now() - interval '2 days', now(), '{}', '{}'),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'retention-d@example.com', '', now() - interval '30 months', now() - interval '1 day',
     now() - interval '30 months', now(), '{}', '{}'),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'retention-e@example.com', '', now() - interval '26 months', now() - interval '26 months',
     now() - interval '26 months', now(), '{}', '{}'),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'retention-f@example.com', '', now() - interval '26 months', now() - interval '26 months',
     now() - interval '26 months', now(), '{}', '{}')
  returning id, email
)
insert into cases select upper(substr(email, 11, 1)), email, id from created;

-- E: avvisato 31 giorni fa e mai tornato. F: avvisato 10 giorni fa, poi ha giocato.
insert into public.account_deletion_notices (user_id, warned_at, delete_after)
select id, now() - interval '31 days', now() - interval '1 day' from cases where k = 'E'
union all
select id, now() - interval '10 days', now() + interval '20 days' from cases where k = 'F';
insert into public.practice_attempts (user_id, puzzle_id, result, time_seconds, attempted_at)
select id, (select puzzle_id from public.lichess_puzzles limit 1), 'solved', 30, now() - interval '2 days'
from cases where k = 'F';

select public.run_account_retention();

do $$
declare
  exists_a bool := exists (select 1 from auth.users u join cases c on c.id = u.id where c.k = 'A');
  exists_b bool := exists (select 1 from auth.users u join cases c on c.id = u.id where c.k = 'B');
  exists_d bool := exists (select 1 from auth.users u join cases c on c.id = u.id where c.k = 'D');
  exists_e bool := exists (select 1 from auth.users u join cases c on c.id = u.id where c.k = 'E');
  notice_f bool := exists (select 1 from public.account_deletion_notices n join cases c on c.id = n.user_id where c.k = 'F');
begin
  if exists_a then raise exception 'A: account mai confermato da 8 giorni non eliminato'; end if;
  if not exists_b then raise exception 'B: account mai confermato da 2 giorni eliminato troppo presto'; end if;
  if not exists_d then raise exception 'D: account attivo eliminato'; end if;
  if exists_e then raise exception 'E: account avvisato da 31 giorni non eliminato'; end if;
  if notice_f then raise exception 'F: avviso non annullato dopo il ritorno'; end if;
  raise notice 'account-retention: tutti i controlli superati';
end $$;

rollback;
