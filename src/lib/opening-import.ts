import {
  buildRepertoire,
  IllegalMoveError,
  type BuildReport,
  type OpeningColor,
} from '@/lib/opening-catalog'
import { pgnLines } from '@/lib/pgn-lines'

/** Mosse al massimo in un repertorio importato (come import_opening_repertoire). */
export const MAX_IMPORT_MOVES = 3000

interface Preview {
  report?: BuildReport
  lines: number
  skipped: number
  suggestedName: string
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
  const base = { lines: 0, skipped: parsed.skipped, suggestedName }
  if (parsed.lines.length === 0) return base
  try {
    const report = buildRepertoire(
      {
        slug: 'import',
        name: '',
        eco: null,
        color,
        source: null,
        lines: parsed.lines,
        comments: parsed.comments,
      },
      { lenient: true },
    )
    const parents = new Set(report.nodes.map((n) => n.parentPath))
    const lines = report.nodes.filter((n) => n.isMain && !parents.has(n.path)).length
    return { ...base, report, lines }
  } catch (error) {
    if (error instanceof IllegalMoveError) {
      const number = Math.ceil(error.ply / 2)
      const move = `${number}${error.ply % 2 === 1 ? '.' : '...'}${error.san}`
      return { ...base, illegal: { line: error.line, move } }
    }
    return { ...base, error: error instanceof Error ? error.message : String(error) }
  }
}
