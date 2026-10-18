import { describe, expect, it } from 'vitest'
import {
  compareRound,
  compareSession,
  formatAverage,
  formatDuration,
  isRoundComplete,
  sessionEloChange,
  sessionRounds,
  type RoundStatsRow,
} from './session-stats'

function row(
  sessionId: string,
  createdAt: string,
  round: 1 | 2 | 3,
  values: Partial<RoundStatsRow> = {},
): RoundStatsRow {
  return {
    session_id: sessionId,
    session_name: null,
    status: 'completed',
    total_puzzles: 10,
    created_at: createdAt,
    completed_at: null,
    pool_size: 10,
    round,
    attempted: 10,
    solved: 8,
    total_seconds: 300,
    first_attempt_at: createdAt,
    last_attempt_at: createdAt,
    elo_start: 1500,
    elo_end: 1500,
    ...values,
  }
}

const OLDEST = '2026-08-01T10:00:00Z'
const OLDER = '2026-09-01T10:00:00Z'
const CURRENT = '2026-10-01T10:00:00Z'
const current = { id: 'now', created_at: CURRENT }

describe('isRoundComplete', () => {
  it('needs every planned puzzle in round 1 and the whole pool afterwards', () => {
    expect(isRoundComplete(row('s', OLDER, 1, { attempted: 9 }))).toBe(false)
    expect(isRoundComplete(row('s', OLDER, 1, { attempted: 10 }))).toBe(true)
    expect(isRoundComplete(row('s', OLDER, 2, { attempted: 10, pool_size: 11 }))).toBe(
      false,
    )
  })
})

describe('compareRound', () => {
  const rows = [
    row('oldest', OLDEST, 2, { solved: 6, total_seconds: 400 }),
    row('older', OLDER, 2, { solved: 9, total_seconds: 200 }),
    // Giro 2 di una sessione precedente mai concluso: non entra nel confronto.
    row('abandoned', '2026-09-15T10:00:00Z', 2, { attempted: 4, solved: 4 }),
    row('now', CURRENT, 2, {
      attempted: 20,
      pool_size: 20,
      solved: 18,
      total_seconds: 360,
    }),
    // Una sessione creata dopo questa non e' "precedente".
    row('later', '2026-10-10T10:00:00Z', 2, { solved: 1 }),
  ]

  it('computes the current round with average time per puzzle', () => {
    const c = compareRound(rows, current, 2)!
    expect(c.current).toMatchObject({
      attempted: 20,
      solved: 18,
      failed: 2,
      solvedRate: 90,
      totalSeconds: 360,
      averageSeconds: 18,
    })
  })

  it('compares with the most recent completed round and the average of all', () => {
    const c = compareRound(rows, current, 2)!
    expect(c.previousCount).toBe(2)
    expect(c.previous).toMatchObject({ solved: 9, totalSeconds: 200, averageSeconds: 20 })
    expect(c.average).toMatchObject({
      solved: 7.5,
      failed: 2.5,
      solvedRate: 75,
      totalSeconds: 300,
      averageSeconds: 30,
    })
  })

  it('has nothing to compare for the first session', () => {
    const c = compareRound([row('now', CURRENT, 1)], current, 1)!
    expect(c.previous).toBeNull()
    expect(c.average).toBeNull()
    expect(c.previousCount).toBe(0)
  })

  it('returns null when the round has no attempts yet', () => {
    expect(compareRound(rows, current, 3)).toBeNull()
  })
})

describe('compareSession', () => {
  it('sums all rounds and compares with completed earlier sessions only', () => {
    const rows = [
      ...[1, 2, 3].map((r) =>
        row('older', OLDER, r as 1 | 2 | 3, { total_seconds: 100 }),
      ),
      row('in-progress', '2026-09-20T10:00:00Z', 1, { status: 'in_progress' }),
      ...[1, 2, 3].map((r) =>
        row('now', CURRENT, r as 1 | 2 | 3, { solved: 10, total_seconds: 150 }),
      ),
    ]
    const c = compareSession(rows, current)!
    expect(c.current).toMatchObject({ attempted: 30, solved: 30, totalSeconds: 450 })
    expect(c.previousCount).toBe(1)
    expect(c.previous).toMatchObject({ attempted: 30, solved: 24, totalSeconds: 300 })
  })
})

describe('session rounds and ELO', () => {
  const rows = [
    row('now', CURRENT, 2, { total_seconds: 200 }),
    row('now', CURRENT, 1, { total_seconds: 400, elo_start: 1500, elo_end: 1580 }),
  ]

  it('lists the rounds in order', () => {
    expect(
      sessionRounds(rows, 'now').map((r) => [r.round, r.stats.averageSeconds]),
    ).toEqual([
      [1, 40],
      [2, 20],
    ])
  })

  it('takes the ELO change from round 1', () => {
    expect(sessionEloChange(rows, 'now')).toEqual({ from: 1500, to: 1580 })
    expect(sessionEloChange(rows, 'other')).toBeNull()
  })
})

describe('formatting', () => {
  it('formats totals as m:ss or h:mm:ss', () => {
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(3725.4)).toBe('1:02:05')
  })

  it('formats averages in seconds under a minute', () => {
    expect(formatAverage(17.6)).toBe('18 s')
    expect(formatAverage(75)).toBe('1:15')
  })
})
