import { PUZZLE_THEME_CATEGORIES } from '@/lib/puzzle-themes'
import { supabase } from '@/lib/supabase'
import type { AttemptResult, SessionStatus } from '@/types/training'

// Statistiche dell'utente sui puzzle dell'allenamento ufficiale (pagina
// /stats). Il database restituisce solo totali gia' aggregati (funzione
// my_training_stats, migrazione 0034); qui si ricavano percentuali, medie,
// suddivisioni e classifiche, senza altre richieste.

type Round = 1 | 2 | 3

export interface TrainingStatsData {
  sessions: {
    id: string
    name: string | null
    status: SessionStatus
    total_puzzles: number
    created_at: string
    completed_at: string | null
  }[]
  /** Un totale per sessione x giro x esito. */
  rounds: {
    session_id: string
    round: Round
    result: AttemptResult
    attempts: number
    total_seconds: number
  }[]
  /** Un totale per tema Lichess dei puzzle tentati. */
  themes: { theme: string; attempts: number; solved: number; total_seconds: number }[]
}

export async function fetchTrainingStats(): Promise<TrainingStatsData> {
  const { data, error } = await supabase.rpc('my_training_stats')
  if (error) throw error
  const raw = data as TrainingStatsData
  return {
    sessions: raw.sessions,
    rounds: raw.rounds.map((r) => ({ ...r, total_seconds: Number(r.total_seconds) })),
    themes: raw.themes.map((t) => ({ ...t, total_seconds: Number(t.total_seconds) })),
  }
}

export interface Kpi {
  attempts: number
  solved: number
  failed: number
  /** Percentuali 0-100. */
  solvedRate: number
  failedRate: number
  averageSeconds: number
  averageSolvedSeconds: number
  averageFailedSeconds: number
}

interface Totals {
  solved: number
  failed: number
  solvedSeconds: number
  failedSeconds: number
}

const ZERO: Totals = { solved: 0, failed: 0, solvedSeconds: 0, failedSeconds: 0 }

function add(totals: Totals, row: TrainingStatsData['rounds'][number]): Totals {
  return row.result === 'solved'
    ? {
        ...totals,
        solved: totals.solved + row.attempts,
        solvedSeconds: totals.solvedSeconds + row.total_seconds,
      }
    : {
        ...totals,
        failed: totals.failed + row.attempts,
        failedSeconds: totals.failedSeconds + row.total_seconds,
      }
}

function toKpi({ solved, failed, solvedSeconds, failedSeconds }: Totals): Kpi {
  const attempts = solved + failed
  const ratio = (n: number, d: number) => (d > 0 ? n / d : 0)
  return {
    attempts,
    solved,
    failed,
    solvedRate: ratio(solved, attempts) * 100,
    failedRate: ratio(failed, attempts) * 100,
    averageSeconds: ratio(solvedSeconds + failedSeconds, attempts),
    averageSolvedSeconds: ratio(solvedSeconds, solved),
    averageFailedSeconds: ratio(failedSeconds, failed),
  }
}

function kpiOf(rows: TrainingStatsData['rounds']): Kpi {
  return toKpi(rows.reduce(add, ZERO))
}

export interface SessionKpi {
  session: TrainingStatsData['sessions'][number]
  kpi: Kpi
}

export interface TrainingStatsSummary {
  overall: Kpi
  byRound: { round: Round; kpi: Kpi }[]
  /** Dalla sessione piu' recente. */
  bySession: SessionKpi[]
}

export function summarizeTraining(data: TrainingStatsData): TrainingStatsSummary {
  const rounds = ([1, 2, 3] as const)
    .map((round) => ({ round, rows: data.rounds.filter((r) => r.round === round) }))
    .filter(({ rows }) => rows.length > 0)
    .map(({ round, rows }) => ({ round, kpi: kpiOf(rows) }))
  return {
    overall: kpiOf(data.rounds),
    byRound: rounds,
    bySession: [...data.sessions]
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .map((session) => ({
        session,
        kpi: kpiOf(data.rounds.filter((r) => r.session_id === session.id)),
      })),
  }
}

// Le classifiche sono sui temi scacchistici (tattiche, matti, finali, mosse
// speciali, fase della partita). Restano fuori le etichette descrittive del
// puzzle: lunghezza, valutazione finale, partita tra maestri.
const DESCRIPTIVE_CATEGORIES = new Set(['length', 'goal', 'level'])
export const RANKED_THEMES: ReadonlySet<string> = new Set(
  PUZZLE_THEME_CATEGORIES.filter((c) => !DESCRIPTIVE_CATEGORIES.has(c.id)).flatMap(
    (c) => c.themes,
  ),
)

/** Sotto questo numero di puzzle una percentuale non dice molto (1 su 1 = 100%). */
export const MIN_THEME_ATTEMPTS = 5

export interface ThemeKpi {
  theme: string
  attempts: number
  solved: number
  solvedRate: number
  averageSeconds: number
}

/**
 * Le categorie con le prestazioni migliori e peggiori (al massimo `limit`
 * ciascuna, senza ripetere una categoria in entrambe). A parita' di
 * percentuale conta di piu' la categoria con piu' puzzle.
 */
export function rankThemes(
  themes: TrainingStatsData['themes'],
  limit = 10,
): { best: ThemeKpi[]; worst: ThemeKpi[] } {
  const ranked = themes
    .filter((t) => RANKED_THEMES.has(t.theme) && t.attempts >= MIN_THEME_ATTEMPTS)
    .map((t) => ({
      theme: t.theme,
      attempts: t.attempts,
      solved: t.solved,
      solvedRate: (t.solved / t.attempts) * 100,
      averageSeconds: t.total_seconds / t.attempts,
    }))
  // Con poche categorie in classifica (meno di 2 x limit) si dividono a
  // meta': nessuna compare in tutte e due le liste.
  const perList = Math.min(limit, Math.ceil(ranked.length / 2))
  const best = [...ranked]
    .sort((a, b) => b.solvedRate - a.solvedRate || b.attempts - a.attempts)
    .slice(0, perList)
  const inBest = new Set(best.map((t) => t.theme))
  const worst = [...ranked]
    .filter((t) => !inBest.has(t.theme))
    .sort((a, b) => a.solvedRate - b.solvedRate || b.attempts - a.attempts)
    .slice(0, limit)
  return { best, worst }
}
