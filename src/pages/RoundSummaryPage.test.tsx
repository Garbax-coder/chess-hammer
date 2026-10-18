import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { RoundStatsRow } from '@/lib/session-stats'
import { makePuzzleResult, makeSession, withAttempt } from '@/test/fixtures'
import RoundSummaryPage from './RoundSummaryPage'

const t = itTranslations
const session = makeSession({ id: 's1', name: 'Tattiche autunno', total_puzzles: 40 })
const at = (day: string) => new Date(`${day}T12:00:00`).toISOString()
let rows: RoundStatsRow[] = []

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-session-stats', () => ({
  useSessionRoundStats: () => ({ data: rows, isLoading: false }),
}))
vi.mock('@/hooks/use-session-history', () => ({
  useSessionDetail: () => ({
    data: {
      session,
      puzzles: [
        withAttempt(
          makePuzzleResult({ orderIndex: 1 }),
          2,
          'solved',
          at('2026-10-05'),
          20,
        ),
        withAttempt(
          makePuzzleResult({ orderIndex: 2 }),
          2,
          'failed',
          at('2026-10-06'),
          40,
        ),
      ],
    },
    isLoading: false,
  }),
}))

function row(values: Partial<RoundStatsRow>): RoundStatsRow {
  return {
    session_id: 's1',
    session_name: 'Tattiche autunno',
    status: 'in_progress',
    total_puzzles: 40,
    created_at: session.created_at,
    completed_at: null,
    pool_size: 40,
    round: 2,
    attempted: 2,
    solved: 1,
    total_seconds: 60,
    first_attempt_at: at('2026-10-05'),
    last_attempt_at: at('2026-10-06'),
    elo_start: 1500,
    elo_end: 1500,
    ...values,
  }
}

function renderRound(round: number) {
  render(
    <MemoryRouter initialEntries={[`/sessions/s1/rounds/${round}`]}>
      <Routes>
        <Route path="/sessions/:id/rounds/:round" element={<RoundSummaryPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RoundSummaryPage', () => {
  it('shows the round summary, its progress and its days', () => {
    rows = [row({})]
    renderRound(2)

    expect(
      screen.getByRole('heading', { name: t.summary.roundTitle(2) }),
    ).toBeInTheDocument()
    expect(screen.getByText('Tattiche autunno')).toBeInTheDocument()
    expect(screen.getByText(t.summary.roundInProgress(2, 40))).toBeInTheDocument()
    expect(
      screen.getByText(t.summary.roundLine(1, 1, '1:00', '30 s')),
    ).toBeInTheDocument()

    const days = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.includes('/day/'))
    expect(days.map((a) => a.getAttribute('href'))).toEqual([
      '/sessions/s1/day/2026-10-05',
      '/sessions/s1/day/2026-10-06',
    ])
    expect(
      screen.getByRole('link', { name: t.summary.sessionSummaryTitle }),
    ).toHaveAttribute('href', '/sessions/s1/summary')
  })

  it('does not call a completed round in progress', () => {
    rows = [row({ attempted: 40, solved: 30, total_seconds: 1200 })]
    renderRound(2)
    expect(screen.queryByText(t.summary.roundInProgress(40, 40))).not.toBeInTheDocument()
  })

  it('says when the round has not started', () => {
    rows = [row({})]
    renderRound(3)
    expect(screen.getByText(t.summary.noData)).toBeInTheDocument()
  })
})
