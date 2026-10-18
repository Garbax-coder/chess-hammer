import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AttemptResult, SessionStatus } from '@/types/training'

// Dashboard di amministrazione: le funzioni admin_* (migrazione 0029) leggono
// i dati di tutti gli utenti e rispondono solo agli amministratori
// (app_metadata.admin in auth.users). Qui il controllo serve solo a mostrare
// o nascondere la sezione: chi forzasse la pagina riceverebbe un errore dal
// database.
export function isAdminUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.admin === true
}

export const ADMIN_METRICS = [
  'signups',
  'session_attempts',
  'practice_attempts',
  'rounds_completed',
  'sessions_completed',
] as const
export type AdminMetric = (typeof ADMIN_METRICS)[number]

export type AdminBucket = { start: string } & Record<AdminMetric, number>

export interface AdminStats {
  generated_at: string
  total_signups: number
  /** Ultime 24 ore, un intervallo per ora (l'ultimo e' l'ora in corso). */
  hourly: AdminBucket[]
  /** Ultimi 30 giorni, un intervallo per giorno (l'ultimo e' oggi). */
  daily: AdminBucket[]
}

export type AdminPeriod = 'day' | 'week' | 'month'
export const ADMIN_PERIODS: AdminPeriod[] = ['day', 'week', 'month']

/** Gli intervalli del grafico per il periodo scelto: 24 ore, 7 o 30 giorni. */
export function bucketsFor(stats: AdminStats, period: AdminPeriod): AdminBucket[] {
  if (period === 'day') return stats.hourly
  if (period === 'week') return stats.daily.slice(-7)
  return stats.daily
}

/** Totale di una metrica nel periodo: la somma delle barre del suo grafico. */
export function periodTotal(
  stats: AdminStats,
  metric: AdminMetric,
  period: AdminPeriod,
): number {
  return bucketsFor(stats, period).reduce((sum, b) => sum + b[metric], 0)
}

export async function fetchAdminStats(timeZone: string): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_stats', { p_tz: timeZone })
  if (error) throw error
  return data as AdminStats
}

export interface AdminUserRow {
  id: string
  email: string
  providers: string[]
  created_at: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  last_activity_at: string | null
  is_admin: boolean
  language: string | null
  current_elo: number | null
  sessions_count: number
  active_session_round: number | null
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw error
  return data as AdminUserRow[]
}

export type AdminUserSort = 'created' | 'last_sign_in'

/** Filtra per email (senza distinzione di maiuscole) e ordina dal piu' recente. */
export function filterAndSortUsers(
  users: AdminUserRow[],
  query: string,
  sort: AdminUserSort,
): AdminUserRow[] {
  const q = query.trim().toLowerCase()
  const time = (u: AdminUserRow) =>
    sort === 'created'
      ? Date.parse(u.created_at)
      : u.last_sign_in_at
        ? Date.parse(u.last_sign_in_at)
        : -Infinity
  return users
    .filter((u) => !q || u.email.toLowerCase().includes(q))
    .sort((a, b) => time(b) - time(a))
}

export interface AdminSessionRound {
  round: 1 | 2 | 3
  attempted: number
  solved: number
  last_attempt_at: string
}

export interface AdminSession {
  id: string
  name: string | null
  status: SessionStatus
  total_puzzles: number
  current_round: 1 | 2 | 3
  daily_target_round1: number
  daily_target_round2: number
  daily_target_round3: number
  rest_days: number
  resting_until: string | null
  puzzle_themes: string[] | null
  created_at: string
  completed_at: string | null
  pool_size: number
  rounds: AdminSessionRound[]
}

export interface AdminUserDetail {
  account: {
    id: string
    email: string
    providers: string[]
    created_at: string
    email_confirmed_at: string | null
    last_sign_in_at: string | null
    last_activity_at: string | null
    is_admin: boolean
  }
  stats: {
    current_elo: number
    rating_deviation: number
    puzzles_solved: number
    puzzles_failed: number
    auto_advance: boolean
    language: string | null
    board_theme: string
    piece_set: string
    app_style: string
    practice_only_failed: boolean
    practice_failed_scope: string
    legal_version: string | null
    legal_accepted_at: string | null
    updated_at: string
  } | null
  sessions: AdminSession[]
  elo_history: { attempted_at: string; elo_after: number }[]
  practice: {
    attempted: number
    solved: number
    recent: {
      puzzle_id: string
      result: AttemptResult
      time_seconds: number
      attempted_at: string
    }[]
  }
}

export async function fetchAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  const { data, error } = await supabase.rpc('admin_user_detail', { p_user_id: userId })
  if (error) throw error
  return data as AdminUserDetail
}

export interface AdminSessionPuzzle {
  session_puzzle_id: string
  order_index: number
  puzzle_id: string
  rating: number | null
  themes: string[] | null
  attempts: {
    round_number: 1 | 2 | 3
    result: AttemptResult
    time_seconds: number
    elo_before: number
    elo_after: number
    attempted_at: string
  }[]
}

export async function fetchAdminSessionPuzzles(
  sessionId: string,
): Promise<AdminSessionPuzzle[]> {
  const { data, error } = await supabase.rpc('admin_session_puzzles', {
    p_session_id: sessionId,
  })
  if (error) throw error
  return data as AdminSessionPuzzle[]
}
