import { attemptsByRound } from '@/lib/session-puzzles-merge'
import { supabase } from '@/lib/supabase'
import type {
  PuzzleAttempt,
  SessionDetail,
  SessionPuzzleResult,
  TrainingSession,
} from '@/types/training'

export async function fetchAllSessions(userId: string): Promise<TrainingSession[]> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

interface RawSessionPuzzleRow {
  id: string
  order_index: number
  puzzle_id: string
  lichess_puzzles: {
    rating: number
    fen: string
    moves: string[]
    themes: string[]
  } | null
  puzzle_attempts: PuzzleAttempt[]
}

async function fetchSessionById(sessionId: string): Promise<TrainingSession> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (error) throw error
  return data
}

const SESSION_PUZZLE_SELECT =
  'id, order_index, puzzle_id, lichess_puzzles(rating, fen, moves, themes), puzzle_attempts(*)'

function toSessionPuzzleResult(row: RawSessionPuzzleRow): SessionPuzzleResult {
  return {
    sessionPuzzleId: row.id,
    orderIndex: row.order_index,
    puzzleId: row.puzzle_id,
    rating: row.lichess_puzzles?.rating ?? 0,
    fen: row.lichess_puzzles?.fen ?? '',
    moves: row.lichess_puzzles?.moves ?? [],
    themes: row.lichess_puzzles?.themes ?? [],
    attempts: attemptsByRound(row.puzzle_attempts),
  }
}

// Separata da fetchSessionDetail cosi' un chiamante che ha gia' l'oggetto
// sessione (es. TrainPage, via useActiveSession) puo' chiedere solo i
// puzzle senza rileggere anche la riga training_sessions che ha gia' in
// mano (un round trip di rete in meno ad ogni tentativo registrato).
export async function fetchSessionPuzzlesDetail(
  sessionId: string,
): Promise<SessionPuzzleResult[]> {
  const { data: rows, error } = await supabase
    .from('session_puzzles')
    .select(SESSION_PUZZLE_SELECT)
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })
  if (error) throw error

  return (rows as unknown as RawSessionPuzzleRow[]).map(toSessionPuzzleResult)
}

// Solo i puzzle aggiunti al pool dopo quelli gia' in cache (giro 1: uno per
// tentativo). Vedi syncSessionPuzzles: serve ad aggiornare la lista senza
// riscaricarla tutta (fen/mosse/temi di 200 puzzle, ~200 KB).
export async function fetchSessionPuzzlesAfter(
  sessionId: string,
  afterOrderIndex: number,
): Promise<SessionPuzzleResult[]> {
  const { data: rows, error } = await supabase
    .from('session_puzzles')
    .select(SESSION_PUZZLE_SELECT)
    .eq('session_id', sessionId)
    .gt('order_index', afterOrderIndex)
    .order('order_index', { ascending: true })
  if (error) throw error

  return (rows as unknown as RawSessionPuzzleRow[]).map(toSessionPuzzleResult)
}

// Tutti i tentativi (al massimo uno per giro) di un solo puzzle di sessione.
export async function fetchSessionPuzzleAttempts(
  sessionPuzzleId: string,
): Promise<PuzzleAttempt[]> {
  const { data, error } = await supabase
    .from('puzzle_attempts')
    .select('*')
    .eq('session_puzzle_id', sessionPuzzleId)
  if (error) throw error
  return data as PuzzleAttempt[]
}

// Tentativi della sessione registrati da `since` in poi (incluso: quelli con
// lo stesso istante si riapplicano senza effetti), o tutti se since e' null.
export async function fetchSessionAttemptsSince(
  sessionId: string,
  since: string | null,
): Promise<PuzzleAttempt[]> {
  let query = supabase
    .from('puzzle_attempts')
    .select('*, session_puzzles!inner(session_id)')
    .eq('session_puzzles.session_id', sessionId)
  if (since) query = query.gte('attempted_at', since)
  const { data, error } = await query
  if (error) throw error
  return (data as (PuzzleAttempt & { session_puzzles: unknown })[]).map(
    ({ session_puzzles: _join, ...attempt }) => attempt,
  )
}

// Solo i conteggi (richieste HEAD, nessun contenuto scaricato): servono a
// verificare che una lista ricostruita a pezzi coincida con il database.
export async function countSessionRows(
  sessionId: string,
): Promise<{ puzzles: number; attempts: number }> {
  const [puzzles, attempts] = await Promise.all([
    supabase
      .from('session_puzzles')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId),
    supabase
      .from('puzzle_attempts')
      .select('id, session_puzzles!inner(session_id)', { count: 'exact', head: true })
      .eq('session_puzzles.session_id', sessionId),
  ])
  if (puzzles.error) throw puzzles.error
  if (attempts.error) throw attempts.error
  return { puzzles: puzzles.count ?? 0, attempts: attempts.count ?? 0 }
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  // Indipendenti l'una dall'altra: in parallelo invece che in sequenza.
  const [session, puzzles] = await Promise.all([
    fetchSessionById(sessionId),
    fetchSessionPuzzlesDetail(sessionId),
  ])
  return { session, puzzles }
}
