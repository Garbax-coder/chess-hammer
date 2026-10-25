import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import type { OpeningProgress } from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'
import { OpeningsOverviewCard } from './openings-overview-card'

const o = openingsTranslations.it

// Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nc3 (Run 5).
function repertoire(id: string, slug: string): RepertoireWithNodes {
  const n = (k: number) => Number(`${id.slice(1)}${k}`)
  return {
    id,
    slug,
    name: slug,
    eco: null,
    color: 'w',
    owner_id: null,
    nodes: [
      {
        id: n(1),
        parent_id: null,
        ply: 1,
        uci: 'e2e4',
        san: 'e4',
        epd: 'a',
        is_main: true,
      },
      {
        id: n(2),
        parent_id: n(1),
        ply: 2,
        uci: 'e7e5',
        san: 'e5',
        epd: 'b',
        is_main: true,
      },
      {
        id: n(3),
        parent_id: n(2),
        ply: 3,
        uci: 'g1f3',
        san: 'Nf3',
        epd: 'c',
        is_main: true,
      },
      {
        id: n(4),
        parent_id: n(1),
        ply: 2,
        uci: 'c7c5',
        san: 'c5',
        epd: 'd',
        is_main: true,
      },
      {
        id: n(5),
        parent_id: n(4),
        ply: 3,
        uci: 'b1c3',
        san: 'Nc3',
        epd: 'e',
        is_main: true,
      },
    ],
  }
}
const italian = repertoire('r1', 'italian-game')
const queens = repertoire('r2', 'queens-gambit')
const hiddenOne = repertoire('r3', 'caro-kann')
// 1.e4 dell'Italiana da ripassare.
const due: OpeningProgress = {
  node_id: 11,
  attempts: 2,
  first_try_correct: 2,
  streak: 2,
  last_seen_at: '2026-10-20T10:00:00Z',
  due_at: '2026-10-21T10:00:00Z',
}
let progress = new Map<number, OpeningProgress>()

vi.mock('@/lib/language-context', () => ({ useLanguage: () => ({ language: 'it' }) }))
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [italian, queens, hiddenOne] }),
  useOpeningProgress: () => ({ data: progress }),
  useHiddenRepertoires: () => ({ data: new Set(['r3']) }),
}))

function renderCard() {
  render(
    <MemoryRouter>
      <OpeningsOverviewCard />
    </MemoryRouter>,
  )
}

describe('OpeningsOverviewCard', () => {
  it('sums up the library, without the removed repertoires, and starts from the moves due', () => {
    progress = new Map([[11, due]])
    renderCard()
    expect(screen.getByText(o.dashboardSummary(2, 4))).toBeInTheDocument()
    expect(screen.getByText(o.mastered(0, 6))).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: o.dashboardReview('Partita Italiana') }),
    ).toHaveAttribute('href', '/openings/italian-game')
    expect(screen.getByRole('link', { name: o.dashboardOpen })).toHaveAttribute(
      'href',
      '/openings',
    )
  })

  it('suggests learning when nothing is due', () => {
    progress = new Map()
    renderCard()
    expect(screen.getByRole('link', { name: /^Studia / })).toBeInTheDocument()
  })
})
