-- Prova dei puzzle "problematici" salvati (migrazione 0031). Da eseguire SOLO
-- sul progetto di sviluppo: tutto avviene in una transazione annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/saved-puzzles.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'saved-test-%@example.com';

create temp table ids as
select gen_random_uuid() as user_a, gen_random_uuid() as user_b,
       (select puzzle_id from public.lichess_puzzles order by puzzle_id limit 1) as puzzle;
grant select on ids to authenticated;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, u, 'authenticated', 'authenticated',
       e, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  from ids, lateral (values (user_a, 'saved-test-a@example.com'),
                            (user_b, 'saved-test-b@example.com')) v(u, e);

-- L'utente B ha gia' salvato lo stesso puzzle.
insert into public.saved_puzzles (user_id, puzzle_id) select user_b, puzzle from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  n int;
begin
  -- A non vede i salvati di B.
  if (select count(*) from public.saved_puzzles) <> 0 then
    raise exception 'un utente vede i puzzle salvati di un altro';
  end if;

  -- A salva e poi toglie il proprio.
  insert into public.saved_puzzles (puzzle_id, user_id)
  select puzzle, user_a from ids;
  if (select count(*) from public.saved_puzzles) <> 1 then
    raise exception 'il salvataggio non risulta';
  end if;

  -- A non puo' salvare a nome di B.
  begin
    insert into public.saved_puzzles (puzzle_id, user_id)
    select (select puzzle_id from public.lichess_puzzles order by puzzle_id offset 1 limit 1), user_b
      from ids;
    raise exception 'un utente ha salvato un puzzle a nome di un altro';
  exception when insufficient_privilege then
    null;
  end;

  -- A non puo' togliere il salvato di B (la riga non e' visibile).
  delete from public.saved_puzzles where user_id = (select user_b from ids);

  delete from public.saved_puzzles where user_id = (select user_a from ids);
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'la rimozione del proprio puzzle non e'' riuscita';
  end if;
end $$;
reset role;

do $$
begin
  if (select count(*) from public.saved_puzzles where user_id = (select user_b from ids)) <> 1 then
    raise exception 'il puzzle salvato di B e'' stato toccato da A';
  end if;

  -- Con l'account se ne va anche la lista.
  delete from auth.users where id = (select user_b from ids);
  if exists (select 1 from public.saved_puzzles where user_id = (select user_b from ids)) then
    raise exception 'i puzzle salvati restano dopo l''eliminazione dell''account';
  end if;
  raise notice 'saved-puzzles: tutti i controlli superati';
end $$;

rollback;
