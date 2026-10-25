-- Linee sbagliate e frecce (branch feature/opening-training, solo additiva).
--
-- - opening_nodes.is_mistake: la mossa da cui parte una linea sbagliata (da
--   evitare, con il suo seguito: la confutazione e i commenti). Tutta la
--   linea resta fuori dall'allenamento; lo studio la mostra come errore da
--   evitare. Una mossa sbagliata puo' avere un seguito (is_main resta true).
-- - opening_node_arrows: le frecce che un utente disegna su una posizione
--   (dopo una mossa), di qualunque repertorio leggibile, come i commenti.
-- - set_opening_move_mistake; import, copia, aggiunta di mosse e alternative
--   tengono conto degli errori.

alter table public.opening_nodes
  add column if not exists is_mistake boolean not null default false;

create table if not exists public.opening_node_arrows (
  user_id uuid not null references auth.users (id) on delete cascade,
  node_id bigint not null references public.opening_nodes (id) on delete cascade,
  -- [{"from": "e2", "to": "e4", "color": "G"}]: colori G, R, B, Y (come
  -- [%cal] nei PGN di Lichess).
  arrows jsonb not null check (
    jsonb_typeof(arrows) = 'array' and jsonb_array_length(arrows) between 1 and 32
  ),
  updated_at timestamptz not null default now(),
  primary key (user_id, node_id)
);

create index if not exists idx_opening_node_arrows_node
  on public.opening_node_arrows (node_id);

alter table public.opening_node_arrows enable row level security;

drop policy if exists "Users manage own opening arrows" on public.opening_node_arrows;
create policy "Users manage own opening arrows" on public.opening_node_arrows
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.opening_nodes n where n.id = node_id)
  );

revoke all on table public.opening_node_arrows from anon, authenticated;
grant select, insert, update, delete on table public.opening_node_arrows to authenticated;
grant all on table public.opening_node_arrows to service_role;

-- Una mossa di un repertorio personale diventa (o smette di essere) l'inizio
-- di una linea sbagliata. Un'alternativa segnata come errore torna mossa con
-- seguito.
create or replace function public.set_opening_move_mistake(
  p_node_id bigint,
  p_mistake boolean
)
returns void
language plpgsql
set search_path = public, extensions
as $$
begin
  update opening_nodes n
     set is_mistake = p_mistake,
         is_main = case when p_mistake then true else n.is_main end
    from opening_repertoires r
   where n.id = p_node_id
     and r.id = n.repertoire_id
     and r.owner_id = auth.uid();
  if not found then
    raise exception 'Mossa non modificabile.';
  end if;
end;
$$;

-- Come in 0107: alternativa solo senza seguito e accanto a un'altra mossa
-- principale dell'utente che non sia un errore; un errore non e'
-- un'alternativa.
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
    if v_node.is_mistake then
      raise exception 'Un errore non e'' un''alternativa: togli prima il segno di errore.';
    end if;
    if exists (select 1 from opening_nodes where parent_id = p_node_id) then
      raise exception 'Un''alternativa non ha seguito: prima elimina le mosse che seguono.';
    end if;
    if not exists (
      select 1 from opening_nodes
       where repertoire_id = v_node.repertoire_id
         and parent_id is not distinct from v_node.parent_id
         and id <> p_node_id
         and is_main
         and not is_mistake
    ) then
      raise exception 'Serve un''altra tua mossa principale in questa posizione.';
    end if;
  end if;

  update opening_nodes set is_main = not p_alternative where id = p_node_id;
end;
$$;

-- Come in 0107, ma l'alternativa prende il posto della mossa eliminata solo
-- se nella posizione non resta un'altra mossa principale che non sia un
-- errore.
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

  if v_node.is_main and not v_node.is_mistake and not exists (
    select 1 from opening_nodes
     where repertoire_id = v_node.repertoire_id
       and parent_id is not distinct from v_node.parent_id
       and is_main
       and not is_mistake
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
    -- Una linea sbagliata puo' finire con la confutazione dell'avversario.
    exit when v_node.is_mistake or exists (
      select 1 from opening_nodes a
       where a.repertoire_id = v_node.repertoire_id
         and a.is_mistake
         and a.path @> v_node.path
    );
    delete from opening_nodes where id = v_node.id;
    v_parent_id := v_node.parent_id;
  end loop;
end;
$$;

-- Import da PGN (come 0106), con le mosse segnate come errore (? e ??).
create or replace function public.import_opening_repertoire(
  p_name text,
  p_color text,
  p_nodes jsonb
)
returns jsonb
language plpgsql
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
                               comment, is_mistake)
    select v_id, p.id, (n ->> 'path')::extensions.ltree, v_ply, n ->> 'uci', n ->> 'san',
           n ->> 'epd', coalesce((n ->> 'is_main')::boolean, true),
           nullif(left(btrim(n ->> 'comment'), 2000), ''),
           coalesce((n ->> 'is_mistake')::boolean, false)
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

-- Copia personale (come 0106), con errori, note e frecce dell'utente.
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
                               comment, weight, is_mistake)
    select v_id, p.id, n.path, n.ply, n.uci, n.san, n.epd, n.is_main, n.comment, n.weight,
           n.is_mistake
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

  insert into opening_node_arrows (user_id, node_id, arrows)
  select v_user_id, copy.id, a.arrows
    from opening_node_arrows a
    join opening_nodes original on original.id = a.node_id
    join opening_nodes copy on copy.repertoire_id = v_id and copy.path = original.path
   where a.user_id = v_user_id and original.repertoire_id = p_repertoire_id;

  return jsonb_build_object('id', v_id, 'slug', v_slug);
end;
$$;

revoke all on function public.set_opening_move_mistake(bigint, boolean) from public, anon;
grant execute on function public.set_opening_move_mistake(bigint, boolean) to authenticated;
