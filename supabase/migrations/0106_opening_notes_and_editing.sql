-- Commenti e modifica dei repertori (branch feature/opening-training, solo
-- additiva).
--
-- - opening_node_notes: il commento personale di un utente su una mossa, di
--   qualunque repertorio leggibile (le mosse del catalogo sono di tutti, e un
--   commento non va scritto li'). Una nota vuota nasconde il commento
--   originale della mossa (es. quello del PGN importato).
-- - import_opening_repertoire conserva anche i commenti del PGN.
-- - add_opening_move, delete_opening_move: modifica delle linee di un
--   repertorio personale, mossa per mossa.
-- - copy_opening_repertoire: copia personale (modificabile) di un repertorio,
--   per esempio del catalogo.

create table if not exists public.opening_node_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  node_id bigint not null references public.opening_nodes (id) on delete cascade,
  note text not null check (length(note) <= 2000),
  updated_at timestamptz not null default now(),
  primary key (user_id, node_id)
);

create index if not exists idx_opening_node_notes_node
  on public.opening_node_notes (node_id);

alter table public.opening_node_notes enable row level security;

drop policy if exists "Users manage own opening notes" on public.opening_node_notes;
create policy "Users manage own opening notes" on public.opening_node_notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.opening_nodes n where n.id = node_id)
  );

revoke all on table public.opening_node_notes from anon, authenticated;
grant select, insert, update, delete on table public.opening_node_notes to authenticated;
grant all on table public.opening_node_notes to service_role;

-- Le mosse dei propri repertori si possono aggiornare (promozione di
-- un'alternativa a mossa principale).
drop policy if exists "Users update nodes of own repertoires" on public.opening_nodes;
create policy "Users update nodes of own repertoires" on public.opening_nodes
  for update to authenticated
  using (exists (
    select 1 from public.opening_repertoires r
     where r.id = repertoire_id and r.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.opening_repertoires r
     where r.id = repertoire_id and r.owner_id = auth.uid()
  ));

-- Import da PGN, ora con i commenti (stesse regole e limiti di 0105).
create or replace function public.import_opening_repertoire(
  p_name text,
  p_color text,
  p_nodes jsonb
)
returns jsonb
language plpgsql
-- extensions: il confronto tra percorsi ltree.
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(p_name);
  v_count integer;
  v_id uuid;
  v_slug text;
  v_ply integer;
begin
  if v_user_id is null then
    raise exception 'Utente non autenticato.';
  end if;
  if v_name = '' or length(v_name) > 100 then
    raise exception 'Nome del repertorio non valido.';
  end if;
  if p_color not in ('w', 'b') then
    raise exception 'Colore non valido: %', p_color;
  end if;
  if jsonb_typeof(p_nodes) <> 'array' then
    raise exception 'Mosse non valide.';
  end if;
  v_count := jsonb_array_length(p_nodes);
  if v_count = 0 or v_count > 3000 then
    raise exception 'Un repertorio importato ha da 1 a 3000 mosse (qui %).', v_count;
  end if;
  if (select count(*) from opening_repertoires where owner_id = v_user_id) >= 20 then
    raise exception 'Hai gia'' 20 repertori personali: cancellane uno per importarne un altro.';
  end if;

  v_slug := 'u-' || substr(md5(gen_random_uuid()::text), 1, 12);
  insert into opening_repertoires (slug, name, color, source, owner_id)
  values (v_slug, v_name, p_color, 'PGN', v_user_id)
  returning id into v_id;

  for v_ply in
    select distinct (n ->> 'ply')::int from jsonb_array_elements(p_nodes) n order by 1
  loop
    insert into opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main,
                               comment)
    select v_id, p.id, (n ->> 'path')::extensions.ltree, v_ply, n ->> 'uci', n ->> 'san',
           n ->> 'epd', coalesce((n ->> 'is_main')::boolean, true),
           nullif(left(btrim(n ->> 'comment'), 2000), '')
      from jsonb_array_elements(p_nodes) n
      left join opening_nodes p
        on p.repertoire_id = v_id
       and p.path = (n ->> 'parent_path')::extensions.ltree
     where (n ->> 'ply')::int = v_ply;
  end loop;

  if exists (
    select 1 from opening_nodes
     where repertoire_id = v_id and parent_id is null and ply > 1
  ) then
    raise exception 'Mosse senza la mossa precedente: il repertorio non e'' completo.';
  end if;

  return jsonb_build_object('id', v_id, 'slug', v_slug);
end;
$$;

