import { describe, expect, it } from 'vitest'
import { makePuzzleResult, makeSession, withAttempt } from '@/test/fixtures'
import { deriveSessionProgress, isFailedPuzzle } from './session-progress'

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
