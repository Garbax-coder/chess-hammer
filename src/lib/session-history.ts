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
  lichess_puzzles: { rating: number; fen: string } | null
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

// Separata da fetchSessionDetail cosi' un chiamante che ha gia' l'oggetto
// sessione (es. TrainPage, via useActiveSession) puo' chiedere solo i
// puzzle senza rileggere anche la riga training_sessions che ha gia' in
// mano (un round trip di rete in meno ad ogni tentativo registrato).
export async function fetchSessionPuzzlesDetail(
  sessionId: string,
): Promise<SessionPuzzleResult[]> {
  const { data: rows, error } = await supabase
    .from('session_puzzles')
    .select('id, order_index, puzzle_id, lichess_puzzles(rating, fen), puzzle_attempts(*)')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })
  if (error) throw error

  return (rows as unknown as RawSessionPuzzleRow[]).map((row) => {
    const attempts: SessionPuzzleResult['attempts'] = {}
    for (const attempt of row.puzzle_attempts) {
      attempts[attempt.round_number] = attempt
    }
    return {
      sessionPuzzleId: row.id,
      orderIndex: row.order_index,
      puzzleId: row.puzzle_id,
      rating: row.lichess_puzzles?.rating ?? 0,
      fen: row.lichess_puzzles?.fen ?? '',
      attempts,
    }
  })
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  // Indipendenti l'una dall'altra: in parallelo invece che in sequenza.
  const [session, puzzles] = await Promise.all([
    fetchSessionById(sessionId),
    fetchSessionPuzzlesDetail(sessionId),
  ])
  return { session, puzzles }
}
