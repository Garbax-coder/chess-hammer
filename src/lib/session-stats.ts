import { supabase } from '@/lib/supabase'
import type { SessionStatus, TrainingSession } from '@/types/training'

type SessionRef = Pick<TrainingSession, 'id' | 'created_at'>

// Statistiche per sessione e giro (funzione my_session_round_stats,
// migrazione 0030): riepilogo di fine giro e di fine sessione, e confronto
// con le sessioni precedenti dello stesso utente.

type Round = 1 | 2 | 3

export interface RoundStatsRow {
  session_id: string
  session_name: string | null
  status: SessionStatus
  total_puzzles: number
  created_at: string
  completed_at: string | null
  pool_size: number
  round: Round
  attempted: number
  solved: number
  total_seconds: number
  first_attempt_at: string
  last_attempt_at: string
  elo_start: number
  elo_end: number
}

export async function fetchSessionRoundStats(): Promise<RoundStatsRow[]> {
  const { data, error } = await supabase.rpc('my_session_round_stats')
  if (error) throw error
  return (data as RoundStatsRow[]).map((r) => ({
    ...r,
    total_seconds: Number(r.total_seconds),
  }))
}

export interface PerformanceStats {
  attempted: number
  solved: number
  failed: number
  /** Percentuale di risolti, 0-100. */
  solvedRate: number
  totalSeconds: number
  averageSeconds: number
}

function toStats(
  attempted: number,
  solved: number,
  totalSeconds: number,
): PerformanceStats {
  return {
    attempted,
    solved,
    failed: attempted - solved,
    solvedRate: attempted > 0 ? (solved / attempted) * 100 : 0,
    totalSeconds,
    averageSeconds: attempted > 0 ? totalSeconds / attempted : 0,
  }
}

function sumRows(rows: RoundStatsRow[]): PerformanceStats {
  return toStats(
    rows.reduce((n, r) => n + r.attempted, 0),
    rows.reduce((n, r) => n + r.solved, 0),
    rows.reduce((n, r) => n + r.total_seconds, 0),
  )
}

/** Media di piu' sessioni: ogni sessione pesa uguale, qualunque sia la sua dimensione. */
function averageOf(list: PerformanceStats[]): PerformanceStats | null {
  if (list.length === 0) return null
  const mean = (pick: (s: PerformanceStats) => number) =>
    list.reduce((n, s) => n + pick(s), 0) / list.length
  return {
    attempted: mean((s) => s.attempted),
    solved: mean((s) => s.solved),
    failed: mean((s) => s.failed),
    solvedRate: mean((s) => s.solvedRate),
    totalSeconds: mean((s) => s.totalSeconds),
    averageSeconds: mean((s) => s.averageSeconds),
  }
}

/** Giro concluso: al giro 1 tutti i puzzle previsti, ai giri 2 e 3 tutto il pool. */
export function isRoundComplete(row: RoundStatsRow): boolean {
  return row.round === 1
    ? row.attempted >= row.total_puzzles
    : row.attempted >= row.pool_size
}

export interface Comparison {
  current: PerformanceStats
  /** La sessione precedente piu' recente con lo stesso traguardo, se c'e'. */
  previous: PerformanceStats | null
  /** Media delle sessioni precedenti con lo stesso traguardo. */
  average: PerformanceStats | null
  previousCount: number
}

// Le sessioni precedenti sono quelle create prima di questa, dalla piu'
// recente alla piu' vecchia.
function earlierSessions(rows: RoundStatsRow[], session: SessionRef): string[] {
  const created = new Map<string, number>()
  for (const r of rows) {
    if (
      r.session_id !== session.id &&
      Date.parse(r.created_at) < Date.parse(session.created_at)
    ) {
      created.set(r.session_id, Date.parse(r.created_at))
    }
  }
  return [...created.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

/** Un giro di questa sessione, confrontato con lo stesso giro (concluso) delle sessioni precedenti. */
export function compareRound(
  rows: RoundStatsRow[],
  session: SessionRef,
  round: Round,
): Comparison | null {
  const own = rows.find((r) => r.session_id === session.id && r.round === round)
  if (!own) return null
  const earlier = earlierSessions(rows, session)
    .map((id) => rows.find((r) => r.session_id === id && r.round === round))
    .filter((r): r is RoundStatsRow => !!r && isRoundComplete(r))
    .map((r) => sumRows([r]))
  return {
    current: sumRows([own]),
    previous: earlier[0] ?? null,
    average: averageOf(earlier),
    previousCount: earlier.length,
  }
}

/** L'intera sessione (tutti i giri), confrontata con le sessioni precedenti concluse. */
export function compareSession(
  rows: RoundStatsRow[],
  session: SessionRef,
): Comparison | null {
  const own = rows.filter((r) => r.session_id === session.id)
  if (own.length === 0) return null
  const completed = new Set(
    rows.filter((r) => r.status === 'completed').map((r) => r.session_id),
  )
  const earlier = earlierSessions(rows, session)
    .filter((id) => completed.has(id))
    .map((id) => sumRows(rows.filter((r) => r.session_id === id)))
  return {
    current: sumRows(own),
    previous: earlier[0] ?? null,
    average: averageOf(earlier),
    previousCount: earlier.length,
  }
}

/** I tre giri di una sessione, per il riepilogo finale. */
export function sessionRounds(
  rows: RoundStatsRow[],
  sessionId: string,
): { round: Round; stats: PerformanceStats }[] {
  return rows
    .filter((r) => r.session_id === sessionId)
    .sort((a, b) => a.round - b.round)
    .map((r) => ({ round: r.round, stats: sumRows([r]) }))
}

/** ELO prima del primo e dopo l'ultimo puzzle del giro 1 (l'unico in cui cambia). */
export function sessionEloChange(
  rows: RoundStatsRow[],
  sessionId: string,
): { from: number; to: number } | null {
  const round1 = rows.find((r) => r.session_id === sessionId && r.round === 1)
  return round1 ? { from: round1.elo_start, to: round1.elo_end } : null
}

/** "1:05" per i tempi totali, "18 s" (o "1:05" oltre il minuto) per le medie. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const mmss = `${minutes}:${seconds.toString().padStart(2, '0')}`
  return hours > 0 ? `${hours}:${mmss.padStart(5, '0')}` : mmss
}

export function formatAverage(seconds: number): string {
  return seconds < 60 ? `${Math.round(seconds)} s` : formatDuration(seconds)
}
