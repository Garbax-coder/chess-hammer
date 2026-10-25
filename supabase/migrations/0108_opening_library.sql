-- Libreria dei repertori (branch feature/opening-training, solo additiva).
--
-- - opening_hidden_repertoires: i repertori del catalogo che un utente ha
--   tolto dalla sua libreria (i personali invece si eliminano). Si possono
--   rimettere.
-- - create_opening_repertoire: un repertorio personale vuoto, da costruire
--   mossa per mossa nella consultazione.

create table if not exists public.opening_hidden_repertoires (
  user_id uuid not null references auth.users (id) on delete cascade,
  repertoire_id uuid not null references public.opening_repertoires (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, repertoire_id)
);

alter table public.opening_hidden_repertoires enable row level security;

drop policy if exists "Users manage own hidden repertoires" on public.opening_hidden_repertoires;
create policy "Users manage own hidden repertoires" on public.opening_hidden_repertoires
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.opening_repertoires r where r.id = repertoire_id)
  );

revoke all on table public.opening_hidden_repertoires from anon, authenticated;
grant select, insert, update, delete on table public.opening_hidden_repertoires to authenticated;
grant all on table public.opening_hidden_repertoires to service_role;

-- Un repertorio personale senza mosse (stesso limite di 20 dell'import).
create or replace function public.create_opening_repertoire(p_name text, p_color text)
returns jsonb
language plpgsql
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(p_name);
  v_id uuid;
  v_slug text;
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
  if (select count(*) from opening_repertoires where owner_id = v_user_id) >= 20 then
    raise exception 'Hai gia'' 20 repertori personali: cancellane uno per crearne un altro.';
  end if;

  v_slug := 'u-' || substr(md5(gen_random_uuid()::text), 1, 12);
  insert into opening_repertoires (slug, name, color, source, owner_id)
  values (v_slug, v_name, p_color, 'Da zero', v_user_id)
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'slug', v_slug);
end;
$$;

revoke all on function public.create_opening_repertoire(text, text) from public, anon;
grant execute on function public.create_opening_repertoire(text, text) to authenticated;
