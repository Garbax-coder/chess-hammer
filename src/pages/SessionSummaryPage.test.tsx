import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { RoundStatsRow } from '@/lib/session-stats'
import SessionSummaryPage from './SessionSummaryPage'

const t = itTranslations
let rows: RoundStatsRow[] = []

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-session-stats', () => ({
  useSessionRoundStats: () => ({ data: rows, isLoading: false }),
}))

function row(
  sessionId: string,
  createdAt: string,
  round: 1 | 2 | 3,
  values: Partial<RoundStatsRow> = {},
): RoundStatsRow {
  return {
    session_id: sessionId,
    session_name: 'Tattiche autunno',
    status: 'completed',
    total_puzzles: 10,
    created_at: createdAt,
    completed_at: '2026-10-18T20:00:00Z',
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

function renderSummary(id: string) {
  render(
    <MemoryRouter initialEntries={[`/sessions/${id}/summary`]}>
      <Routes>
        <Route path="/sessions/:id/summary" element={<SessionSummaryPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SessionSummaryPage', () => {
  it('shows each round, the speed-up, the ELO change and the next steps', () => {
    rows = [
      row('s1', '2026-10-01T10:00:00Z', 1, {
        total_seconds: 400,
        elo_start: 1500,
        elo_end: 1560,
      }),
      row('s1', '2026-10-01T10:00:00Z', 2, { solved: 9, total_seconds: 250 }),
      row('s1', '2026-10-01T10:00:00Z', 3, { solved: 10, total_seconds: 200 }),
    ]
    renderSummary('s1')

    expect(
      screen.getByRole('heading', { name: t.summary.sessionCompleteTitle }),
    ).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(within(table).getByText('40 s')).toBeInTheDocument()
    expect(within(table).getByText('20 s')).toBeInTheDocument()
    expect(
      screen.getByText(t.summary.speedChange('40 s', '20 s', -50)),
    ).toBeInTheDocument()
    expect(screen.getByText(t.summary.elo(1500, 1560))).toBeInTheDocument()
    // Prima sessione: nessun confronto possibile.
    expect(screen.getByText(t.summary.noPrevious)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: t.summary.newSession })).toHaveAttribute(
      'href',
      '/sessions/new',
    )
    expect(screen.getByRole('link', { name: t.summary.details })).toHaveAttribute(
      'href',
      '/sessions/s1',
    )
  })

  it('compares the whole session with earlier completed sessions', () => {
    rows = [
      ...([1, 2, 3] as const).map((r) =>
        row('old', '2026-09-01T10:00:00Z', r, { solved: 6, total_seconds: 600 }),
      ),
      ...([1, 2, 3] as const).map((r) =>
        row('s1', '2026-10-01T10:00:00Z', r, { solved: 9, total_seconds: 300 }),
      ),
    ]
    renderSummary('s1')

    const tables = screen.getAllByRole('table')
    const comparison = tables[1]
    expect(within(comparison).getByText(t.summary.columns.average(1))).toBeInTheDocument()
    const averageRow = within(comparison)
      .getByText(t.summary.metrics.averageTime)
      .closest('tr') as HTMLElement
    // 900 s su 30 puzzle contro 1800 s: 30 s contro 60 s (1:00).
    expect(within(averageRow).getByText('30 s')).toBeInTheDocument()
    expect(within(averageRow).getAllByText('1:00')).toHaveLength(2)
  })

  it('offers no new session for a session still in progress', () => {
    rows = [row('s2', '2026-10-01T10:00:00Z', 1, { status: 'in_progress', attempted: 3 })]
    renderSummary('s2')

    expect(
      screen.getByRole('heading', { name: t.summary.sessionSummaryTitle }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: t.summary.newSession }),
    ).not.toBeInTheDocument()
  })

  it('says when the session has no puzzles played', () => {
    rows = []
    renderSummary('empty')
    expect(screen.getByText(t.summary.noData)).toBeInTheDocument()
  })
})
