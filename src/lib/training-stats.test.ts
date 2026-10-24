import { describe, expect, it } from 'vitest'
import {
  MIN_THEME_ATTEMPTS,
  rankThemes,
  summarizePractice,
  summarizeTraining,
  type TrainingStatsData,
} from './training-stats'

const session = (id: string, createdAt: string) => ({
  id,
  name: null,
  status: 'completed' as const,
  total_puzzles: 10,
  created_at: createdAt,
  completed_at: null,
})

const data: TrainingStatsData = {
  sessions: [
    session('old', '2026-09-01T10:00:00Z'),
    session('new', '2026-10-01T10:00:00Z'),
  ],
  rounds: [
    // Sessione vecchia, giro 1: 6 risolti in 120 s, 4 sbagliati in 160 s.
    { session_id: 'old', round: 1, result: 'solved', attempts: 6, total_seconds: 120 },
    { session_id: 'old', round: 1, result: 'failed', attempts: 4, total_seconds: 160 },
    // Sessione nuova, giro 1 e giro 2.
    { session_id: 'new', round: 1, result: 'solved', attempts: 8, total_seconds: 160 },
    { session_id: 'new', round: 1, result: 'failed', attempts: 2, total_seconds: 60 },
    { session_id: 'new', round: 2, result: 'solved', attempts: 10, total_seconds: 100 },
  ],
  themes: [],
  practice: {
    sessions: [
      { session_id: 'old', result: 'solved', attempts: 3, total_seconds: 30 },
      { session_id: 'old', result: 'failed', attempts: 1, total_seconds: 50 },
      { session_id: 'new', result: 'solved', attempts: 2, total_seconds: 40 },
      // Tentativo vecchio che non appartiene a nessuna sessione.
      { session_id: null, result: 'failed', attempts: 1, total_seconds: 15 },
    ],
    themes: [],
  },
}

describe('summarizeTraining', () => {
  it('computes the overall totals, rates and average times', () => {
    const { overall } = summarizeTraining(data)
    expect(overall).toEqual({
      attempts: 30,
      solved: 24,
      failed: 6,
      solvedRate: 80,
      failedRate: 20,
      averageSeconds: 600 / 30,
      averageSolvedSeconds: 380 / 24,
      averageFailedSeconds: 220 / 6,
    })
  })

  it('splits by round, only for the rounds played', () => {
    const { byRound } = summarizeTraining(data)
    expect(byRound.map((r) => [r.round, r.kpi.attempts, r.kpi.solvedRate])).toEqual([
      [1, 20, 70],
      [2, 10, 100],
    ])
    // Nel giro 2 nessun errore: media dei sbagliati a zero, non NaN.
    expect(byRound[1].kpi.averageFailedSeconds).toBe(0)
  })

  it('splits by session, newest first', () => {
    const { bySession } = summarizeTraining(data)
    expect(bySession.map((s) => [s.session.id, s.kpi.attempts, s.kpi.solved])).toEqual([
      ['new', 20, 18],
      ['old', 10, 6],
    ])
  })

  it('handles a user with no attempts', () => {
    const { overall, byRound, bySession } = summarizeTraining({
      sessions: [],
      rounds: [],
      themes: [],
      practice: { sessions: [], themes: [] },
    })
    expect(overall.attempts).toBe(0)
    expect(overall.solvedRate).toBe(0)
    expect(byRound).toEqual([])
    expect(bySession).toEqual([])
  })
})

describe('summarizePractice', () => {
  it('computes free practice totals and averages', () => {
    const { overall } = summarizePractice(data)
    expect(overall).toMatchObject({
      attempts: 7,
      solved: 5,
      failed: 2,
      averageSeconds: 135 / 7,
      averageSolvedSeconds: 70 / 5,
      averageFailedSeconds: 65 / 2,
    })
  })

  it('splits by session, newest first, with unassigned attempts last', () => {
    const { bySession } = summarizePractice(data)
    expect(bySession.map((s) => [s.session?.id ?? null, s.kpi.attempts])).toEqual([
      ['new', 2],
      ['old', 4],
      [null, 1],
    ])
  })

  it('lists only the sessions practiced', () => {
    const { bySession } = summarizePractice({
      ...data,
      practice: {
        sessions: [
          { session_id: 'old', result: 'solved', attempts: 1, total_seconds: 9 },
        ],
        themes: [],
      },
    })
    expect(bySession.map((s) => s.session?.id)).toEqual(['old'])
  })
})

describe('rankThemes', () => {
  const theme = (name: string, attempts: number, solved: number) => ({
    theme: name,
    attempts,
    solved,
    total_seconds: attempts * 20,
  })

  it('ranks only chess themes with enough puzzles', () => {
    const { best, worst } = rankThemes([
      theme('fork', 10, 9),
      theme('pin', 10, 3),
      // Troppo pochi puzzle per una percentuale sensata.
      theme('skewer', MIN_THEME_ATTEMPTS - 1, MIN_THEME_ATTEMPTS - 1),
      // Etichette descrittive, non categorie scacchistiche.
      theme('short', 50, 50),
      theme('crushing', 50, 0),
      theme('master', 50, 25),
    ])
    expect(best.map((t) => t.theme)).toEqual(['fork'])
    expect(worst.map((t) => t.theme)).toEqual(['pin'])
    expect(best[0].solvedRate).toBe(90)
    expect(best[0].averageSeconds).toBe(20)
  })

  it('keeps 10 best and 10 worst, never the same category twice', () => {
    const names = [
      'fork',
      'pin',
      'skewer',
      'discoveredAttack',
      'deflection',
      'attraction',
      'clearance',
      'interference',
      'intermezzo',
      'xRayAttack',
      'zugzwang',
      'trappedPiece',
      'hangingPiece',
      'quietMove',
      'defensiveMove',
      'sacrifice',
      'advancedPawn',
      'exposedKing',
      'kingsideAttack',
      'queensideAttack',
      'mateIn1',
      'mateIn2',
      'endgame',
      'middlegame',
    ]
    // Percentuali tutte diverse: 100%, 96%, 92%, ...
    const themes = names.map((n, i) => theme(n, 25, 25 - i))
    const { best, worst } = rankThemes(themes)

    expect(best).toHaveLength(10)
    expect(worst).toHaveLength(10)
    expect(best[0].theme).toBe('fork')
    expect(worst[0].theme).toBe('middlegame')
    expect(best.some((b) => worst.some((w) => w.theme === b.theme))).toBe(false)
  })

  it('splits few categories in half instead of repeating them', () => {
    const themes = ['fork', 'pin', 'skewer', 'mateIn1', 'endgame'].map((n, i) =>
      theme(n, 10, 10 - i),
    )
    const { best, worst } = rankThemes(themes)
    expect(best.map((t) => t.theme)).toEqual(['fork', 'pin', 'skewer'])
    expect(worst.map((t) => t.theme)).toEqual(['endgame', 'mateIn1'])
  })

  it('breaks ties by the number of puzzles', () => {
    const { best } = rankThemes([theme('fork', 10, 10), theme('pin', 30, 30)])
    expect(best[0].theme).toBe('pin')
  })
})
