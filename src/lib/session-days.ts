import type { PuzzleAttempt, SessionPuzzleResult } from '@/types/training'

const ROUNDS = [1, 2, 3] as const
export type Round = (typeof ROUNDS)[number]

/** Chiave del giorno LOCALE (YYYY-MM-DD, non UTC) di un timestamp o una Date:
 *  i tentativi si raggruppano per il giorno di calendario dell'utente. */
export function dayKeyOf(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Inverso di dayKeyOf: una Date a mezzanotte locale di quel giorno. `new
 *  Date("YYYY-MM-DD")` la interpreterebbe come UTC, spostando il giorno in
 *  fusi orari negativi. */
export function dayKeyToLocalDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return dayKeyOf(new Date())
}

export interface DayGroup {
  day: string
  startIndex: number
  endIndex: number
}

/** Raggruppa gli indici CONSECUTIVI (nell'ordine di puzzles, cioe' per
 *  order_index) i cui tentativi in un giro cadono nello stesso giorno. Un
 *  puzzle non ancora tentato in quel giro interrompe il gruppo corrente:
 *  non fa parte di nessun giorno. */
export function dayGroupsForRound(
  puzzles: SessionPuzzleResult[],
  round: Round,
): DayGroup[] {
  const groups: DayGroup[] = []
  let current: DayGroup | null = null
  puzzles.forEach((p, i) => {
    const attempt = p.attempts[round]
    if (!attempt) {
      current = null
      return
    }
    const day = dayKeyOf(attempt.attempted_at)
    if (current && current.day === day) {
      current.endIndex = i
    } else {
      current = { day, startIndex: i, endIndex: i }
      groups.push(current)
    }
  })
  return groups
}

/** L'ultimo giorno di calendario in cui e' stato registrato un tentativo
 *  ufficiale su questi puzzle, in qualunque giro. Null se nessun tentativo. */
export function lastAttemptDay(puzzles: SessionPuzzleResult[]): string | null {
  let latest: string | null = null
  for (const p of puzzles) {
    for (const round of ROUNDS) {
      const attempt = p.attempts[round]
      if (!attempt) continue
      const day = dayKeyOf(attempt.attempted_at)
      if (!latest || day > latest) latest = day
    }
  }
  return latest
}

/** Gli id dei session_puzzle con almeno un tentativo (in qualunque giro) in quel giorno. */
export function puzzleIdsForDay(puzzles: SessionPuzzleResult[], day: string): Set<string> {
  const ids = new Set<string>()
  for (const p of puzzles) {
    for (const round of ROUNDS) {
      const attempt = p.attempts[round]
      if (attempt && dayKeyOf(attempt.attempted_at) === day) {
        ids.add(p.sessionPuzzleId)
        break
      }
    }
  }
  return ids
}

export interface DayEntry {
  puzzle: SessionPuzzleResult
  round: Round
  attempt: PuzzleAttempt
}

/** Tutti i tentativi (in qualunque giro) fatti in quel giorno, in ordine cronologico. */
export function entriesForDay(puzzles: SessionPuzzleResult[], day: string): DayEntry[] {
  const entries: DayEntry[] = []
  for (const puzzle of puzzles) {
    for (const round of ROUNDS) {
      const attempt = puzzle.attempts[round]
      if (attempt && dayKeyOf(attempt.attempted_at) === day) {
        entries.push({ puzzle, round, attempt })
      }
    }
  }
  entries.sort((a, b) => a.attempt.attempted_at.localeCompare(b.attempt.attempted_at))
  return entries
}
