import {
  attemptedIdsFrom,
  countAttemptedToday,
  dailyTargetForRound,
  fetchRoundAttempts,
  fetchSessionPuzzles,
  startOfTodayIso,
} from '@/lib/puzzle-engine'
import type { SessionProgress, SessionPuzzleResult, TrainingSession } from '@/types/training'

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
