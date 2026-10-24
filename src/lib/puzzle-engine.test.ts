import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '@/test/supabase-mock'
import { makeLichessPuzzle, makeSession } from '@/test/fixtures'

const { supabase, queueRpc } = createSupabaseMock()
vi.mock('@/lib/supabase', () => ({ supabase }))

const {
  attemptedIdsFrom,
  countAttemptedToday,
  dailyTargetForRound,
  currentTimeZone,
  getNextPuzzle,
} = await import('./puzzle-engine')

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
  it('asks the database in one call, with the browser time zone', async () => {
    const puzzle = makeLichessPuzzle({ puzzle_id: 'p1' })
    const next = { status: 'next', data: { sessionPuzzleId: 'sp1', puzzle, round: 1 } }
    queueRpc('get_next_puzzle', { data: next, error: null })

    const outcome = await getNextPuzzle('session-1')

    expect(outcome).toEqual(next)
    expect(supabase.rpc).toHaveBeenCalledTimes(1)
    expect(supabase.rpc).toHaveBeenCalledWith('get_next_puzzle', {
      p_session_id: 'session-1',
      p_tz: currentTimeZone(),
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('throws the database error', async () => {
    queueRpc('get_next_puzzle', { data: null, error: { message: 'Sessione non trovata.' } })
    await expect(getNextPuzzle('missing')).rejects.toMatchObject({
      message: 'Sessione non trovata.',
    })
  })
})
