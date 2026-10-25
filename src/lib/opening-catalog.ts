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
  /**
   * Mosse alternative accettate: linee che finiscono con una mossa
   * dell'utente diversa da quella del repertorio nella stessa posizione. Nel
   * Drill sono valide ma non si allenano (niente seguito, niente Run).
   */
  alternatives?: string[]
  /** Commenti per mossa: chiave = mosse SAN dall'inizio fino a quella. */
  comments?: Record<string, string>
  /**
   * Mosse che aprono una linea sbagliata (stessa chiave dei commenti): con il
   * loro seguito restano fuori dall'allenamento.
   */
  mistakes?: string[]
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
  /** False per un'alternativa accettata. */
  isMain: boolean
  comment?: string
  /** L'inizio di una linea sbagliata. */
  isMistake?: boolean
}

export function epdOf(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ')
}

/** Chi muove al ply dato (1 = prima mossa del Bianco). */
export function colorAtPly(ply: number): OpeningColor {
  return ply % 2 === 1 ? 'w' : 'b'
}

/** Una mossa illegale in una linea: per mostrarla a chi importa un PGN. */
export class IllegalMoveError extends Error {
  readonly line: number
  readonly ply: number
  readonly san: string

  constructor(message: string, line: number, ply: number, san: string) {
    super(message)
    this.line = line
    this.ply = ply
    this.san = san
  }
}

export interface BuildReport {
  nodes: CatalogNode[]
  /** Mosse dell'avversario in fondo alle linee, tolte (solo in modo tollerante). */
  trimmed: number
  /** Seconde mosse dell'utente nella stessa posizione, tenute come alternative. */
  alternatives: number
  /** Mosse che aprono una linea sbagliata. */
  mistakes: number
}

/**
 * I nodi di un repertorio, in ordine di ply. Un Run finisce con una domanda
 * all'utente, e in ogni posizione l'utente ha una sola mossa da allenare (le
 * altre sono alternative accettate, senza seguito).
 *
 * In modo rigido (catalogo) una linea che non rispetta queste regole e' un
 * errore. In modo tollerante (import PGN) si aggiusta: le mosse
 * dell'avversario in fondo si tolgono, e una seconda mossa dell'utente
 * diventa un'alternativa senza il suo seguito. Una mossa illegale e' sempre
 * un errore.
 */
