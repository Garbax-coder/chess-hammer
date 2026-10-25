import { Chess } from 'chess.js'
import { epdOf } from './opening-catalog.ts'

// Nomi delle aperture dal dataset di Lichess (scripts/openings/lichess-openings,
// CC0): ogni nome si lega alla posizione raggiunta dalle sue mosse, cosi'
// vale anche per le trasposizioni. Usata dallo script che genera la
// migrazione dei nomi; importa solo chess.js (niente alias "@/"), cosi' la
// puo' eseguire anche Node.

export interface OpeningName {
  epd: string
  eco: string
  name: string
}

/** Le righe di un file TSV di Lichess (eco, name, pgn), con la loro posizione. */
export function parseOpeningNamesTsv(text: string): OpeningName[] {
  const [header, ...rows] = text.split('\n')
  if (header.trim() !== 'eco\tname\tpgn') {
    throw new Error(`intestazione inattesa: ${header}`)
  }
  return rows
    .filter((row) => row.trim() !== '')
    .map((row) => {
      const [eco, name, pgn] = row.split('\t')
      const chess = new Chess()
      for (const token of pgn.trim().split(/\s+/)) {
        if (!/^\d+\.$/.test(token)) chess.move(token)
      }
      return { epd: epdOf(chess.fen()), eco, name }
    })
}

function sqlText(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

/**
 * La migrazione dei nomi: la tabella (in sola lettura per l'utente), la vista
 * che li lega alle mosse dei repertori e i dati. Se due righe danno la stessa
 * posizione vale l'ultima.
 */
export function openingNamesSql(names: OpeningName[], batchSize = 500): string {
  const unique = [...new Map(names.map((n) => [n.epd, n])).values()]
  const batches: string[] = []
  for (let i = 0; i < unique.length; i += batchSize) {
    const rows = unique
      .slice(i, i + batchSize)
      .map((n) => `  (${sqlText(n.epd)}, ${sqlText(n.eco)}, ${sqlText(n.name)})`)
    batches.push(`insert into public.opening_names (epd, eco, name) values
${rows.join(',\n')}
on conflict (epd) do update set eco = excluded.eco, name = excluded.name;`)
  }
  return `create table if not exists public.opening_names (
  epd text primary key,
  eco text not null,
  name text not null
);

alter table public.opening_names enable row level security;

drop policy if exists "Opening names are readable" on public.opening_names;
create policy "Opening names are readable" on public.opening_names
  for select to authenticated
  using (true);

-- Il nome di ogni mossa dei repertori leggibili (dove la posizione ha un
-- nome). Security invoker: valgono la RLS di opening_nodes e quella dei nomi.
create or replace view public.opening_node_names
with (security_invoker = true) as
select n.id as node_id, n.repertoire_id, o.eco, o.name
  from public.opening_nodes n
  join public.opening_names o on o.epd = n.epd;

revoke all on table public.opening_names, public.opening_node_names from anon, authenticated;
grant select on table public.opening_names, public.opening_node_names to authenticated;
grant all on table public.opening_names, public.opening_node_names to service_role;

-- ${unique.length} posizioni con nome.
${batches.join('\n\n')}
`
}
