-- Eliminazione self-service dell'account: l'utente puo' cancellare solo se
-- stesso (auth.uid()), senza bisogno di una chiave service-role lato client.
-- SECURITY DEFINER perche' la tabella auth.users non e' accessibile al ruolo
-- "authenticated"; la funzione gira con i privilegi di chi la crea
-- (postgres), ma agisce sempre e solo sulla riga dell'utente che la chiama.
-- Tutte le tabelle utente hanno on delete cascade da auth.users
-- (user_stats, training_sessions, practice_attempts; session_puzzles e
-- puzzle_attempts a cascata via training_sessions), quindi basta questo
-- singolo delete.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
