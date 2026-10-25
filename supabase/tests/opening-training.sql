-- Prova delle migrazioni 0100-0105 (allenamento sulle aperture). Da
-- eseguire SOLO sul progetto di sviluppo: tutto avviene in una transazione
-- annullata alla fine.
--   psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/opening-training.sql
-- Se un controllo fallisce, l'errore dice quale.
begin;

do $$
begin
  if current_database() <> 'postgres' or (select count(*) from public.lichess_puzzles) > 100000 then
    raise exception 'sembra la produzione: questa prova va eseguita solo in sviluppo';
  end if;
end $$;

delete from auth.users where email like 'opening-test-%@example.com';

-- Due utenti e un repertorio personale di B, che A non deve vedere.
create temp table ids as
select gen_random_uuid() as user_a, gen_random_uuid() as user_b,
       (select n.id from public.opening_nodes n
          join public.opening_repertoires r on r.id = n.repertoire_id
         where r.slug = 'italian-game' and n.path = 'e2e4'::extensions.ltree) as e4,
       (select n.id from public.opening_nodes n
          join public.opening_repertoires r on r.id = n.repertoire_id
         where r.slug = 'italian-game'
           and n.path = 'e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6.b1c3.f8e7.f1e2'::extensions.ltree) as leaf;
grant select on ids to authenticated;
create temp table ids_import (repertoire_id uuid);
grant select, insert on ids_import to authenticated;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000'::uuid, u, 'authenticated', 'authenticated',
       e, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  from ids, lateral (values (user_a, 'opening-test-a@example.com'),
                            (user_b, 'opening-test-b@example.com')) v(u, e);

insert into public.opening_repertoires (slug, name, color, owner_id)
select 'opening-test-private', 'Private', 'w', user_b from ids;

do $$
begin
  if (select e4 from ids) is null or (select leaf from ids) is null then
    raise exception 'catalogo: manca la Partita Italiana (migrazione 0101)';
  end if;
end $$;

select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
declare
  r jsonb;
