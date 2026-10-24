import {
  attemptedIdsFrom,
  countAttemptedToday,
  dailyTargetForRound,
  fetchRoundAttempts,
  fetchSessionPuzzles,
  startOfTodayIso,
} from '@/lib/puzzle-engine'
import type {
  BoardPuzzle,
  PracticeAttempt,
  SessionProgress,
  SessionPuzzleResult,
  TrainingSession,
} from '@/types/training'

export async function getSessionProgress(
  session: TrainingSession,
): Promise<SessionProgress> {
  const round = session.current_round
  const pool = await fetchSessionPuzzles(session.id)
  const roundAttempts = await fetchRoundAttempts(
    pool.map((p) => p.id),
    round,
  )

  return {
    round,
    poolSize: pool.length,
    roundTargetSize: session.total_puzzles,
    attemptedThisRound: attemptedIdsFrom(roundAttempts).size,
    dailyTarget: dailyTargetForRound(session, round),
    attemptedToday: countAttemptedToday(roundAttempts),
  }
}

// Stessa forma di getSessionProgress, ma calcolata SENZA rete: chi ha gia'
// in mano session + l'elenco puzzle-con-tentativi (es. TrainPage, via
// useSessionPuzzles) non deve interrogare di nuovo session_puzzles e
// puzzle_attempts solo per i numeri della barra di avanzamento — sono gli
// stessi dati che alimentano gia' la lista puzzle in sidebar.
export function deriveSessionProgress(
  session: TrainingSession,
  puzzles: SessionPuzzleResult[],
): SessionProgress {
  const round = session.current_round
  const startOfToday = startOfTodayIso()
  const roundAttempts = puzzles
    .map((p) => p.attempts[round])
    .filter((a) => a !== undefined)

  return {
    round,
    poolSize: puzzles.length,
    roundTargetSize: session.total_puzzles,
    attemptedThisRound: roundAttempts.length,
    dailyTarget: dailyTargetForRound(session, round),
    attemptedToday: roundAttempts.filter((a) => a.attempted_at >= startOfToday).length,
  }
}

export type FailedPuzzleScope = 'all' | 'lastRound'

// Per la modalita' pratica "solo puzzle falliti": 'all' guarda tutti i
// tentativi ufficiali del puzzle (in qualunque giro), 'lastRound' solo
// l'ultimo giro effettivamente tentato (il piu' alto tra 1/2/3 con un
// tentativo registrato) — gli attempts qui sono sempre quelli ufficiali
// (puzzle_attempts), la pratica libera non li tocca mai, quindi l'insieme
// non cambia mentre ci si esercita.
export function isFailedPuzzle(
  puzzle: SessionPuzzleResult,
  scope: FailedPuzzleScope,
): boolean {
  if (scope === 'all') {
    return Object.values(puzzle.attempts).some((a) => a?.result === 'failed')
  }
  const lastRound = ([3, 2, 1] as const).find((r) => puzzle.attempts[r])
  return lastRound !== undefined && puzzle.attempts[lastRound]?.result === 'failed'
}

export interface PracticeFilter {
  onlyFailed: boolean
  scope: FailedPuzzleScope
  /** Puzzle salvati tra i "problematici" (vedi saved_puzzles). */
  onlySaved?: boolean
  savedPuzzleIds?: ReadonlySet<string>
}

// Con "sbagliati" e "problematici" entrambi attivi la pratica comprende gli
// uni e gli altri; con nessuno dei due, tutti i puzzle della sessione.
export function practicePool(
  puzzles: SessionPuzzleResult[],
  filter: PracticeFilter,
): SessionPuzzleResult[] {
  const onlySaved = filter.onlySaved ?? false
  if (!filter.onlyFailed && !onlySaved) return puzzles
  return puzzles.filter(
    (p) =>
      (filter.onlyFailed && isFailedPuzzle(p, filter.scope)) ||
      (onlySaved && (filter.savedPuzzleIds?.has(p.puzzleId) ?? false)),
  )
}

// Da dove riprende "Continua in pratica libera": il primo puzzle ammesso dal
// filtro dopo l'ultimo concluso in pratica in questa sessione (per
// order_index), e da capo dopo l'ultimo. I tentativi registrano la sessione
// in cui sono stati fatti (migrazione 0033): contano quelli di questa
// sessione. Quelli piu' vecchi, senza sessione, contano se fatti dopo la sua
// creazione: lo stesso puzzle pescato in una sessione passata non sposta il
// punto di ripresa.
export function practiceResumePuzzle(
  puzzles: SessionPuzzleResult[],
  practiceAttemptsByPuzzle: Map<string, PracticeAttempt[]>,
  filter: PracticeFilter,
  sessionCreatedAt: string,
  sessionId?: string,
): SessionPuzzleResult | undefined {
  const since = Date.parse(sessionCreatedAt)
  const belongsToSession = (attempt: PracticeAttempt) =>
    attempt.session_id && sessionId
      ? attempt.session_id === sessionId
      : Date.parse(attempt.attempted_at) >= since
  let last: { puzzle: SessionPuzzleResult; at: number } | undefined
  for (const puzzle of puzzles) {
    for (const attempt of practiceAttemptsByPuzzle.get(puzzle.puzzleId) ?? []) {
      const at = Date.parse(attempt.attempted_at)
      if (belongsToSession(attempt) && (!last || at > last.at)) last = { puzzle, at }
    }
  }

  const pool = practicePool(puzzles, filter)
  if (!last) return pool[0]
  const lastOrderIndex = last.puzzle.orderIndex
  return pool.find((p) => p.orderIndex > lastOrderIndex) ?? pool[0]
}

// Il puzzle da mostrare in pratica libera, dalla lista gia' in mano: nessuna
// richiesta al passaggio da un puzzle all'altro.
export function boardPuzzleFrom(result: SessionPuzzleResult): BoardPuzzle {
  return {
    puzzle_id: result.puzzleId,
    fen: result.fen,
    moves: result.moves,
    rating: result.rating,
    themes: result.themes,
  }
}
