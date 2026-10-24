import { fireEvent, render, screen, within } from '@testing-library/react'
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
      practice: {
        sessions: [
          { session_id: 's1', result: 'solved', attempts: 4, total_seconds: 40 },
          { session_id: null, result: 'failed', attempts: 1, total_seconds: 60 },
        ],
        themes: [{ theme: 'skewer', attempts: 5, solved: 4, total_seconds: 50 }],
      },
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
    data = {
      sessions: [],
      rounds: [],
      themes: [],
      practice: { sessions: [], themes: [] },
    }
    renderStats()
    expect(screen.getByText(t.stats.empty)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

describe('StatsPage free practice tab', () => {
  it('switches to free practice totals, sessions and categories', () => {
    data = {
      sessions: [
        {
          id: 's1',
          name: 'Tattiche autunno',
          status: 'completed',
          total_puzzles: 40,
          created_at: '2026-10-01T10:00:00Z',
          completed_at: null,
        },
      ],
      rounds: [
        { session_id: 's1', round: 1, result: 'solved', attempts: 3, total_seconds: 30 },
      ],
      themes: [],
      practice: {
        sessions: [
          { session_id: 's1', result: 'solved', attempts: 4, total_seconds: 40 },
          { session_id: null, result: 'failed', attempts: 1, total_seconds: 60 },
        ],
        themes: [{ theme: 'skewer', attempts: 5, solved: 4, total_seconds: 50 }],
      },
    }
    renderStats()

    expect(screen.getByRole('tab', { name: t.stats.tabs.training })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    fireEvent.click(screen.getByRole('tab', { name: t.stats.tabs.practice }))
    expect(screen.getByRole('tab', { name: t.stats.tabs.practice })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    const panel = screen.getByRole('tabpanel')
    expect(within(panel).getByText(t.stats.practiceSubtitle)).toBeInTheDocument()
    // Nessuna tabella per giro: la pratica libera non ha giri.
    expect(within(panel).queryByText(t.stats.byRoundTitle)).not.toBeInTheDocument()
    expect(within(panel).getAllByRole('table')).toHaveLength(1)
    expect(within(panel).getByText(t.stats.unassignedSession)).toBeInTheDocument()
    expect(within(panel).getByText(t.puzzleThemes.labels.skewer)).toBeInTheDocument()
    expect(within(panel).getByText('80%')).toBeInTheDocument()
  })

  it('says when nothing was practiced yet', () => {
    data = {
      sessions: [],
      rounds: [],
      themes: [],
      practice: { sessions: [], themes: [] },
    }
    renderStats()
    fireEvent.click(screen.getByRole('tab', { name: t.stats.tabs.practice }))
    expect(screen.getByText(t.stats.practiceEmpty)).toBeInTheDocument()
  })
})
