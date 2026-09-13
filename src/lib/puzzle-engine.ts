import { supabase } from '@/lib/supabase'
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

export function startOfTodayIso(): string {
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

interface RoundAttemptRow {
  session_puzzle_id: string
  attempted_at: string
}

// Un'unica query invece di due (attempted-ids + count-oggi): entrambe le
// informazioni si ricavano dagli stessi tentativi del giro, non serve un
// secondo round trip di rete verso Supabase solo per il conteggio.
export async function fetchRoundAttempts(
  sessionPuzzleIds: string[],
  round: 1 | 2 | 3,
): Promise<RoundAttemptRow[]> {
  if (sessionPuzzleIds.length === 0) return []
  const { data, error } = await supabase
    .from('puzzle_attempts')
    .select('session_puzzle_id, attempted_at')
    .eq('round_number', round)
    .in('session_puzzle_id', sessionPuzzleIds)
  if (error) throw error
  return data
}

export function attemptedIdsFrom(rows: RoundAttemptRow[]): Set<string> {
  return new Set(rows.map((r) => r.session_puzzle_id))
}

export function countAttemptedToday(rows: RoundAttemptRow[]): number {
  const startOfToday = startOfTodayIso()
  return rows.filter((r) => r.attempted_at >= startOfToday).length
}

export async function fetchPuzzleById(puzzleId: string): Promise<LichessPuzzle> {
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
  puzzleThemes: string[] | null,
): Promise<{ sessionPuzzle: SessionPuzzleRow; puzzle: LichessPuzzle }> {
  const windows = [100, 250, 500, 1000, 3000]
  let candidate: LichessPuzzle | null = null

  for (const window of windows) {
    const { data, error } = await supabase.rpc('pick_next_round1_puzzle', {
      p_session_id: sessionId,
      p_target_rating: targetRating,
      p_window: window,
      p_themes: puzzleThemes,
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
  // Il candidato dell'RPC e' gia' il puzzle completo: evita un'altra query
  // (fetchPuzzleById) solo per ririleggere dati che abbiamo gia' in mano.
  return { sessionPuzzle: data, puzzle: candidate }
}

async function advanceRound(
  sessionId: string,
  nextRound: 1 | 2 | 3,
  restingUntil: string | null,
) {
  const { error } = await supabase
    .from('training_sessions')
    .update({ current_round: nextRound, resting_until: restingUntil })
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
  | { status: 'resting'; round: 1 | 2 | 3; restingUntil: string }
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
  let restingUntil = session.resting_until
  const pool = await fetchSessionPuzzles(session.id)
  let roundAttempts = await fetchRoundAttempts(
    pool.map((p) => p.id),
    round,
  )
  let attempted = attemptedIdsFrom(roundAttempts)

  const roundTargetSize = session.total_puzzles
  const roundIsComplete =
    round === 1 ? attempted.size >= roundTargetSize : attempted.size >= pool.length

  if (roundIsComplete) {
    if (round === 3) {
      await completeSession(session.id)
      return { status: 'session_complete' }
    }
    const nextRound = (round + 1) as 2 | 3
    restingUntil =
      session.rest_days > 0
        ? new Date(Date.now() + session.rest_days * 24 * 60 * 60 * 1000).toISOString()
        : null
    await advanceRound(session.id, nextRound, restingUntil)
    round = nextRound
    roundAttempts = await fetchRoundAttempts(
      pool.map((p) => p.id),
      round,
    )
    attempted = attemptedIdsFrom(roundAttempts)
  }

  // Pausa tra i giri (metodo Woodpecker): finche' non e' scaduta non si
  // procede ne' con la quota giornaliera ne' con un nuovo puzzle.
  if (restingUntil && new Date(restingUntil) > new Date()) {
    return { status: 'resting', round, restingUntil }
  }

  const dailyTarget = dailyTargetForRound(session, round)
  if (countAttemptedToday(roundAttempts) >= dailyTarget) {
    return { status: 'quota_reached', round }
  }

  if (round === 1) {
    const pending = pool.find((p) => !attempted.has(p.id))
    if (pending) {
      const puzzle = await fetchPuzzleById(pending.puzzle_id)
      return { status: 'next', data: { sessionPuzzleId: pending.id, puzzle, round } }
    }
    const { sessionPuzzle, puzzle } = await pickAndInsertNewRound1Puzzle(
      session.id,
      pool.length + 1,
      userElo,
      session.puzzle_themes,
    )
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

// Un'unica chiamata RPC per l'intera azione "concludi il puzzle e passa al
// prossimo": registra il tentativo E decide il prossimo puzzle nella stessa
// transazione Postgres lato server (stessa logica di recordAttempt +
// getNextPuzzle sopra, vedi supabase/migrations/0010_*.sql), invece di una
// RPC di scrittura seguita da 3-5 letture sequenziali dal client.
export async function recordAttemptAndGetNextPuzzle(params: {
  sessionId: string
  sessionPuzzleId: string
  round: 1 | 2 | 3
  result: AttemptResult
  timeSeconds: number
  puzzleRating: number
}): Promise<NextPuzzleOutcome> {
  const { sessionId, sessionPuzzleId, round, result, timeSeconds, puzzleRating } = params
  const { data, error } = await supabase.rpc('record_attempt_and_get_next_puzzle', {
    p_session_id: sessionId,
    p_session_puzzle_id: sessionPuzzleId,
    p_round: round,
    p_result: result,
    p_time_seconds: timeSeconds,
    p_puzzle_rating: puzzleRating,
  })
  if (error) throw error
  return data as NextPuzzleOutcome
}
