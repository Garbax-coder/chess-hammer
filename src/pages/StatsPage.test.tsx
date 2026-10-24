import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { TrainingStatsData } from '@/lib/training-stats'
import StatsPage from './StatsPage'

const t = itTranslations
let data: TrainingStatsData

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-training-stats', () => ({
  useTrainingStats: () => ({ data, isLoading: false }),
}))

function renderStats() {
  render(
    <MemoryRouter>
      <StatsPage />
    </MemoryRouter>,
  )
}

describe('StatsPage', () => {
  it('shows the totals, the split by round and by session, and the categories', () => {
    data = {
      sessions: [
        {
          id: 's1',
          name: 'Tattiche autunno',
          status: 'in_progress',
          total_puzzles: 40,
          created_at: '2026-10-01T10:00:00Z',
          completed_at: null,
        },
      ],
      rounds: [
        {
          session_id: 's1',
          round: 1,
          result: 'solved',
          attempts: 30,
          total_seconds: 600,
        },
        {
          session_id: 's1',
          round: 1,
          result: 'failed',
          attempts: 10,
          total_seconds: 400,
        },
      ],
      themes: [
        { theme: 'fork', attempts: 12, solved: 11, total_seconds: 240 },
        { theme: 'pin', attempts: 8, solved: 2, total_seconds: 300 },
      ],
    }
    renderStats()

    const overview = screen
      .getByText(t.stats.overviewTitle)
      .closest('[data-slot="card"]') as HTMLElement
    expect(within(overview).getByText('40')).toBeInTheDocument()
    expect(within(overview).getByText('75%')).toBeInTheDocument()
    expect(within(overview).getByText('25%')).toBeInTheDocument()
    // 1000 s su 40 puzzle; 600 s su 30 risolti; 400 s su 10 sbagliati.
    expect(within(overview).getByText('25 s')).toBeInTheDocument()
    expect(within(overview).getByText('20 s')).toBeInTheDocument()
    expect(within(overview).getByText('40 s')).toBeInTheDocument()

    const tables = screen.getAllByRole('table')
    expect(
      within(tables[0]).getByText(t.dashboard.puzzlePerformance.roundLabel(1)),
    ).toBeInTheDocument()
    expect(
      within(tables[1]).getByRole('link', { name: 'Tattiche autunno' }),
    ).toHaveAttribute('href', '/sessions/s1/summary')

    const best = screen
      .getByText(t.stats.bestTitle)
      .closest('[data-slot="card"]') as HTMLElement
    expect(within(best).getByText(t.puzzleThemes.labels.fork)).toBeInTheDocument()
    expect(within(best).getByText(t.stats.themeLine(92, 12))).toBeInTheDocument()
    const worst = screen
      .getByText(t.stats.worstTitle)
      .closest('[data-slot="card"]') as HTMLElement
    expect(within(worst).getByText(t.puzzleThemes.labels.pin)).toBeInTheDocument()
  })

  it('explains that statistics appear after the first puzzle', () => {
    data = { sessions: [], rounds: [], themes: [] }
    renderStats()
    expect(screen.getByText(t.stats.empty)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
