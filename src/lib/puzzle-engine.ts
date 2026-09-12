import { supabase } from '@/lib/supabase'
import { updateElo } from '@/lib/elo'
import type {
  AttemptResult,
  LichessPuzzle,
  NextPuzzle,
  TrainingSession,
} from '@/types/training'

export function dailyTargetForRound(session: TrainingSession, round: 1 | 2 | 3): number {
  if (round === 1) return session.daily_target_round1
  if (round === 2) return session.daily_target_round2
  return session.daily_target_round3
}

function startOfTodayIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function getUserElo(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('current_elo')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data.current_elo
}

export interface SessionPuzzleRow {
  id: string
  puzzle_id: string
  order_index: number
}

export async function fetchSessionPuzzles(
  sessionId: string,
): Promise<SessionPuzzleRow[]> {
  const { data, error } = await supabase
    .from('session_puzzles')
    .select('id, puzzle_id, order_index')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchAttemptedSessionPuzzleIds(
  sessionPuzzleIds: string[],
  round: 1 | 2 | 3,
): Promise<Set<string>> {
  if (sessionPuzzleIds.length === 0) return new Set()
  const { data, error } = await supabase
    .from('puzzle_attempts')
    .select('session_puzzle_id')
    .eq('round_number', round)
    .in('session_puzzle_id', sessionPuzzleIds)
  if (error) throw error
  return new Set(data.map((r) => r.session_puzzle_id))
}

export async function countAttemptsToday(
  sessionPuzzleIds: string[],
  round: 1 | 2 | 3,
): Promise<number> {
  if (sessionPuzzleIds.length === 0) return 0
  const { count, error } = await supabase
    .from('puzzle_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('round_number', round)
    .in('session_puzzle_id', sessionPuzzleIds)
    .gte('attempted_at', startOfTodayIso())
  if (error) throw error
  return count ?? 0
}

async function fetchPuzzleById(puzzleId: string): Promise<LichessPuzzle> {
  const { data, error } = await supabase
    .from('lichess_puzzles')
    .select('*')
    .eq('puzzle_id', puzzleId)
    .single()
  if (error) throw error
  return data
}

async function pickAndInsertNewRound1Puzzle(
  sessionId: string,
  orderIndex: number,
  targetRating: number,
): Promise<SessionPuzzleRow> {
  const windows = [100, 250, 500, 1000, 3000]
  let candidate: LichessPuzzle | null = null

  for (const window of windows) {
    const { data, error } = await supabase.rpc('pick_next_round1_puzzle', {
      p_session_id: sessionId,
      p_target_rating: targetRating,
      p_window: window,
    })
    if (error) throw error
    if (data && data.length > 0) {
      candidate = data[0]
      break
    }
  }

  if (!candidate) {
    throw new Error('Nessun puzzle disponibile per questo rating: pool esaurito.')
  }

  const { data, error } = await supabase
    .from('session_puzzles')
    .insert({
      session_id: sessionId,
      puzzle_id: candidate.puzzle_id,
      order_index: orderIndex,
    })
    .select('id, puzzle_id, order_index')
    .single()
  if (error) throw error
  return data
}

async function advanceRound(sessionId: string, nextRound: 1 | 2 | 3) {
  const { error } = await supabase
    .from('training_sessions')
    .update({ current_round: nextRound })
    .eq('id', sessionId)
  if (error) throw error
}

async function completeSession(sessionId: string) {
  const { error } = await supabase
    .from('training_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}

export type NextPuzzleOutcome =
  | { status: 'next'; data: NextPuzzle }
  | { status: 'quota_reached'; round: 1 | 2 | 3 }
  | { status: 'session_complete' }

/**
 * Determina il prossimo puzzle da presentare per una sessione:
 * - giro 1: costruisce il pool scegliendo un puzzle alla volta in base all'ELO corrente;
 * - giro 2/3: ripercorre lo stesso pool, nello stesso ordine, senza nuova selezione;
 * - avanza automaticamente di giro quando il pool corrente e' esaurito;
 * - rispetta la quota giornaliera del giro corrente.
 */
export async function getNextPuzzle(
  session: TrainingSession,
  userElo: number,
): Promise<NextPuzzleOutcome> {
  let round = session.current_round
  let pool = await fetchSessionPuzzles(session.id)
  let attempted = await fetchAttemptedSessionPuzzleIds(
    pool.map((p) => p.id),
    round,
  )

  const roundTargetSize = session.total_puzzles
  const roundIsComplete =
    round === 1 ? attempted.size >= roundTargetSize : attempted.size >= pool.length

  if (roundIsComplete) {
    if (round === 3) {
      await completeSession(session.id)
      return { status: 'session_complete' }
    }
    const nextRound = (round + 1) as 2 | 3
    await advanceRound(session.id, nextRound)
    round = nextRound
    attempted = await fetchAttemptedSessionPuzzleIds(
      pool.map((p) => p.id),
      round,
    )
  }

  const dailyTarget = dailyTargetForRound(session, round)
  const attemptedToday = await countAttemptsToday(
    pool.map((p) => p.id),
    round,
  )
  if (attemptedToday >= dailyTarget) {
    return { status: 'quota_reached', round }
  }

  if (round === 1) {
    const pending = pool.find((p) => !attempted.has(p.id))
    const sessionPuzzle =
      pending ??
      (await pickAndInsertNewRound1Puzzle(session.id, pool.length + 1, userElo))
    const puzzle = await fetchPuzzleById(sessionPuzzle.puzzle_id)
    return { status: 'next', data: { sessionPuzzleId: sessionPuzzle.id, puzzle, round } }
  }

  const nextInPool = pool.find((p) => !attempted.has(p.id))
  if (!nextInPool) {
    // Difesa in profondita': non dovrebbe accadere dato il check roundIsComplete sopra.
    return { status: 'session_complete' }
  }
  const puzzle = await fetchPuzzleById(nextInPool.puzzle_id)
  return { status: 'next', data: { sessionPuzzleId: nextInPool.id, puzzle, round } }
}

export async function recordAttempt(params: {
  userId: string
  sessionPuzzleId: string
  round: 1 | 2 | 3
  result: AttemptResult
  timeSeconds: number
  puzzleRating: number
}) {
  const { userId, sessionPuzzleId, round, result, timeSeconds, puzzleRating } = params
  const eloBefore = await getUserElo(userId)
  const eloAfter = updateElo(eloBefore, puzzleRating, result === 'solved')

  const { data: attempt, error: attemptError } = await supabase
    .from('puzzle_attempts')
    .insert({
      session_puzzle_id: sessionPuzzleId,
      round_number: round,
      result,
      time_seconds: timeSeconds,
      elo_before: eloBefore,
      elo_after: eloAfter,
    })
    .select('*')
    .single()
  if (attemptError) throw attemptError

  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('puzzles_solved, puzzles_failed')
    .eq('user_id', userId)
    .single()
  if (statsError) throw statsError

  const { error: updateError } = await supabase
    .from('user_stats')
    .update({
      current_elo: eloAfter,
      puzzles_solved: stats.puzzles_solved + (result === 'solved' ? 1 : 0),
      puzzles_failed: stats.puzzles_failed + (result === 'failed' ? 1 : 0),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (updateError) throw updateError

  return attempt
}
