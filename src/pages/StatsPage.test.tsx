import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { OpeningStatsData } from '@/lib/opening-stats'
import type { OpeningProgress } from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'
import type { TrainingStatsData } from '@/lib/training-stats'
import StatsPage from './StatsPage'

const t = itTranslations
const o = openingsTranslations.it
let data: TrainingStatsData

// Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nc3 (Run 5).
const repertoire: RepertoireWithNodes = {
  id: 'r1',
  slug: 'italian-game',
  name: 'Italian Game',
  eco: 'C50',
  color: 'w',
  owner_id: null,
  nodes: [
    { id: 1, parent_id: null, ply: 1, uci: 'e2e4', san: 'e4', epd: 'a', is_main: true },
    { id: 2, parent_id: 1, ply: 2, uci: 'e7e5', san: 'e5', epd: 'b', is_main: true },
    { id: 3, parent_id: 2, ply: 3, uci: 'g1f3', san: 'Nf3', epd: 'c', is_main: true },
    { id: 4, parent_id: 1, ply: 2, uci: 'c7c5', san: 'c5', epd: 'd', is_main: true },
    { id: 5, parent_id: 4, ply: 3, uci: 'b1c3', san: 'Nc3', epd: 'e', is_main: true },
  ],
}
let openingStats: OpeningStatsData = { nodes: [], days: [], cycles: [] }
const mastered: OpeningProgress = {
  node_id: 1,
  attempts: 6,
  first_try_correct: 6,
  streak: 6,
  last_seen_at: '2026-10-24T10:00:00Z',
  due_at: '2099-01-01T00:00:00Z',
}

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
  useLanguage: () => ({ language: 'it' }),
}))
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [repertoire] }),
  useOpeningProgress: () => ({ data: new Map([[1, mastered]]) }),
  useOpeningStats: () => ({ data: openingStats }),
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
    // Ogni categoria apre la pratica libera sui suoi puzzle dell'allenamento.
    expect(
      within(best).getByRole('link', { name: t.puzzleThemes.labels.fork }),
    ).toHaveAttribute('href', '/stats/themes/fork')
    expect(
      within(worst).getByRole('link', { name: t.puzzleThemes.labels.pin }),
    ).toHaveAttribute('href', '/stats/themes/pin')
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
    expect(
      within(panel).getByRole('link', { name: t.puzzleThemes.labels.skewer }),
    ).toHaveAttribute('href', '/stats/themes/skewer?source=practice')
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

describe('StatsPage openings tab', () => {
  it('shows the opening totals, the activity, each repertoire and the hardest moves', () => {
    const today = new Date().toISOString().slice(0, 10)
    openingStats = {
      // 1.e4: 6 giuste su 6; 2.Nc3: 2 sbagliate su 4.
      nodes: [
        { node_id: 1, attempts: 6, wrong: 0, avg_ms: 2000 },
        { node_id: 5, attempts: 4, wrong: 2, avg_ms: 5000 },
      ],
      days: [{ day: today, attempts: 10, correct: 8 }],
      cycles: [{ repertoire_id: 'r1', cycles: 2, best_ms: 60000 }],
    }
    renderStats()
    fireEvent.click(screen.getByRole('tab', { name: o.statsTab }))
    const panel = screen.getByRole('tabpanel')
    expect(within(panel).getByText(o.statsSubtitle)).toBeInTheDocument()

    const overview = within(panel)
      .getByText(t.stats.overviewTitle)
      .closest('[data-slot="card"]') as HTMLElement
    expect(within(overview).getByText('10')).toBeInTheDocument()
    expect(within(overview).getByText('80%')).toBeInTheDocument()
    // (6 x 2 s + 4 x 5 s) / 10 = 3,2 s.
    expect(within(overview).getByText('3 s')).toBeInTheDocument()

    expect(within(panel).getByText(o.statsActivityNote(1, 10))).toBeInTheDocument()
    expect(
      within(panel).getByRole('link', { name: o.names['italian-game'] }),
    ).toHaveAttribute('href', '/openings/italian-game/lines')
    // Solo 2.Nc3 ha errori: la mossa piu' difficile, aperta nella consultazione.
    expect(within(panel).getByRole('link', { name: '1.e4 c5 2.Nc3' })).toHaveAttribute(
      'href',
      '/openings/italian-game/lines?move=5',
    )
    expect(within(panel).getByText(o.statsHardestLine(50, 4))).toBeInTheDocument()
  })

  it('says when no opening move was trained yet', () => {
    openingStats = { nodes: [], days: [], cycles: [] }
    renderStats()
    fireEvent.click(screen.getByRole('tab', { name: o.statsTab }))
    expect(screen.getByText(o.statsEmpty)).toBeInTheDocument()
  })
})
