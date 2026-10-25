-- Linee nuove nei repertori personali (branch feature/opening-training).
--
-- Fino a 0106 una seconda mossa dell'utente nella stessa posizione era
-- sempre un'alternativa accettata, senza seguito. Ora in modifica ogni mossa
-- aggiunta e' principale e puo' avere un seguito: l'utente puo' avere piu'
-- linee che si separano con una sua mossa diversa. L'alternativa accettata
-- (senza seguito, non allenata) si sceglie a parte, con
-- set_opening_move_alternative.

-- Una mossa nuova in un repertorio personale, dopo `p_parent_id` (null =
-- prima mossa). Se esiste gia' si restituisce quella. Dopo un'alternativa
-- non si aggiungono mosse (non ha seguito).
create or replace function public.add_opening_move(
  p_repertoire_id uuid,
  p_parent_id bigint,
  p_uci text,
  p_san text,
  p_epd text
)
returns jsonb
language plpgsql
set search_path = public, extensions
as $$
declare
  v_parent opening_nodes%rowtype;
  v_ply integer := 1;
  v_path ltree := text2ltree(p_uci);
  v_node opening_nodes%rowtype;
begin
  if not exists (
    select 1 from opening_repertoires
     where id = p_repertoire_id and owner_id = auth.uid()
  ) then
    raise exception 'Repertorio non modificabile.';
  end if;
  if p_uci !~ '^[a-h][1-8][a-h][1-8][qrbn]?$' then
    raise exception 'Mossa non valida: %', p_uci;
  end if;

  if p_parent_id is not null then
    select * into v_parent
      from opening_nodes
     where id = p_parent_id and repertoire_id = p_repertoire_id;
    if v_parent.id is null then
      raise exception 'Mossa precedente non trovata.';
    end if;
    if not v_parent.is_main then
      raise exception 'Un''alternativa non ha seguito: rendila una linea per continuare.';
    end if;
    v_ply := v_parent.ply + 1;
    v_path := v_parent.path || text2ltree(p_uci);
  end if;

  select * into v_node
    from opening_nodes
   where repertoire_id = p_repertoire_id and path = v_path;
  if v_node.id is not null then
    return to_jsonb(v_node);
  end if;

  insert into opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
  values (p_repertoire_id, p_parent_id, v_path, v_ply, p_uci, p_san, p_epd, true)
  returning * into v_node;
  return to_jsonb(v_node);
end;
$$;

-- Una mossa dell'utente diventa alternativa accettata (p_alternative) o
-- torna una linea. Alternativa solo senza seguito e se nella stessa
-- posizione resta un'altra mossa principale (quella che si allena).
create or replace function public.set_opening_move_alternative(
  p_node_id bigint,
  p_alternative boolean
)
returns void
language plpgsql
set search_path = public, extensions
as $$
declare
  v_node opening_nodes%rowtype;
  v_color char(1);
begin
  select n.* into v_node
    from opening_nodes n
    join opening_repertoires r on r.id = n.repertoire_id
   where n.id = p_node_id and r.owner_id = auth.uid();
  if v_node.id is null then
    raise exception 'Mossa non modificabile.';
  end if;
  select color into v_color from opening_repertoires where id = v_node.repertoire_id;
  if (case when v_node.ply % 2 = 1 then 'w' else 'b' end) <> v_color then
    raise exception 'Solo una tua mossa puo'' essere un''alternativa.';
  end if;

  if p_alternative then
    if exists (select 1 from opening_nodes where parent_id = p_node_id) then
      raise exception 'Un''alternativa non ha seguito: prima elimina le mosse che seguono.';
    end if;
    if not exists (
      select 1 from opening_nodes
       where repertoire_id = v_node.repertoire_id
         and parent_id is not distinct from v_node.parent_id
         and id <> p_node_id
         and is_main
    ) then
      raise exception 'Serve un''altra tua mossa principale in questa posizione.';
    end if;
  end if;

  update opening_nodes set is_main = not p_alternative where id = p_node_id;
end;
$$;

-- Come in 0106, ma l'alternativa diventa principale solo se nella posizione
-- non resta un'altra mossa principale.
create or replace function public.delete_opening_move(p_node_id bigint)
returns void
language plpgsql
set search_path = public, extensions
as $$
declare
  v_node opening_nodes%rowtype;
  v_color char(1);
  v_alternative bigint;
  v_parent_id bigint;
begin
  select n.* into v_node
    from opening_nodes n
    join opening_repertoires r on r.id = n.repertoire_id
   where n.id = p_node_id and r.owner_id = auth.uid();
  if v_node.id is null then
    raise exception 'Mossa non modificabile.';
  end if;
  select color into v_color from opening_repertoires where id = v_node.repertoire_id;

  delete from opening_nodes where id = p_node_id;

  if v_node.is_main and not exists (
    select 1 from opening_nodes
     where repertoire_id = v_node.repertoire_id
       and parent_id is not distinct from v_node.parent_id
       and is_main
  ) then
    select id into v_alternative
      from opening_nodes
     where repertoire_id = v_node.repertoire_id
       and parent_id is not distinct from v_node.parent_id
       and not is_main
     order by id
     limit 1;
    if v_alternative is not null then
      update opening_nodes set is_main = true where id = v_alternative;
      return;
    end if;
  end if;

  v_parent_id := v_node.parent_id;
  while v_parent_id is not null loop
    exit when exists (select 1 from opening_nodes where parent_id = v_parent_id);
    select * into v_node from opening_nodes where id = v_parent_id;
    exit when (case when v_node.ply % 2 = 1 then 'w' else 'b' end) = v_color;
    delete from opening_nodes where id = v_node.id;
    v_parent_id := v_node.parent_id;
  end loop;
end;
$$;

revoke all on function public.set_opening_move_alternative(bigint, boolean) from public, anon;
grant execute on function public.set_opening_move_alternative(bigint, boolean) to authenticated;
