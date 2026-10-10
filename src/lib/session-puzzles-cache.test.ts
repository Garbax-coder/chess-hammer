import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeAttempt, makePuzzleResult } from '@/test/fixtures'
import type { PuzzleAttempt, SessionPuzzleResult } from '@/types/training'

const fetchSessionPuzzlesDetail = vi.fn<(id: string) => Promise<SessionPuzzleResult[]>>()
const fetchSessionPuzzlesAfter =
  vi.fn<(id: string, after: number) => Promise<SessionPuzzleResult[]>>()
const fetchSessionAttemptsSince =
  vi.fn<(id: string, since: string | null) => Promise<PuzzleAttempt[]>>()
const countSessionRows =
  vi.fn<(id: string) => Promise<{ puzzles: number; attempts: number }>>()

vi.mock('@/lib/session-history', () => ({
  fetchSessionPuzzlesDetail: (id: string) => fetchSessionPuzzlesDetail(id),
  fetchSessionPuzzlesAfter: (id: string, after: number) =>
    fetchSessionPuzzlesAfter(id, after),
  fetchSessionAttemptsSince: (id: string, since: string | null) =>
    fetchSessionAttemptsSince(id, since),
  countSessionRows: (id: string) => countSessionRows(id),
  fetchSessionPuzzleAttempts: vi.fn(),
}))

const { loadSessionPuzzles } = await import('./session-puzzles-cache')
const { readSnapshot, writeSnapshot } = await import('./session-puzzles-snapshot')

const first = makePuzzleResult({
  sessionPuzzleId: 'sp-1',
  orderIndex: 1,
  attempts: {
    1: makeAttempt({
      session_puzzle_id: 'sp-1',
      attempted_at: '2026-10-01T10:00:00.000Z',
    }),
  },
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('loadSessionPuzzles', () => {
  it('downloads the whole list the first time and keeps a local copy', async () => {
    fetchSessionPuzzlesDetail.mockResolvedValue([first])

    expect(await loadSessionPuzzles('s1')).toEqual([first])
    expect(readSnapshot('s1')).toEqual([first])
  })

  it('with a local copy, downloads only new puzzles and attempts since the last one', async () => {
    writeSnapshot('s1', [first])
    const round2 = makeAttempt({
      session_puzzle_id: 'sp-1',
      round_number: 2,
      attempted_at: '2026-10-02T10:00:00.000Z',
    })
    const second = makePuzzleResult({ sessionPuzzleId: 'sp-2', orderIndex: 2 })
    fetchSessionPuzzlesAfter.mockResolvedValue([second])
    fetchSessionAttemptsSince.mockResolvedValue([round2])
    countSessionRows.mockResolvedValue({ puzzles: 2, attempts: 2 })

    const list = await loadSessionPuzzles('s1')

    expect(fetchSessionPuzzlesDetail).not.toHaveBeenCalled()
    expect(fetchSessionPuzzlesAfter).toHaveBeenCalledWith('s1', 1)
    expect(fetchSessionAttemptsSince).toHaveBeenCalledWith(
      's1',
      '2026-10-01T10:00:00.000Z',
    )
    expect(list.map((p) => p.sessionPuzzleId)).toEqual(['sp-1', 'sp-2'])
    expect(list[0].attempts[2]).toEqual(round2)
    expect(readSnapshot('s1')).toEqual(list)
  })

  it('downloads everything again when the counts do not match (e.g. deleted rows)', async () => {
    writeSnapshot('s1', [first])
    fetchSessionPuzzlesAfter.mockResolvedValue([])
    fetchSessionAttemptsSince.mockResolvedValue([])
    countSessionRows.mockResolvedValue({ puzzles: 1, attempts: 0 })
    const fresh = makePuzzleResult({ sessionPuzzleId: 'sp-1', orderIndex: 1 })
    fetchSessionPuzzlesDetail.mockResolvedValue([fresh])

    expect(await loadSessionPuzzles('s1')).toEqual([fresh])
    expect(readSnapshot('s1')).toEqual([fresh])
  })

  it('downloads everything again when an incremental request fails', async () => {
    writeSnapshot('s1', [first])
    fetchSessionPuzzlesAfter.mockRejectedValue(new Error('network'))
    fetchSessionAttemptsSince.mockResolvedValue([])
    countSessionRows.mockResolvedValue({ puzzles: 1, attempts: 1 })
    fetchSessionPuzzlesDetail.mockResolvedValue([first])
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(await loadSessionPuzzles('s1')).toEqual([first])
    expect(fetchSessionPuzzlesDetail).toHaveBeenCalledWith('s1')
  })

  it('keeps only the copy of the session being trained', async () => {
    writeSnapshot('old-session', [first])
    fetchSessionPuzzlesDetail.mockResolvedValue([first])

    await loadSessionPuzzles('s2')

    expect(readSnapshot('old-session')).toBeNull()
    expect(readSnapshot('s2')).toEqual([first])
  })
})
