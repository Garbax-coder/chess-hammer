import { supabase } from '@/lib/supabase'

async function sessionPuzzleIds(sessionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('session_puzzles')
    .select('id')
    .eq('session_id', sessionId)
  if (error) throw error
  return data.map((p) => p.id)
}

/** Elimina i tentativi di oggi per il giro corrente, per riaprire la quota giornaliera. */
export async function resetTodayQuota(sessionId: string, round: 1 | 2 | 3) {
  const ids = await sessionPuzzleIds(sessionId)
  if (ids.length === 0) return

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const { error } = await supabase
    .from('puzzle_attempts')
    .delete()
    .eq('round_number', round)
    .in('session_puzzle_id', ids)
    .gte('attempted_at', startOfToday.toISOString())
  if (error) throw error
}

/** Azzera completamente la sessione attiva (pool, tentativi, giro, ELO) per ripartire da zero. */
export async function resetSession(sessionId: string, userId: string) {
  const ids = await sessionPuzzleIds(sessionId)

  if (ids.length > 0) {
    const { error: attemptsError } = await supabase
      .from('puzzle_attempts')
      .delete()
      .in('session_puzzle_id', ids)
    if (attemptsError) throw attemptsError
  }

  const { error: puzzlesError } = await supabase
    .from('session_puzzles')
    .delete()
    .eq('session_id', sessionId)
  if (puzzlesError) throw puzzlesError

  const { error: sessionError } = await supabase
    .from('training_sessions')
    .update({ current_round: 1 })
    .eq('id', sessionId)
  if (sessionError) throw sessionError

  const { error: statsError } = await supabase
    .from('user_stats')
    .update({
      current_elo: 1500,
      puzzles_solved: 0,
      puzzles_failed: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (statsError) throw statsError
}
