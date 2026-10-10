-- Metriche d'uso per decidere quando monetizzare (voce z2 del dossier di lancio).
-- Da salvare come snippet nel SQL Editor di Supabase e rieseguire ogni settimana;
-- sola lettura. In "esclusi" vanno gli account del titolare e di test, che
-- altrimenti falserebbero i numeri.
with esclusi(email) as (
  values ('tuo-account@example.com')
),
utenti as (
  select id, created_at
  from auth.users
  where email_confirmed_at is not null
    and email not in (select email from esclusi)
),
attivita as (
  select ts.user_id, pa.attempted_at as at
  from puzzle_attempts pa
  join session_puzzles sp on sp.id = pa.session_puzzle_id
  join training_sessions ts on ts.id = sp.session_id
  union all
  select user_id, attempted_at from practice_attempts
),
attivita_utenti as (
  select a.user_id, a.at from attivita a join utenti u on u.id = a.user_id
),
-- Iscritti da almeno 14 giorni (hanno avuto il tempo di tornare) e da non piu' di 42.
coorte as (
  select id, created_at
  from utenti
  where created_at between now() - interval '42 days' and now() - interval '14 days'
),
sessioni as (
  select ts.* from training_sessions ts join utenti u on u.id = ts.user_id
)
select metrica, valore from (
  select 1 as n, 'Iscritti confermati' as metrica, count(*)::text as valore from utenti
  union all
  select 2, 'Nuovi iscritti, ultimi 7 giorni', count(*)::text
  from utenti where created_at > now() - interval '7 days'
  union all
  select 3, 'Utenti attivi, ultimi 7 giorni', count(distinct user_id)::text
  from attivita_utenti where at > now() - interval '7 days'
  union all
  select 4, 'Utenti attivi, ultimi 28 giorni', count(distinct user_id)::text
  from attivita_utenti where at > now() - interval '28 days'
  union all
  select 5, 'Puzzle per utente attivo, ultimi 7 giorni',
    coalesce(round(count(*)::numeric / nullif(count(distinct user_id), 0), 1)::text, '-')
  from attivita_utenti where at > now() - interval '7 days'
  union all
  select 6, 'Ritorno a 7 giorni (attivi tra il 7o e il 13o giorno dopo l''iscrizione)',
    case when count(*) = 0 then 'nessun iscritto tra 14 e 42 giorni fa'
    else round(100.0 * count(*) filter (where exists (
        select 1 from attivita_utenti a
        where a.user_id = c.id
          and a.at >= c.created_at + interval '7 days'
          and a.at < c.created_at + interval '14 days'
      )) / count(*))::text || '% su ' || count(*) || ' iscritti'
    end
  from coorte c
  union all
  select 7, 'Sessioni arrivate almeno al giro 2', count(*)::text
  from sessioni where current_round >= 2 or status = 'completed'
  union all
  select 8, 'Sessioni completate (3 giri)', count(*)::text
  from sessioni where status = 'completed'
  union all
  select 9, 'Spazio database (limite piano gratuito: 500 MB)',
    pg_size_pretty(pg_database_size(current_database()))
) m
order by n;
