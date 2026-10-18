-- Dashboard di amministrazione (/admin): statistiche d'uso, elenco utenti e
-- scheda in sola lettura di un singolo utente.
--
-- Chi e' amministratore: gli account con app_metadata.admin = true in
-- auth.users. app_metadata si scrive solo lato server (SQL editor, service
-- role): un utente non puo' attribuirselo dal client. Nessun amministratore
-- viene designato qui; per aggiungerne uno:
--   update auth.users
--      set raw_app_meta_data = raw_app_meta_data || '{"admin": true}'
--    where email = '...';
--
-- Tutte le funzioni sono security definer (leggono auth.users e i dati di
-- ogni utente, oltre la RLS) e si rifiutano di rispondere a chi non e'
-- amministratore. Nessuna scrive nulla.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select (u.raw_app_meta_data ->> 'admin')::boolean
       from auth.users u
      where u.id = auth.uid()),
    false
  )
$$;

create or replace function public.assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato agli amministratori' using errcode = '42501';
  end if;
end;
$$;

-- Andamento degli ultimi 30 giorni, per ora (ultime 24) e per giorno (ultimi
-- 30, nel fuso orario p_tz di chi guarda). Per ogni intervallo: registrazioni,
-- tentativi sui puzzle delle sessioni, tentativi in pratica libera, giri
-- conclusi e sessioni concluse. I totali per giorno/settimana/mese li somma il
-- client dagli stessi intervalli, cosi' numeri e grafici coincidono.
create or replace function public.admin_stats(p_tz text default 'UTC')
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_hour_start timestamptz := date_trunc('hour', v_now) - interval '23 hours';
  v_day_start timestamptz :=
    (date_trunc('day', v_now at time zone p_tz) - interval '29 days') at time zone p_tz;
  v_since timestamptz := least(v_hour_start, v_day_start);
  v_result jsonb;
begin
  perform public.assert_admin();

  with events as (
    select 'signups' as kind, u.created_at as at
      from auth.users u
     where u.created_at >= v_since
    union all
    select 'session_attempts', a.attempted_at
      from public.puzzle_attempts a
     where a.attempted_at >= v_since
    union all
    select 'practice_attempts', p.attempted_at
      from public.practice_attempts p
     where p.attempted_at >= v_since
    union all
    -- Un giro si conclude col tentativo che porta il conteggio del giro al
    -- traguardo: total_puzzles nel giro 1, la dimensione del pool negli altri
    -- (stessa regola di record_attempt_and_get_next_puzzle).
    select 'rounds_completed', r.attempted_at
      from (
        select a.attempted_at,
               a.round_number,
               ts.total_puzzles,
               row_number() over (
                 partition by ts.id, a.round_number
                 order by a.attempted_at, a.id
               ) as n,
               (select count(*) from public.session_puzzles p2
                 where p2.session_id = ts.id) as pool_size
          from public.puzzle_attempts a
          join public.session_puzzles sp on sp.id = a.session_puzzle_id
          join public.training_sessions ts on ts.id = sp.session_id
      ) r
     where r.attempted_at >= v_since
       and r.n = case when r.round_number = 1 then r.total_puzzles else r.pool_size end
    union all
    select 'sessions_completed', ts.completed_at
      from public.training_sessions ts
     where ts.status = 'completed'
       and ts.completed_at >= v_since
  ),
  hours as (
    select generate_series(v_hour_start, date_trunc('hour', v_now), interval '1 hour') as start
  ),
  days as (
    select (d at time zone p_tz) as start
      from generate_series(
        date_trunc('day', v_now at time zone p_tz) - interval '29 days',
        date_trunc('day', v_now at time zone p_tz),
        interval '1 day'
      ) d
  ),
  hourly as (
    select h.start,
           count(*) filter (where e.kind = 'signups') as signups,
           count(*) filter (where e.kind = 'session_attempts') as session_attempts,
           count(*) filter (where e.kind = 'practice_attempts') as practice_attempts,
           count(*) filter (where e.kind = 'rounds_completed') as rounds_completed,
           count(*) filter (where e.kind = 'sessions_completed') as sessions_completed
      from hours h
      left join events e
        on e.at >= h.start and e.at < h.start + interval '1 hour'
     group by h.start
  ),
  daily as (
    select d.start,
           count(*) filter (where e.kind = 'signups') as signups,
           count(*) filter (where e.kind = 'session_attempts') as session_attempts,
           count(*) filter (where e.kind = 'practice_attempts') as practice_attempts,
           count(*) filter (where e.kind = 'rounds_completed') as rounds_completed,
           count(*) filter (where e.kind = 'sessions_completed') as sessions_completed
      from days d
      left join events e
        on e.at >= d.start
       and e.at < ((((d.start at time zone p_tz) + interval '1 day')) at time zone p_tz)
     group by d.start
  )
  select jsonb_build_object(
    'generated_at', v_now,
    'total_signups', (select count(*) from auth.users),
    'hourly', coalesce((select jsonb_agg(to_jsonb(h) order by h.start) from hourly h), '[]'),
    'daily', coalesce((select jsonb_agg(to_jsonb(d) order by d.start) from daily d), '[]')
  )
  into v_result;

  return v_result;
end;
$$;

