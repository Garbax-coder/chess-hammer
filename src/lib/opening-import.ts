import {
  buildRepertoire,
  colorAtPly,
  IllegalMoveError,
  type BuildReport,
  type OpeningColor,
} from '@/lib/opening-catalog'
import { pgnLines } from '@/lib/pgn-lines'

/** Mosse al massimo in un repertorio importato (come import_opening_repertoire). */
export const MAX_IMPORT_MOVES = 3000

export interface Preview {
  report?: BuildReport
  lines: number
  skipped: number
  suggestedName: string
  /** Linee che finiscono con una mossa dell'avversario (da completare). */
  openEnds?: number
  /** La prima mossa illegale trovata. */
  illegal?: { line: number; move: string }
  error?: string
}

/**
 * Il PGN letto e trasformato in repertorio, come verra' importato: errori
 * (mossa illegale) e aggiustamenti (mosse dell'avversario in fondo,
 * alternative) si vedono prima di importare.
 */
export function previewImport(pgn: string, color: OpeningColor): Preview {
  const parsed = pgnLines(pgn)
  const suggestedName = parsed.headers.Opening || parsed.headers.Event || ''
  return {
    ...previewLines(parsed.lines, color, {
      comments: parsed.comments,
      mistakes: parsed.mistakes,
    }),
    skipped: parsed.skipped,
    suggestedName,
  }
}

/**
 * Linee (mosse SAN separate da spazi) trasformate in repertorio in modo
 * tollerante, con il conto delle linee che risultano. `branches`: le
 * seconde mosse dell'utente aprono linee nuove invece di restare
 * alternative; `keepOpponentEnds`: una mossa dell'avversario in fondo resta
 * (la linea e' da completare) invece di togliersi.
 */
export function previewLines(
  lines: string[],
  color: OpeningColor,
  {
    comments,
    mistakes,
    branches = false,
    keepOpponentEnds = false,
  }: {
    comments?: Record<string, string>
    mistakes?: string[]
    branches?: boolean
    keepOpponentEnds?: boolean
  } = {},
): Preview {
  const base = { lines: 0, skipped: 0, suggestedName: '' }
  if (lines.length === 0) return base
  try {
    const report = buildRepertoire(
      {
        slug: 'import',
        name: '',
        eco: null,
        color,
        source: null,
        lines,
        comments,
        mistakes,
      },
      { lenient: true, branches, keepOpponentEnds },
    )
    const parents = new Set(report.nodes.map((n) => n.parentPath))
    // Le linee sbagliate non contano tra quelle da allenare.
    const mistakePaths = report.nodes.filter((n) => n.isMistake).map((n) => n.path)
    const leaves = report.nodes.filter(
      (n) =>
        n.isMain &&
        !parents.has(n.path) &&
        !mistakePaths.some((m) => n.path === m || n.path.startsWith(`${m}.`)),
    )
    const openEnds = leaves.filter((n) => colorAtPly(n.ply) !== color).length
    return { ...base, report, lines: leaves.length, openEnds }
  } catch (error) {
    if (error instanceof IllegalMoveError) {
      const number = Math.ceil(error.ply / 2)
      const move = `${number}${error.ply % 2 === 1 ? '.' : '...'}${error.san}`
      return { ...base, illegal: { line: error.line, move } }
    }
    return { ...base, error: error instanceof Error ? error.message : String(error) }
  }
}

/** Si puo' creare: almeno una linea, nessun errore, non troppe mosse. */
export function canCreateFrom(preview: Preview): boolean {
  return (
    preview.lines > 0 &&
    !preview.error &&
    !preview.illegal &&
    (preview.report?.nodes.length ?? 0) <= MAX_IMPORT_MOVES
  )
}
