import { Chess } from 'chess.js'

// Costruzione del catalogo delle aperture dalle linee scritte a mano
// (scripts/openings/repertoires.json): ogni linea e' una sequenza di mosse
// SAN dalla posizione iniziale, e l'albero e' l'unione delle linee (i prefissi
// comuni diventano lo stesso nodo). Usata dallo script che genera la
// migrazione del catalogo e dai test che controllano le linee. Importa solo
// chess.js (niente alias "@/"), cosi' la puo' eseguire anche Node.

export type OpeningColor = 'w' | 'b'

export interface RepertoireSource {
  slug: string
  name: string
  eco: string | null
  color: OpeningColor
  source: string | null
  lines: string[]
}

export interface CatalogNode {
  /** Mosse UCI dalla radice separate da punti (ltree), es. e2e4.e7e5. */
  path: string
  parentPath: string | null
  ply: number
  uci: string
  san: string
  /** Posizione dopo la mossa senza i contatori (riconosce le trasposizioni). */
  epd: string
}

export function epdOf(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ')
}

/** Chi muove al ply dato (1 = prima mossa del Bianco). */
export function colorAtPly(ply: number): OpeningColor {
  return ply % 2 === 1 ? 'w' : 'b'
}

/**
 * I nodi di un repertorio, in ordine di ply. Lancia un errore se una mossa
 * non e' legale, se una linea finisce con una mossa dell'avversario (un Run
 * finisce con una domanda all'utente) o se in una posizione l'utente ha piu'
 * di una mossa (le alternative accettate arriveranno con il flag is_main).
 */
export function buildRepertoireNodes(source: RepertoireSource): CatalogNode[] {
  const nodes = new Map<string, CatalogNode>()

  source.lines.forEach((line, lineIndex) => {
    const sans = line.trim().split(/\s+/)
    if (colorAtPly(sans.length) !== source.color) {
      throw new Error(
        `${source.slug}, linea ${lineIndex + 1}: deve finire con una mossa di chi allena il repertorio`,
      )
    }
    const chess = new Chess()
    let path: string | null = null
    sans.forEach((san, index) => {
      let move
      try {
        move = chess.move(san)
      } catch {
        throw new Error(
          `${source.slug}, linea ${lineIndex + 1}: mossa ${index + 1} (${san}) non legale`,
        )
      }
      const uci = `${move.from}${move.to}${move.promotion ?? ''}`
      const childPath: string = path ? `${path}.${uci}` : uci
      if (!nodes.has(childPath)) {
        nodes.set(childPath, {
          path: childPath,
          parentPath: path,
          ply: index + 1,
          uci,
          san: move.san,
          epd: epdOf(chess.fen()),
        })
      }
      path = childPath
    })
  })

  const all = [...nodes.values()]
  const userMovesByParent = new Map<string, string[]>()
  for (const node of all) {
    if (colorAtPly(node.ply) !== source.color) continue
    const key = node.parentPath ?? ''
    userMovesByParent.set(key, [...(userMovesByParent.get(key) ?? []), node.san])
  }
  for (const [parent, moves] of userMovesByParent) {
    if (moves.length > 1) {
      throw new Error(
        `${source.slug}: piu' mosse dell'utente dopo ${parent || 'la posizione iniziale'} (${moves.join(', ')})`,
      )
    }
  }

  return all.sort((a, b) => a.ply - b.ply || a.path.localeCompare(b.path))
}

function sqlText(value: string | null): string {
  return value === null ? 'null' : `'${value.replaceAll("'", "''")}'`
}

/**
 * La migrazione che carica il catalogo. Idempotente: un repertorio gia'
 * presente aggiorna nome e dati, i nodi gia' presenti restano (con i
 * progressi degli utenti). I nodi si inseriscono un ply alla volta, perche'
 * ognuno cerca il proprio padre tra quelli gia' inseriti.
 */
export function catalogSql(sources: RepertoireSource[]): string {
  const parts: string[] = []
  for (const source of sources) {
    const nodes = buildRepertoireNodes(source)
    parts.push(
      `-- ${source.name} (${source.color === 'w' ? 'Bianco' : 'Nero'}): ${source.lines.length} Run, ${nodes.length} mosse`,
      `insert into public.opening_repertoires (slug, name, eco, color, source)
values (${sqlText(source.slug)}, ${sqlText(source.name)}, ${sqlText(source.eco)}, ${sqlText(source.color)}, ${sqlText(source.source)})
on conflict (slug) do update
  set name = excluded.name, eco = excluded.eco, color = excluded.color, source = excluded.source;`,
    )
    const maxPly = Math.max(...nodes.map((n) => n.ply))
    for (let ply = 1; ply <= maxPly; ply++) {
      const rows = nodes
        .filter((n) => n.ply === ply)
        .map(
          (n) =>
            `  (${sqlText(n.path)}, ${sqlText(n.parentPath)}, ${n.ply}, ${sqlText(n.uci)}, ${sqlText(n.san)}, ${sqlText(n.epd)})`,
        )
      parts.push(`insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd
  from (values
${rows.join(',\n')}
  ) as v (path, parent_path, ply, uci, san, epd)
  join public.opening_repertoires r on r.slug = ${sqlText(source.slug)}
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do nothing;`)
    }
  }
  return parts.join('\n\n') + '\n'
}
