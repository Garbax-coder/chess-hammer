-- Modalita' Learn dell'allenamento sulle aperture (branch
-- feature/opening-training, solo additiva): una mossa dell'utente vista e
-- giocata seguendo la freccia diventa "in apprendimento". Non e' un tentativo
-- a memoria, quindi non entra in opening_attempts ne' nei conteggi: crea solo
-- il progresso, con il primo ripasso fra 4 ore (opening_due_at con serie 1).
-- Una mossa gia' studiata o allenata resta com'e'.
--
-- Security invoker, come record_opening_move: la RLS limita le righe a quelle
-- di chi chiama, e la mossa deve appartenere a un repertorio che puo' leggere.
create or replace function public.learn_opening_move(p_node_id bigint)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_progress opening_node_progress%rowtype;
begin
  if v_user_id is null then
    raise exception 'Utente non autenticato.';
  end if;
  if not exists (select 1 from opening_nodes where id = p_node_id) then
    raise exception 'Mossa del repertorio non trovata.';
  end if;

  insert into opening_node_progress (user_id, node_id, last_seen_at, due_at)
  values (v_user_id, p_node_id, now(), opening_due_at(1, now()))
  on conflict (user_id, node_id) do nothing;

  select * into v_progress
    from opening_node_progress
   where user_id = v_user_id and node_id = p_node_id;
  return to_jsonb(v_progress);
end;
$$;

revoke all on function public.learn_opening_move(bigint) from public, anon;
grant execute on function public.learn_opening_move(bigint) to authenticated;
