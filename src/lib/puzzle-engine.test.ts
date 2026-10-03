import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '@/test/supabase-mock'
import { makeLichessPuzzle, makeSession } from '@/test/fixtures'

const { supabase, queueFrom, queueRpc } = createSupabaseMock()
vi.mock('@/lib/supabase', () => ({ supabase }))

const {
  attemptedIdsFrom,
  countAttemptedToday,
  dailyTargetForRound,
  getNextPuzzle,
} = await import('./puzzle-engine')

function sessionPuzzleRow(id: string, puzzleId: string, orderIndex: number) {
  return { id, puzzle_id: puzzleId, order_index: orderIndex }
}

function attemptRow(sessionPuzzleId: string, attemptedAt: string) {
  return { session_puzzle_id: sessionPuzzleId, attempted_at: attemptedAt }
}

describe('dailyTargetForRound', () => {
  it('reads the target for the given round', () => {
    const session = makeSession({
      daily_target_round1: 10,
      daily_target_round2: 20,
      daily_target_round3: 40,
    })
    expect(dailyTargetForRound(session, 1)).toBe(10)
    expect(dailyTargetForRound(session, 2)).toBe(20)
    expect(dailyTargetForRound(session, 3)).toBe(40)
  })
})

describe('attemptedIdsFrom / countAttemptedToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-20T12:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('attemptedIdsFrom collects the session_puzzle ids', () => {
    const rows = [attemptRow('a', '2026-09-20T10:00:00Z'), attemptRow('b', '2026-09-19T10:00:00Z')]
    expect(attemptedIdsFrom(rows)).toEqual(new Set(['a', 'b']))
  })

  it('countAttemptedToday only counts rows from today', () => {
    const rows = [attemptRow('a', '2026-09-20T10:00:00Z'), attemptRow('b', '2026-09-19T10:00:00Z')]
    expect(countAttemptedToday(rows)).toBe(1)
  })
})

