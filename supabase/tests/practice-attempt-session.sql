-- Prova della sessione registrata sui tentativi di pratica libera (migrazione
-- 0033). Da eseguire SOLO sul progetto di sviluppo: tutto avviene in una
-- transazione annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/practice-attempt-session.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'practice-session-test-%@example.com';

create temp table ids as
select gen_random_uuid() as user_a, gen_random_uuid() as user_b,
       gen_random_uuid() as session_a, gen_random_uuid() as session_b,
       (select puzzle_id from public.lichess_puzzles order by puzzle_id limit 1) as puzzle;
grant select on ids to authenticated;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, u, 'authenticated', 'authenticated',
       e, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  from ids, lateral (values (user_a, 'practice-session-test-a@example.com'),
                            (user_b, 'practice-session-test-b@example.com')) v(u, e);

insert into public.training_sessions (id, user_id, total_puzzles, daily_target_round1,
                                      daily_target_round2, daily_target_round3, status)
select session_a, user_a, 10, 10, 10, 10, 'completed' from ids
union all
select session_b, user_b, 10, 10, 10, 10, 'in_progress' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
begin
  -- Nella propria sessione (anche conclusa) e senza sessione: ammesso.
  insert into public.practice_attempts (user_id, puzzle_id, result, time_seconds, session_id)
  select user_a, puzzle, 'solved', 10, session_a from ids;
  insert into public.practice_attempts (user_id, puzzle_id, result, time_seconds)
  select user_a, puzzle, 'failed', 12 from ids;
  if (select count(*) from public.practice_attempts where session_id = (select session_a from ids)) <> 1 then
    raise exception 'il tentativo con la propria sessione non risulta';
  end if;

  -- Legato alla sessione di un altro utente: rifiutato.
  begin
    insert into public.practice_attempts (user_id, puzzle_id, result, time_seconds, session_id)
    select user_a, puzzle, 'solved', 10, session_b from ids;
    raise exception 'un tentativo e'' stato legato alla sessione di un altro utente';
  exception when insufficient_privilege then
    null;
  end;
end $$;
reset role;

do $$
begin
  -- Eliminata la sessione, il tentativo resta (pratica dell'utente) senza sessione.
  delete from public.training_sessions where id = (select session_a from ids);
  if (select count(*) from public.practice_attempts
       where user_id = (select user_a from ids) and session_id is null) <> 2 then
    raise exception 'eliminando la sessione i tentativi dovevano restare senza sessione';
  end if;
  raise notice 'practice-attempt-session: tutti i controlli superati';
end $$;

rollback;