-- Elenco degli utenti registrati, dal piu' recente.
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  providers text[],
  created_at timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  last_activity_at timestamptz,
  is_admin boolean,
  language text,
  current_elo integer,
  sessions_count integer,
  active_session_round smallint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();

  return query
  select u.id,
         u.email::text,
         coalesce(
           array(select jsonb_array_elements_text(u.raw_app_meta_data -> 'providers')),
           array[]::text[]
         ),
         u.created_at,
         u.email_confirmed_at,
         u.last_sign_in_at,
         public.account_last_activity(u.id),
         coalesce((u.raw_app_meta_data ->> 'admin')::boolean, false),
         s.language,
         s.current_elo,
         (select count(*)::integer from public.training_sessions ts where ts.user_id = u.id),
         (select ts.current_round from public.training_sessions ts
           where ts.user_id = u.id and ts.status = 'in_progress')
    from auth.users u
    left join public.user_stats s on s.user_id = u.id
   order by u.created_at desc;
end;
$$;

-- Scheda di un utente, in sola lettura: account, preferenze e statistiche,
-- sessioni con l'avanzamento per giro, andamento dell'ELO e pratica libera.
create or replace function public.admin_user_detail(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform public.assert_admin();

  select jsonb_build_object(
    'account', jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'providers', coalesce(u.raw_app_meta_data -> 'providers', '[]'::jsonb),
      'created_at', u.created_at,
      'email_confirmed_at', u.email_confirmed_at,
      'last_sign_in_at', u.last_sign_in_at,
      'last_activity_at', public.account_last_activity(u.id),
      'is_admin', coalesce((u.raw_app_meta_data ->> 'admin')::boolean, false)
    ),
    'stats', (select to_jsonb(s) - 'user_id' from public.user_stats s where s.user_id = u.id),
    'sessions', coalesce((
      select jsonb_agg(
               to_jsonb(ts) || jsonb_build_object(
                 'pool_size', (select count(*) from public.session_puzzles sp
                                where sp.session_id = ts.id),
                 'rounds', (
                   select coalesce(jsonb_agg(jsonb_build_object(
                            'round', r.round_number,
                            'attempted', r.attempted,
                            'solved', r.solved,
                            'last_attempt_at', r.last_attempt_at
                          ) order by r.round_number), '[]'::jsonb)
                     from (
                       select a.round_number,
                              count(*) as attempted,
                              count(*) filter (where a.result = 'solved') as solved,
                              max(a.attempted_at) as last_attempt_at
                         from public.puzzle_attempts a
                         join public.session_puzzles sp on sp.id = a.session_puzzle_id
                        where sp.session_id = ts.id
                        group by a.round_number
                     ) r
                 )
               )
               order by ts.created_at desc
             )
        from public.training_sessions ts
       where ts.user_id = u.id
    ), '[]'::jsonb),
    'elo_history', coalesce((
      select jsonb_agg(jsonb_build_object('attempted_at', a.attempted_at, 'elo_after', a.elo_after)
                       order by a.attempted_at)
        from public.puzzle_attempts a
        join public.session_puzzles sp on sp.id = a.session_puzzle_id
        join public.training_sessions ts on ts.id = sp.session_id
       where ts.user_id = u.id
    ), '[]'::jsonb),
    'practice', jsonb_build_object(
      'attempted', (select count(*) from public.practice_attempts p where p.user_id = u.id),
      'solved', (select count(*) from public.practice_attempts p
                  where p.user_id = u.id and p.result = 'solved'),
      'recent', coalesce((
        select jsonb_agg(to_jsonb(r) order by r.attempted_at desc)
          from (
            select p.puzzle_id, p.result, p.time_seconds, p.attempted_at
              from public.practice_attempts p
             where p.user_id = u.id
             order by p.attempted_at desc
             limit 50
          ) r
      ), '[]'::jsonb)
    )
  )
  into v_result
  from auth.users u
  where u.id = p_user_id;

  if v_result is null then
    raise exception 'Utente non trovato' using errcode = 'P0002';
  end if;

  return v_result;
end;
$$;

-- Puzzle di una sessione con i tentativi dei tre giri (scheda utente).
create or replace function public.admin_session_puzzles(p_session_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();

  return coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'session_puzzle_id', sp.id,
               'order_index', sp.order_index,
               'puzzle_id', sp.puzzle_id,
               'rating', lp.rating,
               'themes', lp.themes,
               'attempts', coalesce((
                 select jsonb_agg(jsonb_build_object(
                          'round_number', a.round_number,
                          'result', a.result,
                          'time_seconds', a.time_seconds,
                          'elo_before', a.elo_before,
                          'elo_after', a.elo_after,
                          'attempted_at', a.attempted_at
                        ) order by a.round_number)
                   from public.puzzle_attempts a
                  where a.session_puzzle_id = sp.id
               ), '[]'::jsonb)
             )
             order by sp.order_index
           )
      from public.session_puzzles sp
      left join public.lichess_puzzles lp on lp.puzzle_id = sp.puzzle_id
     where sp.session_id = p_session_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.assert_admin() from public, anon, authenticated;
revoke all on function public.admin_stats(text) from public, anon;
revoke all on function public.admin_list_users() from public, anon;
revoke all on function public.admin_user_detail(uuid) from public, anon;
revoke all on function public.admin_session_puzzles(uuid) from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_stats(text) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_user_detail(uuid) to authenticated;
grant execute on function public.admin_session_puzzles(uuid) to authenticated;