describe('getNextPuzzle', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('round 1, puzzle already in the pool pending: returns it without calling the pick RPC', async () => {
    const session = makeSession({ current_round: 1, total_puzzles: 200 })
    const puzzle = makeLichessPuzzle({ puzzle_id: 'p1', rating: 1200 })

    queueFrom('session_puzzles', {
      data: [sessionPuzzleRow('sp1', 'p1', 1)],
      error: null,
    })
    queueFrom('puzzle_attempts', { data: [], error: null })
    queueFrom('lichess_puzzles', { data: puzzle, error: null })

    const outcome = await getNextPuzzle(session, 1000)

    expect(outcome).toEqual({
      status: 'next',
      data: { sessionPuzzleId: 'sp1', puzzle, round: 1 },
    })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('round 1, pool exhausted but below total: picks and inserts a new puzzle', async () => {
    const session = makeSession({ current_round: 1, total_puzzles: 200 })
    const existing = sessionPuzzleRow('sp1', 'p1', 1)
    const newPuzzle = makeLichessPuzzle({ puzzle_id: 'p2', rating: 1100 })

    queueFrom('session_puzzles', { data: [existing], error: null }) // fetchSessionPuzzles
    queueFrom('puzzle_attempts', {
      data: [attemptRow('sp1', '2026-09-10T00:00:00Z')],
      error: null,
    }) // the only puzzle in the pool is already attempted
    queueRpc('pick_next_round1_puzzle', { data: [newPuzzle], error: null })
    queueFrom('session_puzzles', {
      data: sessionPuzzleRow('sp2', 'p2', 2),
      error: null,
    }) // the insert

    const outcome = await getNextPuzzle(session, 1000)

    expect(outcome).toEqual({
      status: 'next',
      data: { sessionPuzzleId: 'sp2', puzzle: newPuzzle, round: 1 },
    })
    expect(supabase.rpc).toHaveBeenCalledWith(
      'pick_next_round1_puzzle',
      expect.objectContaining({ p_session_id: session.id, p_target_rating: 1000 }),
    )
  })

  it("returns quota_reached once today's daily target is met", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-20T12:00:00.000Z'))

    const session = makeSession({
      current_round: 1,
      total_puzzles: 200,
      daily_target_round1: 2,
    })
    const pool = [sessionPuzzleRow('sp1', 'p1', 1), sessionPuzzleRow('sp2', 'p2', 2)]

    queueFrom('session_puzzles', { data: pool, error: null })
    queueFrom('puzzle_attempts', {
      data: [
        attemptRow('sp1', '2026-09-20T09:00:00Z'),
        attemptRow('sp2', '2026-09-20T09:05:00Z'),
      ],
      error: null,
    })

    const outcome = await getNextPuzzle(session, 1000)

    expect(outcome).toEqual({ status: 'quota_reached', round: 1 })
  })

  it('advances to round 2 and enters resting when round 1 is fully attempted', async () => {
    const session = makeSession({
      current_round: 1,
      total_puzzles: 1,
      rest_days: 2,
    })
    const pool = [sessionPuzzleRow('sp1', 'p1', 1)]

    queueFrom('session_puzzles', { data: pool, error: null }) // fetchSessionPuzzles
    queueFrom('puzzle_attempts', {
      data: [attemptRow('sp1', '2026-09-10T00:00:00Z')],
      error: null,
    }) // round 1 attempts: the only puzzle, round complete
    queueFrom('training_sessions', { data: null, error: null }) // advanceRound update
    queueFrom('puzzle_attempts', { data: [], error: null }) // round 2 attempts (none yet)

    const outcome = await getNextPuzzle(session, 1000)

    expect(outcome.status).toBe('resting')
    if (outcome.status === 'resting') {
      expect(outcome.round).toBe(2)
      expect(new Date(outcome.restingUntil).getTime()).toBeGreaterThan(Date.now())
    }
  })

  it('completes the session when round 3 is fully attempted', async () => {
    const session = makeSession({ current_round: 3, total_puzzles: 1 })
    const pool = [sessionPuzzleRow('sp1', 'p1', 1)]

    queueFrom('session_puzzles', { data: pool, error: null })
    queueFrom('puzzle_attempts', {
      data: [attemptRow('sp1', '2026-09-10T00:00:00Z')],
      error: null,
    })
    queueFrom('training_sessions', { data: null, error: null }) // completeSession update

    const outcome = await getNextPuzzle(session, 1000)

    expect(outcome).toEqual({ status: 'session_complete' })
  })

  it('stays resting when resting_until is still in the future, without touching daily quota', async () => {
    const futureIso = new Date(Date.now() + 86_400_000).toISOString()
    const session = makeSession({
      current_round: 2,
      total_puzzles: 5,
      resting_until: futureIso,
    })
    const pool = [sessionPuzzleRow('sp1', 'p1', 1)]

    queueFrom('session_puzzles', { data: pool, error: null })
    queueFrom('puzzle_attempts', { data: [], error: null })

    const outcome = await getNextPuzzle(session, 1000)

    expect(outcome).toEqual({ status: 'resting', round: 2, restingUntil: futureIso })
  })

  it('round >= 2 reuses the existing pool without inserting new puzzles', async () => {
    const session = makeSession({ current_round: 2, total_puzzles: 2 })
    const puzzle = makeLichessPuzzle({ puzzle_id: 'p2', rating: 1300 })
    const pool = [sessionPuzzleRow('sp1', 'p1', 1), sessionPuzzleRow('sp2', 'p2', 2)]

    queueFrom('session_puzzles', { data: pool, error: null })
    queueFrom('puzzle_attempts', {
      data: [attemptRow('sp1', '2026-09-10T00:00:00Z')],
      error: null,
    })
    queueFrom('lichess_puzzles', { data: puzzle, error: null })

    const outcome = await getNextPuzzle(session, 1000)

    expect(outcome).toEqual({
      status: 'next',
      data: { sessionPuzzleId: 'sp2', puzzle, round: 2 },
    })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })
})