export function buildRepertoire(
  source: RepertoireSource,
  {
    lenient = false,
    branches = false,
    keepOpponentEnds = false,
  }: {
    lenient?: boolean
    /**
     * Solo in modo tollerante: una seconda mossa dell'utente nella stessa
     * posizione apre una linea nuova, con il suo seguito, invece di restare
     * un'alternativa (es. un repertorio con tutte le varianti di un'apertura).
     */
    branches?: boolean
    /**
     * Solo in modo tollerante: una linea che finisce con una mossa
     * dell'avversario resta com'e' (la risposta la aggiunge l'utente), invece
     * di perdere quella mossa.
     */
    keepOpponentEnds?: boolean
  } = {},
): BuildReport {
  const nodes = new Map<string, CatalogNode>()
  // Per ogni posizione (percorso del padre) la mossa principale dell'utente.
  const mainUserMove = new Map<string, string>()
  let trimmed = 0
  let alternatives = 0
  const mistakes = new Set(source.mistakes ?? [])
  const fail = (message: string): never => {
    throw new Error(`${source.slug}, ${message}`)
  }

  function addLine(
    sans: string[],
    label: string,
    lineNumber: number,
    asAlternative: boolean,
  ) {
    const chess = new Chess()
    let path: string | null = null
    // Dentro una linea sbagliata valgono altre regole: piu' mosse
    // dell'utente nella stessa posizione sono tutte linee, e una mossa gia'
    // vista la marca come errore.
    let inMistake = false
    for (const [index, san] of sans.entries()) {
      let move
      try {
        move = chess.move(san)
      } catch {
        throw new IllegalMoveError(
          `${source.slug}, ${label}: mossa ${index + 1} (${san}) non legale`,
          lineNumber,
          index + 1,
          san,
        )
      }
      const uci = `${move.from}${move.to}${move.promotion ?? ''}`
      const ply = index + 1
      const key = sans.slice(0, index + 1).join(' ')
      const comment = source.comments?.[key]
      const isMistake = mistakes.has(key)
      inMistake ||= isMistake
      const childPath: string = path ? `${path}.${uci}` : uci
      const existing = nodes.get(childPath)
      const isLast = index === sans.length - 1
      if (existing && !existing.isMain) {
        // Un'alternativa gia' presente: va bene come ultima mossa, non come
        // inizio di un seguito (che in modo tollerante si lascia cadere).
        if (isLast || lenient) return
        return fail(`${label}: ${move.san} e' un'alternativa, non puo' avere un seguito`)
      }
      const userMove = colorAtPly(ply) === source.color
      const parentKey = path ?? ''
      const main = mainUserMove.get(parentKey)
      const branch = (branches && lenient) || inMistake
      if (!existing && userMove && main !== undefined && main !== childPath && !branch) {
        // Una seconda mossa dell'utente nella stessa posizione.
        if (asAlternative && isLast) {
          nodes.set(
            childPath,
            node(childPath, path, ply, uci, move.san, chess.fen(), false, comment),
          )
          return
        }
        if (!lenient) {
          return fail(
            `${label}: piu' mosse dell'utente dopo ${path || 'la posizione iniziale'} (${nodes.get(main)!.san}, ${move.san})`,
          )
        }
        nodes.set(
          childPath,
          node(childPath, path, ply, uci, move.san, chess.fen(), false, comment),
        )
        alternatives++
        return
      }
      if (asAlternative && isLast) {
        return fail(
          `${label}: l'alternativa ${move.san} non ha una mossa principale da affiancare`,
        )
      }
      if (!existing) {
        nodes.set(childPath, {
          ...node(childPath, path, ply, uci, move.san, chess.fen(), true, comment),
          ...(isMistake ? { isMistake } : {}),
        })
        if (userMove && !inMistake) mainUserMove.set(parentKey, childPath)
      } else {
        if (comment && !existing.comment) existing.comment = comment
        if (isMistake) existing.isMistake = true
      }
      path = childPath
    }
  }

  source.lines.forEach((line, lineIndex) => {
    let sans = line.trim().split(/\s+/).filter(Boolean)
    const opponentEnd = sans.length > 0 && colorAtPly(sans.length) !== source.color
    // Una linea sbagliata finisce spesso con la confutazione dell'avversario.
    const throughMistake = sans.some((_, i) =>
      mistakes.has(sans.slice(0, i + 1).join(' ')),
    )
    if (opponentEnd && !(lenient && (keepOpponentEnds || throughMistake))) {
      if (!lenient) {
        fail(
          `linea ${lineIndex + 1}: deve finire con una mossa di chi allena il repertorio`,
        )
      }
      trimmed++
      sans = sans.slice(0, -1)
    }
    if (sans.length > 0) addLine(sans, `linea ${lineIndex + 1}`, lineIndex + 1, false)
  })
  for (const [index, line] of (source.alternatives ?? []).entries()) {
    const sans = line.trim().split(/\s+/)
    if (colorAtPly(sans.length) !== source.color) {
      fail(
        `alternativa ${index + 1}: deve finire con una mossa di chi allena il repertorio`,
      )
    }
    addLine(sans, `alternativa ${index + 1}`, index + 1, true)
  }

  return {
    nodes: [...nodes.values()].sort(
      (a, b) => a.ply - b.ply || a.path.localeCompare(b.path),
    ),
    trimmed,
    alternatives,
    mistakes: [...nodes.values()].filter((n) => n.isMistake).length,
  }
}

function node(
  path: string,
  parentPath: string | null,
  ply: number,
  uci: string,
  san: string,
  fen: string,
  isMain: boolean,
  comment?: string,
): CatalogNode {
  return {
    path,
    parentPath,
    ply,
    uci,
    san,
    epd: epdOf(fen),
    isMain,
    ...(comment ? { comment } : {}),
  }
}

/** I nodi di un repertorio del catalogo (modo rigido: un errore blocca). */
export function buildRepertoireNodes(source: RepertoireSource): CatalogNode[] {
  return buildRepertoire(source).nodes
}

function sqlText(value: string | null): string {
  return value === null ? 'null' : `'${value.replaceAll("'", "''")}'`
}

/**
 * La migrazione che carica il catalogo. Idempotente: un repertorio gia'
 * presente aggiorna nome e dati, i nodi gia' presenti restano (con i
 * progressi degli utenti) e aggiornano solo il flag di alternativa. I nodi si inseriscono un ply alla volta, perche'
 * ognuno cerca il proprio padre tra quelli gia' inseriti.
 */
export function catalogSql(sources: RepertoireSource[]): string {
  const parts: string[] = []
  for (const source of sources) {
    const nodes = buildRepertoireNodes(source)
    parts.push(
      `-- ${source.name} (${source.color === 'w' ? 'Bianco' : 'Nero'}): ${source.lines.length} Run, ${nodes.length} mosse (${source.alternatives?.length ?? 0} alternative)`,
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
            `  (${sqlText(n.path)}, ${sqlText(n.parentPath)}, ${n.ply}, ${sqlText(n.uci)}, ${sqlText(n.san)}, ${sqlText(n.epd)}, ${n.isMain})`,
        )
      parts.push(`insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
${rows.join(',\n')}
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = ${sqlText(source.slug)}
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;`)
    }
  }
  return parts.join('\n\n') + '\n'
}
