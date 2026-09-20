import type { PuzzleAttempt, SessionPuzzleResult } from '@/types/training'

// Solo tipi importati (nessuna dipendenza da Supabase/React): la logica di
// merge resta pura e verificabile da sola.

export function attemptsByRound(attempts: PuzzleAttempt[]): SessionPuzzleResult['attempts'] {
  const byRound: SessionPuzzleResult['attempts'] = {}
  for (const attempt of attempts) {
    byRound[attempt.round_number] = attempt
  }
  return byRound
}

export function maxOrderIndex(puzzles: SessionPuzzleResult[]): number {
  return puzzles.reduce((max, p) => Math.max(max, p.orderIndex), 0)
}

// Applica alla lista in cache solo cio' che e' cambiato dopo un tentativo:
// i tentativi (aggiornati) di un puzzle e/o i puzzle appena aggiunti al pool.
// Dedupe per sessionPuzzleId: due sincronizzazioni ravvicinate possono
// leggere le stesse righe nuove, e la seconda non deve duplicarle.
export function mergeSessionPuzzlesDelta(
  current: SessionPuzzleResult[],
  delta: {
    newPuzzles: SessionPuzzleResult[]
    changedSessionPuzzleId?: string
    changedAttempts?: PuzzleAttempt[] | null
  },
): SessionPuzzleResult[] {
  const { newPuzzles, changedSessionPuzzleId, changedAttempts } = delta

  let next = current
  if (changedSessionPuzzleId && changedAttempts) {
    const attempts = attemptsByRound(changedAttempts)
    next = next.map((p) =>
      p.sessionPuzzleId === changedSessionPuzzleId ? { ...p, attempts } : p,
    )
  }

  if (newPuzzles.length > 0) {
    const known = new Set(next.map((p) => p.sessionPuzzleId))
    const added = newPuzzles.filter((p) => !known.has(p.sessionPuzzleId))
    if (added.length > 0) {
      next = [...next, ...added].sort((a, b) => a.orderIndex - b.orderIndex)
    }
  }

  return next
}