-- Una mossa nuova in un repertorio personale, dopo `p_parent_id` (null =
-- prima mossa). Se esiste gia' si restituisce quella. Una seconda mossa
-- dell'utente nella stessa posizione e' un'alternativa accettata; dopo
-- un'alternativa non si aggiungono mosse (non ha seguito).
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
  v_repertoire opening_repertoires%rowtype;
  v_parent opening_nodes%rowtype;
  v_ply integer := 1;
  v_path ltree := text2ltree(p_uci);
  v_is_main boolean := true;
  v_node opening_nodes%rowtype;
begin
  select * into v_repertoire
    from opening_repertoires
   where id = p_repertoire_id and owner_id = auth.uid();
  if v_repertoire.id is null then
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
      raise exception 'Un''alternativa non ha seguito: rendila principale per continuare.';
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

  if (case when v_ply % 2 = 1 then 'w' else 'b' end) = v_repertoire.color
     and exists (
       select 1 from opening_nodes
        where repertoire_id = p_repertoire_id
          and parent_id is not distinct from p_parent_id
          and is_main
     ) then
    v_is_main := false;
  end if;

  insert into opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
  values (p_repertoire_id, p_parent_id, v_path, v_ply, p_uci, p_san, p_epd, v_is_main)
  returning * into v_node;
  return to_jsonb(v_node);
end;
$$;

-- Toglie una mossa di un repertorio personale con tutto il suo seguito (e i
-- progressi, per cascata). Se era la mossa principale dell'utente e c'e'
-- un'alternativa, l'alternativa diventa principale. Le mosse dell'avversario
-- rimaste senza seguito si tolgono: ogni linea finisce con una mossa
-- dell'utente.
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

  if v_node.is_main then
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

-- Copia personale di un repertorio leggibile (mosse, alternative, commenti e
-- note dell'utente), da modificare liberamente. I progressi restano
-- sull'originale.
create or replace function public.copy_opening_repertoire(p_repertoire_id uuid, p_name text)
returns jsonb
language plpgsql
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_source opening_repertoires%rowtype;
  v_name text := btrim(p_name);
  v_id uuid;
  v_slug text;
  v_ply integer;
begin
  if v_user_id is null then
    raise exception 'Utente non autenticato.';
  end if;
  select * into v_source from opening_repertoires where id = p_repertoire_id;
  if v_source.id is null then
    raise exception 'Repertorio non trovato.';
  end if;
  if v_name = '' or length(v_name) > 100 then
    raise exception 'Nome del repertorio non valido.';
  end if;
  if (select count(*) from opening_repertoires where owner_id = v_user_id) >= 20 then
    raise exception 'Hai gia'' 20 repertori personali: cancellane uno per crearne un altro.';
  end if;

  v_slug := 'u-' || substr(md5(gen_random_uuid()::text), 1, 12);
  insert into opening_repertoires (slug, name, eco, color, source, owner_id)
  values (v_slug, v_name, v_source.eco, v_source.color, 'Copia', v_user_id)
  returning id into v_id;

  for v_ply in
    select distinct ply from opening_nodes where repertoire_id = p_repertoire_id order by 1
  loop
    insert into opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main,
                               comment, weight)
    select v_id, p.id, n.path, n.ply, n.uci, n.san, n.epd, n.is_main, n.comment, n.weight
      from opening_nodes n
      left join opening_nodes p
        on p.repertoire_id = v_id
       and p.path = subpath(n.path, 0, nlevel(n.path) - 1)
     where n.repertoire_id = p_repertoire_id and n.ply = v_ply;
  end loop;

  insert into opening_node_notes (user_id, node_id, note)
  select v_user_id, copy.id, note.note
    from opening_node_notes note
    join opening_nodes original on original.id = note.node_id
    join opening_nodes copy on copy.repertoire_id = v_id and copy.path = original.path
   where note.user_id = v_user_id and original.repertoire_id = p_repertoire_id;

  return jsonb_build_object('id', v_id, 'slug', v_slug);
end;
$$;

revoke all on function public.add_opening_move(uuid, bigint, text, text, text) from public, anon;
grant execute on function public.add_opening_move(uuid, bigint, text, text, text) to authenticated;
revoke all on function public.delete_opening_move(bigint) from public, anon;
grant execute on function public.delete_opening_move(bigint) to authenticated;
revoke all on function public.copy_opening_repertoire(uuid, text) from public, anon;
grant execute on function public.copy_opening_repertoire(uuid, text) to authenticated;
