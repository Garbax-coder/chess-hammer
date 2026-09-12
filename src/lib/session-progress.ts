import {
  countAttemptsToday,
  dailyTargetForRound,
  fetchAttemptedSessionPuzzleIds,
  fetchSessionPuzzles,
} from '@/lib/puzzle-engine'
import type { SessionProgress, TrainingSession } from '@/types/training'

export async function getSessionProgress(
  session: TrainingSession,
): Promise<SessionProgress> {
  const round = session.current_round
  const pool = await fetchSessionPuzzles(session.id)
  const attempted = await fetchAttemptedSessionPuzzleIds(
    pool.map((p) => p.id),
    round,
  )
  const attemptedToday = await countAttemptsToday(
    pool.map((p) => p.id),
    round,
  )

  return {
    round,
    poolSize: pool.length,
    roundTargetSize: session.total_puzzles,
    attemptedThisRound: attempted.size,
    dailyTarget: dailyTargetForRound(session, round),
    attemptedToday,
  }
}
