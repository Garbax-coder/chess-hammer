import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '@/test/supabase-mock'

const { supabase, queueFrom } = createSupabaseMock()
vi.mock('@/lib/supabase', () => ({ supabase }))
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))

const { useAcceptLegalTerms, useUpdateBoardTheme, userStatsKey } =
  await import('./use-user-stats')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(userStatsKey('u1'), {
    board_theme: 'classic',
    legal_version: null,
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('preference updates', () => {
  it('write the new value to the cache and do not read user_stats again', async () => {
    const { queryClient, wrapper } = setup()
    queueFrom('user_stats', { data: null, error: null })
    const { result } = renderHook(() => useUpdateBoardTheme(), { wrapper })

    act(() => result.current.mutate('forest'))

    expect(queryClient.getQueryData(userStatsKey('u1'))).toMatchObject({
      board_theme: 'forest',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(supabase.from).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryState(userStatsKey('u1'))?.isInvalidated).toBe(false)
  })

  it('read user_stats again when saving fails, to restore the real value', async () => {
    const { queryClient, wrapper } = setup()
    queueFrom('user_stats', { data: null, error: { message: 'Load failed' } })
    const { result } = renderHook(() => useUpdateBoardTheme(), { wrapper })

    act(() => result.current.mutate('forest'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryState(userStatsKey('u1'))?.isInvalidated).toBe(true)
  })

  it('records when the terms were accepted, in the database only', async () => {
    const { queryClient, wrapper } = setup()
    queueFrom('user_stats', { data: null, error: null })
    const { result } = renderHook(() => useAcceptLegalTerms(), { wrapper })

    act(() => result.current.mutate('2026-10-24'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const update = supabase.from.mock.results.at(-1)!.value.update
    expect(update).toHaveBeenCalledWith({
      legal_version: '2026-10-24',
      legal_accepted_at: expect.any(String),
    })
    expect(queryClient.getQueryData(userStatsKey('u1'))).toEqual({
      board_theme: 'classic',
      legal_version: '2026-10-24',
    })
  })
})
