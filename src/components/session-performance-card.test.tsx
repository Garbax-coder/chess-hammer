import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { makePuzzleResult, makeSession, withAttempt } from '@/test/fixtures'
import { SessionPerformanceCard } from './session-performance-card'

const t = itTranslations
const session = makeSession({ id: 's1', status: 'in_progress', current_round: 2 })
const at = (day: string) => new Date(`${day}T12:00:00`).toISOString()

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-session-history', () => ({
  useSessionsList: () => ({ data: [session], isLoading: false }),
  useSessionDetail: (id: string | undefined) => ({
    data: id
      ? {
          session,
          puzzles: [
            withAttempt(
              withAttempt(
                makePuzzleResult({ orderIndex: 1 }),
                1,
                'solved',
                at('2026-10-01'),
              ),
              2,
              'solved',
              at('2026-10-04'),
            ),
            withAttempt(
              makePuzzleResult({ orderIndex: 2 }),
              1,
              'failed',
              at('2026-10-02'),
            ),
          ],
        }
      : undefined,
    isLoading: false,
  }),
}))
vi.mock('@/hooks/use-user-stats', () => ({ useUserStats: () => ({ data: undefined }) }))
vi.mock('@/components/session-performance-chart', () => ({
  SessionPerformanceChart: () => <div>grafico</div>,
}))
vi.mock('@/components/editable-session-name', () => ({
  EditableSessionName: ({ fallback }: { fallback: string }) => <>{fallback}</>,
}))

function renderCard() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<SessionPerformanceCard />} />
        <Route path="/sessions/:id/day/:date" element={<p>riepilogo del giorno</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SessionPerformanceCard summaries', () => {
  it('links the session summary and the summary of each played round', () => {
    renderCard()

    expect(screen.getByRole('link', { name: t.summary.linkSession })).toHaveAttribute(
      'href',
      '/sessions/s1/summary',
    )
    expect(
      screen.getByRole('link', { name: t.dashboard.puzzlePerformance.roundLabel(1) }),
    ).toHaveAttribute('href', '/sessions/s1/rounds/1')
    expect(
      screen.getByRole('link', { name: t.dashboard.puzzlePerformance.roundLabel(2) }),
    ).toHaveAttribute('href', '/sessions/s1/rounds/2')
    expect(
      screen.queryByRole('link', { name: t.dashboard.puzzlePerformance.roundLabel(3) }),
    ).not.toBeInTheDocument()
  })

  it('opens the summary of the day picked in the list, newest first', () => {
    renderCard()
    const picker = screen.getByRole('combobox', { name: t.summary.dayPicker })
    const days = [...picker.querySelectorAll('option')].map((o) => o.value)
    expect(days).toEqual(['', '2026-10-04', '2026-10-02', '2026-10-01'])

    fireEvent.change(picker, { target: { value: '2026-10-02' } })
    expect(screen.getByText('riepilogo del giorno')).toBeInTheDocument()
  })
})
