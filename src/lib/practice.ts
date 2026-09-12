import { supabase } from '@/lib/supabase'
import type { AttemptResult, PracticeStat } from '@/types/training'

export async function recordPracticeAttempt(params: {
  userId: string
  puzzleId: string
  result: AttemptResult
  timeSeconds: number
}) {
  const { error } = await supabase.from('practice_attempts').insert({
    user_id: params.userId,
    puzzle_id: params.puzzleId,
    result: params.result,
    time_seconds: params.timeSeconds,
  })
  if (error) throw error
}

/** Statistiche di pratica libera per un insieme di puzzle, aggregate lato client. */
export async function fetchPracticeStats(
  userId: string,
  puzzleIds: string[],
): Promise<Map<string, PracticeStat>> {
  if (puzzleIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('practice_attempts')
    .select('puzzle_id, result, time_seconds, attempted_at')
    .eq('user_id', userId)
    .in('puzzle_id', puzzleIds)
    .order('attempted_at', { ascending: true })
  if (error) throw error

  const stats = new Map<string, PracticeStat>()
  for (const row of data) {
    const existing = stats.get(row.puzzle_id)
    const bestTimeSeconds = existing?.bestTimeSeconds
      ? Math.min(existing.bestTimeSeconds, row.time_seconds)
      : row.time_seconds
    stats.set(row.puzzle_id, {
      count: (existing?.count ?? 0) + 1,
      bestTimeSeconds,
      // le righe sono in ordine crescente di data: l'ultima iterata e' la piu' recente
      lastResult: row.result,
    })
  }
  return stats
}
