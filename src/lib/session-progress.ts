import {
  attemptedIdsFrom,
  countAttemptedToday,
  dailyTargetForRound,
  fetchRoundAttempts,
  fetchSessionPuzzles,
} from '@/lib/puzzle-engine'
import type { SessionProgress, TrainingSession } from '@/types/training'

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
