import { supabase } from '@/lib/supabase'

export type EloRange = 'week' | 'month' | 'year' | 'all'

export interface EloPoint {
  attempted_at: string
  elo_after: number
}

const RANGE_DAYS: Record<Exclude<EloRange, 'all'>, number> = {
  week: 7,
  month: 30,
  year: 365,
}

export function sinceIsoFor(range: EloRange): string | null {
  if (range === 'all') return null
  const d = new Date()
  d.setDate(d.getDate() - RANGE_DAYS[range])
  return d.toISOString()
}

// RLS su puzzle_attempts filtra gia' alle sole righe dell'utente corrente
// (via session_puzzles -> training_sessions.user_id), come per
// fetchRoundAttempts: nessun filtro esplicito su user_id qui.
export async function fetchEloHistory(range: EloRange): Promise<EloPoint[]> {
  let query = supabase
    .from('puzzle_attempts')
    .select('elo_after, attempted_at')
    .order('attempted_at', { ascending: true })

  const since = sinceIsoFor(range)
  if (since) query = query.gte('attempted_at', since)

  const { data, error } = await query
  if (error) throw error
  return data
}
