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
  order_index: number
  puzzle_id: string
  lichess_puzzles: { rating: number } | null
  puzzle_attempts: PuzzleAttempt[]
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const { data: session, error: sessionError } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (sessionError) throw sessionError

  const { data: rows, error: puzzlesError } = await supabase
    .from('session_puzzles')
    .select('order_index, puzzle_id, lichess_puzzles(rating), puzzle_attempts(*)')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })
  if (puzzlesError) throw puzzlesError

  const puzzles: SessionPuzzleResult[] = (rows as unknown as RawSessionPuzzleRow[]).map(
    (row) => {
      const attempts: SessionPuzzleResult['attempts'] = {}
      for (const attempt of row.puzzle_attempts) {
        attempts[attempt.round_number] = attempt
      }
      return {
        orderIndex: row.order_index,
        puzzleId: row.puzzle_id,
        rating: row.lichess_puzzles?.rating ?? 0,
        attempts,
      }
    },
  )

  return { session, puzzles }
}
