import { supabase } from '@/lib/supabase'
import type { AttemptResult, PracticeAttempt } from '@/types/training'

export async function recordPracticeAttempt(params: {
  userId: string
  puzzleId: string
  result: AttemptResult
  timeSeconds: number
}): Promise<PracticeAttempt> {
  // Restituisce la riga inserita (id e attempted_at li assegna il DB): serve
  // a chi aggiorna la cache dei tentativi senza rileggerli tutti.
  const { data, error } = await supabase
    .from('practice_attempts')
    .insert({
      user_id: params.userId,
      puzzle_id: params.puzzleId,
      result: params.result,
      time_seconds: params.timeSeconds,
    })
    .select()
    .single()
  if (error) throw error
  return data as PracticeAttempt
}

/** Tutti i tentativi di pratica libera per un insieme di puzzle, raggruppati per puzzle_id. */
export async function fetchPracticeAttempts(
  userId: string,
  puzzleIds: string[],
): Promise<Map<string, PracticeAttempt[]>> {
  if (puzzleIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('practice_attempts')
    .select('*')
    .eq('user_id', userId)
    .in('puzzle_id', puzzleIds)
    .order('attempted_at', { ascending: true })
  if (error) throw error

  const attemptsByPuzzle = new Map<string, PracticeAttempt[]>()
  for (const row of data) {
    const existing = attemptsByPuzzle.get(row.puzzle_id)
    if (existing) {
      existing.push(row)
    } else {
      attemptsByPuzzle.set(row.puzzle_id, [row])
    }
  }
  return attemptsByPuzzle
}
