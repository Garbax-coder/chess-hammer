import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { makeSession } from '@/test/fixtures'

vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('@/lib/session-puzzles-cache', () => ({ syncSessionPuzzles: vi.fn() }))
vi.mock('@/lib/puzzle-engine', () => ({
  getNextPuzzle: vi.fn(),
  recordAttemptAndGetNextPuzzle: vi.fn(async () => ({
    status: 'quota_reached',
    round: 1,
  })),
}))

const { useRecordAttempt } = await import('./use-puzzle-session')

describe('useRecordAttempt', () => {
  it('marks what the attempt changed as stale, without reading it again now', async () => {
    const session = makeSession({ id: 's1', current_round: 1 })
    const queryClient = new QueryClient()
    const keys = [
      ['user-stats', 'u1'],
      ['elo-history', 'u1', '30d'],
      ['sessions-list', 'u1'],
      ['session-detail', 's1'],
      ['session-progress', 's1', 1],
    ]
    for (const queryKey of keys) queryClient.setQueryData(queryKey, 'cached')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRecordAttempt(session), { wrapper })

    act(() =>
      result.current.mutate({
        sessionPuzzleId: 'sp1',
        round: 1,
        result: 'solved',
        timeSeconds: 12,
        puzzleRating: 1500,
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    for (const queryKey of keys) {
      const state = queryClient.getQueryState(queryKey)
      expect(state?.isInvalidated).toBe(true)
      expect(state?.fetchStatus).toBe('idle')
    }
  })
})
