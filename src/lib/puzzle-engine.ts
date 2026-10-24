import { supabase } from '@/lib/supabase'
import type { AttemptResult, NextPuzzle, TrainingSession } from '@/types/training'

export function dailyTargetForRound(session: TrainingSession, round: 1 | 2 | 3): number {
  if (round === 1) return session.daily_target_round1
  if (round === 2) return session.daily_target_round2
  return session.daily_target_round3
}

/** Fuso orario del browser: la quota e la pausa tra i giri si contano dalla sua mezzanotte. */
export function currentTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function startOfTodayIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
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

export type NextPuzzleOutcome =
  | { status: 'next'; data: NextPuzzle }
  | { status: 'quota_reached'; round: 1 | 2 | 3 }
  | { status: 'resting'; round: 1 | 2 | 3; restingUntil: string }
  | { status: 'session_complete' }

/**
 * Il prossimo puzzle da presentare per una sessione, deciso dal database in
 * una sola chiamata (get_next_puzzle, migrazione 0035):
 * - giro 1: costruisce il pool scegliendo un puzzle alla volta in base all'ELO corrente;
 * - giro 2/3: ripercorre lo stesso pool, nello stesso ordine, senza nuova selezione;
 * - avanza automaticamente di giro quando il pool corrente e' esaurito;
 * - rispetta la pausa tra i giri e la quota giornaliera del giro corrente.
 */
export async function getNextPuzzle(sessionId: string): Promise<NextPuzzleOutcome> {
  const { data, error } = await supabase.rpc('get_next_puzzle', {
    p_session_id: sessionId,
    p_tz: currentTimeZone(),
  })
  if (error) throw error
  return data as NextPuzzleOutcome
}

// Un'unica chiamata RPC per l'intera azione "concludi il puzzle e passa al
// prossimo": registra il tentativo E decide il prossimo puzzle nella stessa
// transazione Postgres lato server (registra il tentativo e poi richiama
// get_next_puzzle, vedi supabase/migrations/0035_*.sql), invece di una RPC
// di scrittura seguita da una seconda chiamata.
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
    p_tz: currentTimeZone(),
  })
  if (error) throw error
  return data as NextPuzzleOutcome
}
