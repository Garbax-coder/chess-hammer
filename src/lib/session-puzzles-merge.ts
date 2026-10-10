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

function attemptsOf(puzzles: SessionPuzzleResult[]): PuzzleAttempt[] {
  return puzzles.flatMap((p) => Object.values(p.attempts).filter((a) => a !== undefined))
}

export function countAttempts(puzzles: SessionPuzzleResult[]): number {
  return attemptsOf(puzzles).length
}

// attempted_at lo scrive il database (default now()): confrontare i
// timestamp del server tra loro evita gli sfasamenti dell'orologio locale.
export function latestAttemptAt(puzzles: SessionPuzzleResult[]): string | null {
  let latest: string | null = null
  for (const a of attemptsOf(puzzles)) {
    if (latest === null || Date.parse(a.attempted_at) > Date.parse(latest)) {
      latest = a.attempted_at
    }
  }
  return latest
}

// Applica tentativi nuovi o aggiornati ai puzzle gia' in lista, uno per giro
// (vincolo unico session_puzzle_id + round_number): riapplicare gli stessi
// tentativi non cambia nulla. Quelli di puzzle non in lista si ignorano: i
// puzzle nuovi arrivano gia' con i propri tentativi.
export function mergeChangedAttempts(
  current: SessionPuzzleResult[],
  changed: PuzzleAttempt[],
): SessionPuzzleResult[] {
  if (changed.length === 0) return current
  const byPuzzle = new Map<string, PuzzleAttempt[]>()
  for (const a of changed) {
    byPuzzle.set(a.session_puzzle_id, [...(byPuzzle.get(a.session_puzzle_id) ?? []), a])
  }
  return current.map((p) => {
    const updates = byPuzzle.get(p.sessionPuzzleId)
    return updates
      ? { ...p, attempts: { ...p.attempts, ...attemptsByRound(updates) } }
      : p
  })
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
