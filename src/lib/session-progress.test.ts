import { describe, expect, it } from 'vitest'
import { makePuzzleResult, makeSession, withAttempt } from '@/test/fixtures'
import type { PracticeAttempt } from '@/types/training'
import {
  deriveSessionProgress,
  isFailedPuzzle,
  practiceResumePuzzle,
} from './session-progress'

describe('deriveSessionProgress', () => {
  it('counts only attempts in the current round', () => {
    const session = makeSession({ current_round: 2, total_puzzles: 200 })
    let p1 = makePuzzleResult({ orderIndex: 1 })
    p1 = withAttempt(p1, 1, 'solved', '2026-09-01T00:00:00Z')
    p1 = withAttempt(p1, 2, 'solved', '2026-09-10T00:00:00Z')
    const p2 = makePuzzleResult({ orderIndex: 2 })

    const progress = deriveSessionProgress(session, [p1, p2])

    expect(progress.round).toBe(2)
    expect(progress.poolSize).toBe(2)
    expect(progress.roundTargetSize).toBe(200)
    expect(progress.attemptedThisRound).toBe(1)
  })

  it('counts attemptedToday only from today, using the round-2 daily target', () => {
    const session = makeSession({ current_round: 2, daily_target_round2: 20 })
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const yesterday = new Date(startOfToday.getTime() - 1000).toISOString()
    const today = new Date(startOfToday.getTime() + 1000).toISOString()

    let p1 = withAttempt(makePuzzleResult({ orderIndex: 1 }), 2, 'solved', yesterday)
    let p2 = withAttempt(makePuzzleResult({ orderIndex: 2 }), 2, 'solved', today)

    const progress = deriveSessionProgress(session, [p1, p2])

    expect(progress.dailyTarget).toBe(20)
    expect(progress.attemptedToday).toBe(1)
  })
})

describe('isFailedPuzzle', () => {
  it('scope "all": true if any round failed, even if a later round solved it', () => {
    let p = withAttempt(makePuzzleResult(), 1, 'failed', '2026-09-01T00:00:00Z')
    p = withAttempt(p, 2, 'solved', '2026-09-02T00:00:00Z')
    expect(isFailedPuzzle(p, 'all')).toBe(true)
  })

  it('scope "all": false if every attempted round was solved', () => {
    const p = withAttempt(makePuzzleResult(), 1, 'solved', '2026-09-01T00:00:00Z')
    expect(isFailedPuzzle(p, 'all')).toBe(false)
  })

  it('scope "lastRound": only looks at the highest attempted round', () => {
    let p = withAttempt(makePuzzleResult(), 1, 'failed', '2026-09-01T00:00:00Z')
    p = withAttempt(p, 2, 'solved', '2026-09-02T00:00:00Z')
    // Giro 1 fallito ma giro 2 (l'ultimo tentato) risolto: non conta come fallito.
    expect(isFailedPuzzle(p, 'lastRound')).toBe(false)
  })

  it('scope "lastRound": false for a puzzle never attempted', () => {
    expect(isFailedPuzzle(makePuzzleResult(), 'lastRound')).toBe(false)
  })
})

describe('practiceResumePuzzle', () => {
  const sessionCreatedAt = '2026-09-01T00:00:00Z'
  const allPuzzles = { onlyFailed: false, scope: 'all' } as const
  const onlyFailed = { onlyFailed: true, scope: 'all' } as const

  // Pool di 4 puzzle; il 2 e il 4 sono stati falliti nel giro ufficiale.
  const pool = [
    withAttempt(
      makePuzzleResult({ puzzleId: 'p1', orderIndex: 1 }),
      1,
      'solved',
      '2026-09-02T00:00:00Z',
    ),
    withAttempt(
      makePuzzleResult({ puzzleId: 'p2', orderIndex: 2 }),
      1,
      'failed',
      '2026-09-02T00:00:00Z',
    ),
    withAttempt(
      makePuzzleResult({ puzzleId: 'p3', orderIndex: 3 }),
      1,
      'solved',
      '2026-09-02T00:00:00Z',
    ),
    withAttempt(
      makePuzzleResult({ puzzleId: 'p4', orderIndex: 4 }),
      1,
      'failed',
      '2026-09-02T00:00:00Z',
    ),
  ]

  function practiced(...entries: [puzzleId: string, attemptedAt: string][]) {
    const map = new Map<string, PracticeAttempt[]>()
    for (const [puzzleId, attemptedAt] of entries) {
      map.set(puzzleId, [
        ...(map.get(puzzleId) ?? []),
        {
          id: `${puzzleId}-${attemptedAt}`,
          user_id: 'user-1',
          puzzle_id: puzzleId,
          result: 'solved',
          time_seconds: 10,
          attempted_at: attemptedAt,
        },
      ])
    }
    return map
  }

  it('starts from the first puzzle when nothing was practiced yet', () => {
    expect(
      practiceResumePuzzle(pool, new Map(), allPuzzles, sessionCreatedAt)?.puzzleId,
    ).toBe('p1')
  })

  it('resumes after the most recently concluded practice puzzle, not the highest one', () => {
    const attempts = practiced(
      ['p3', '2026-09-05T00:00:00Z'],
      ['p1', '2026-09-06T00:00:00Z'],
    )
    expect(
      practiceResumePuzzle(pool, attempts, allPuzzles, sessionCreatedAt)?.puzzleId,
    ).toBe('p2')
  })

  it('skips solved puzzles when the user only practices failed ones', () => {
    const attempts = practiced(['p2', '2026-09-05T00:00:00Z'])
    expect(
      practiceResumePuzzle(pool, attempts, onlyFailed, sessionCreatedAt)?.puzzleId,
    ).toBe('p4')
  })

  it('also works when the last practiced puzzle is not in the filtered pool', () => {
    const attempts = practiced(['p1', '2026-09-05T00:00:00Z'])
    expect(
      practiceResumePuzzle(pool, attempts, onlyFailed, sessionCreatedAt)?.puzzleId,
    ).toBe('p2')
  })

  it('starts over after the last puzzle of the pool', () => {
    const attempts = practiced(['p4', '2026-09-05T00:00:00Z'])
    expect(
      practiceResumePuzzle(pool, attempts, onlyFailed, sessionCreatedAt)?.puzzleId,
    ).toBe('p2')
  })

  it('ignores practice attempts made before this session existed', () => {
    const attempts = practiced(['p3', '2026-08-20T00:00:00Z'])
    expect(
      practiceResumePuzzle(pool, attempts, allPuzzles, sessionCreatedAt)?.puzzleId,
    ).toBe('p1')
  })

  it('returns undefined when the filter leaves nothing to practice', () => {
    const allSolved = [pool[0], pool[2]]
    expect(
      practiceResumePuzzle(allSolved, new Map(), onlyFailed, sessionCreatedAt),
    ).toBeUndefined()
  })
})
