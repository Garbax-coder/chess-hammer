-- Repertori personali importati da PGN (branch feature/opening-training,
-- solo additiva). L'utente puo' creare, rinominare e cancellare i propri
-- repertori (owner_id = lui) e le loro mosse; il catalogo (owner_id null)
-- resta in sola lettura. Cancellando un repertorio spariscono anche mosse,
-- progressi, tentativi e cicli (on delete cascade).
--
-- L'import arriva in una sola chiamata (import_opening_repertoire): il
-- browser legge il PGN, controlla ogni mossa con chess.js e manda le mosse
-- gia' pronte (percorso, padre, SAN, UCI, posizione), come fa lo script del
-- catalogo. Qui si inseriscono un ply alla volta, perche' ogni mossa cerca il
-- padre tra quelle gia' inserite.

drop policy if exists "Users create own repertoires" on public.opening_repertoires;
create policy "Users create own repertoires" on public.opening_repertoires
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Users update own repertoires" on public.opening_repertoires;
create policy "Users update own repertoires" on public.opening_repertoires
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Users delete own repertoires" on public.opening_repertoires;
create policy "Users delete own repertoires" on public.opening_repertoires
  for delete to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Users add nodes to own repertoires" on public.opening_nodes;
create policy "Users add nodes to own repertoires" on public.opening_nodes
  for insert to authenticated
  with check (exists (
    select 1 from public.opening_repertoires r
     where r.id = repertoire_id and r.owner_id = auth.uid()
  ));

drop policy if exists "Users delete nodes of own repertoires" on public.opening_nodes;
create policy "Users delete nodes of own repertoires" on public.opening_nodes
  for delete to authenticated
  using (exists (
    select 1 from public.opening_repertoires r
     where r.id = repertoire_id and r.owner_id = auth.uid()
  ));

-- Le operazioni che la RLS limita ai repertori dell'utente.
grant insert, update, delete on table public.opening_repertoires, public.opening_nodes
  to authenticated;

create index if not exists idx_opening_repertoires_owner
  on public.opening_repertoires (owner_id);

-- Limiti di un repertorio personale: abbastanza per un repertorio vero, non
-- per riempire il database.
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
    insert into opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
    select v_id, p.id, (n ->> 'path')::extensions.ltree, v_ply, n ->> 'uci', n ->> 'san',
           n ->> 'epd', coalesce((n ->> 'is_main')::boolean, true)
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

revoke all on function public.import_opening_repertoire(text, text, jsonb) from public, anon;
grant execute on function public.import_opening_repertoire(text, text, jsonb) to authenticated;