begin
  -- Il catalogo si legge, il repertorio personale di un altro no.
  if (select count(*) from public.opening_repertoires where owner_id is null) < 3 then
    raise exception 'catalogo: attesi almeno 3 repertori';
  end if;
  if exists (select 1 from public.opening_repertoires where slug = 'opening-test-private') then
    raise exception 'A vede il repertorio personale di B';
  end if;

  -- Nomi delle aperture (migrazione 0102): 1.e4 e5 2.Nf3 Nf6 e' la Petrov.
  if (select v.name from public.opening_node_names v
        join public.opening_nodes n on n.id = v.node_id
        join public.opening_repertoires r on r.id = n.repertoire_id
       where r.slug = 'italian-game'
         and n.path = 'e2e4.e7e5.g1f3.g8f6'::extensions.ltree) is distinct from 'Petrov''s Defense' then
    raise exception 'nomi: 2...Nf6 dovrebbe essere la Petrov';
  end if;

  -- Prima risposta giusta: serie 1, ripasso fra 4 ore.
  r := public.record_opening_move((select e4 from ids), (select leaf from ids), 'e2e4', 'correct', 1200);
  if (r ->> 'streak')::int <> 1 or (r ->> 'first_try_correct')::int <> 1
     or (r ->> 'due_at')::timestamptz < now() + interval '3 hours 59 minutes'
     or (r ->> 'due_at')::timestamptz > now() + interval '4 hours 1 minute' then
    raise exception 'prima risposta giusta: progresso inatteso %', r;
  end if;

  -- Seconda giusta: serie 2, fra un giorno.
  r := public.record_opening_move((select e4 from ids), (select leaf from ids), 'e2e4', 'correct', 900);
  if (r ->> 'streak')::int <> 2 or (r ->> 'attempts')::int <> 2
     or (r ->> 'due_at')::timestamptz < now() + interval '23 hours' then
    raise exception 'seconda risposta giusta: progresso inatteso %', r;
  end if;

  -- Sbagliata: serie azzerata, di nuovo da ripassare subito.
  r := public.record_opening_move((select e4 from ids), (select leaf from ids), 'd2d4', 'wrong', 3000);
  if (r ->> 'streak')::int <> 0 or (r ->> 'attempts')::int <> 3
     or (r ->> 'first_try_correct')::int <> 2 or (r ->> 'due_at')::timestamptz > now() then
    raise exception 'risposta sbagliata: progresso inatteso %', r;
  end if;
  if (select count(*) from public.opening_attempts) <> 3 then
    raise exception 'attesi 3 tentativi registrati';
  end if;

  -- Modalita' Learn (0103): una mossa nuova diventa "in apprendimento",
  -- senza tentativi e con il primo ripasso fra 4 ore.
  r := public.learn_opening_move((select leaf from ids));
  if (r ->> 'attempts')::int <> 0 or (r ->> 'streak')::int <> 0
     or (r ->> 'due_at')::timestamptz < now() + interval '3 hours 59 minutes'
     or (r ->> 'due_at')::timestamptz > now() + interval '4 hours 1 minute' then
    raise exception 'studio di una mossa nuova: progresso inatteso %', r;
  end if;
  -- Una mossa gia' allenata resta com'e'.
  r := public.learn_opening_move((select e4 from ids));
  if (r ->> 'attempts')::int <> 3 or (r ->> 'first_try_correct')::int <> 2 then
    raise exception 'studio di una mossa gia'' allenata: progresso cambiato %', r;
  end if;
  if (select count(*) from public.opening_attempts) <> 3 then
    raise exception 'lo studio non deve registrare tentativi';
  end if;

  -- Cicli Woodpecker (0104): uno per numero, solo su repertori leggibili.
  insert into public.opening_cycles (user_id, repertoire_id, cycle, lines, moves, correct,
                                     total_ms, started_at)
  select (select user_a from ids), r.id, 1, 8, 34, 30, 240000, now() - interval '5 minutes'
    from public.opening_repertoires r where r.slug = 'italian-game';
  begin
    insert into public.opening_cycles (user_id, repertoire_id, cycle, lines, moves, correct,
                                       total_ms, started_at)
    select (select user_a from ids), r.id, 1, 8, 34, 31, 200000, now()
      from public.opening_repertoires r where r.slug = 'italian-game';
    raise exception 'ciclo duplicato accettato';
  exception when unique_violation then null;
  end;
  begin
    insert into public.opening_cycles (user_id, repertoire_id, cycle, lines, moves, correct,
                                       total_ms, started_at)
    select (select user_a from ids), r.id, 1, 1, 1, 1, 1000, now()
      from public.opening_repertoires r where r.slug = 'opening-test-private';
    if found then
      raise exception 'ciclo sul repertorio personale di un altro accettato';
    end if;
  exception when insufficient_privilege then null;
  end;

  -- Import di un repertorio personale (0105): 1.e4 e5 2.Nf3.
  r := public.import_opening_repertoire('  Mio repertorio ', 'w', jsonb_build_array(
    jsonb_build_object('path', 'e2e4', 'parent_path', null, 'ply', 1, 'uci', 'e2e4',
                       'san', 'e4', 'epd', 'x1', 'is_main', true),
    jsonb_build_object('path', 'e2e4.e7e5', 'parent_path', 'e2e4', 'ply', 2, 'uci', 'e7e5',
                       'san', 'e5', 'epd', 'x2', 'is_main', true),
    jsonb_build_object('path', 'e2e4.e7e5.g1f3', 'parent_path', 'e2e4.e7e5', 'ply', 3,
                       'uci', 'g1f3', 'san', 'Nf3', 'epd', 'x3')));
  if (select name from public.opening_repertoires where id = (r ->> 'id')::uuid) <> 'Mio repertorio'
     or (select count(*) from public.opening_nodes
          where repertoire_id = (r ->> 'id')::uuid and parent_id is not null) <> 2 then
    raise exception 'import: repertorio o mosse inattesi %', r;
  end if;
  begin
    perform public.import_opening_repertoire('X', 'w', jsonb_build_array(
      jsonb_build_object('path', 'e2e4.e7e5', 'parent_path', 'e2e4', 'ply', 2, 'uci', 'e7e5',
                         'san', 'e5', 'epd', 'x')));
    raise exception 'import senza la mossa precedente accettato';
  exception when raise_exception then
    if sqlerrm not like 'Mosse senza la mossa precedente%' then raise; end if;
  end;
  begin
    perform public.import_opening_repertoire('X', 'r', '[]'::jsonb);
    raise exception 'colore non valido accettato';
  exception when raise_exception then
    if sqlerrm not like 'Colore non valido%' then raise; end if;
  end;
  -- Il catalogo non si tocca.
  begin
    insert into public.opening_nodes (repertoire_id, path, ply, uci, san, epd)
    select r2.id, 'h2h4'::extensions.ltree, 1, 'h2h4', 'h4', 'x'
      from public.opening_repertoires r2 where r2.slug = 'italian-game';
    raise exception 'mossa aggiunta al catalogo';
  exception when insufficient_privilege then null;
  end;
  delete from public.opening_repertoires where slug = 'italian-game';
  if not exists (select 1 from public.opening_repertoires where slug = 'italian-game') then
    raise exception 'catalogo cancellato da un utente';
  end if;
  insert into ids_import select (r ->> 'id')::uuid;

  -- Esito non valido.
  begin
    perform public.record_opening_move((select e4 from ids), (select leaf from ids), 'e2e4', 'boh', 1);
    raise exception 'esito non valido accettato';
  exception when raise_exception then
    if sqlerrm not like 'Esito non valido%' then raise; end if;
  end;
end $$;
reset role;

-- B non vede i progressi e i tentativi di A.
select set_config('request.jwt.claims',
                  json_build_object('sub', user_b, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
begin
  if exists (select 1 from public.opening_node_progress)
     or exists (select 1 from public.opening_attempts)
     or exists (select 1 from public.opening_cycles)
     or exists (select 1 from public.opening_repertoires
                 where id = (select repertoire_id from ids_import)) then
    raise exception 'B vede i progressi di A';
  end if;
end $$;
reset role;

-- Chi ha importato un repertorio lo puo' cancellare, con le sue mosse.
select set_config('request.jwt.claims',
                  json_build_object('sub', user_a, 'role', 'authenticated')::text, true)
  from ids;
set local role authenticated;
do $$
begin
  delete from public.opening_repertoires where id = (select repertoire_id from ids_import);
  if exists (select 1 from public.opening_nodes
              where repertoire_id = (select repertoire_id from ids_import)) then
    raise exception 'cancellando il repertorio restano le sue mosse';
  end if;
end $$;
reset role;

do $$
begin
  if has_function_privilege('anon',
       'public.record_opening_move(bigint, bigint, text, text, integer)', 'execute')
     or has_function_privilege('anon', 'public.learn_opening_move(bigint)', 'execute') then
    raise exception 'anon puo'' registrare mosse';
  end if;
  raise notice 'opening-training: tutti i controlli superati';
end $$;

rollback;
