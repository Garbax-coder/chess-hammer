import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import type { OpeningProgress } from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'
import OpeningsPage from './OpeningsPage'

const o = openingsTranslations.it

// Nero: 1.e4 c6 (Run 2) oppure 1.d4 d5 (Run 4).
const repertoire: RepertoireWithNodes = {
  id: 'r1',
  slug: 'caro-kann',
  name: 'Caro-Kann Defence',
  eco: 'B12',
  color: 'b',
  nodes: [
    { id: 1, parent_id: null, ply: 1, uci: 'e2e4', san: 'e4', epd: 'a' },
    { id: 2, parent_id: 1, ply: 2, uci: 'c7c6', san: 'c6', epd: 'b' },
    { id: 3, parent_id: null, ply: 1, uci: 'd2d4', san: 'd4', epd: 'c' },
    { id: 4, parent_id: 3, ply: 2, uci: 'd7d5', san: 'd5', epd: 'd' },
  ],
}
const mastered: OpeningProgress = {
  node_id: 2,
  attempts: 3,
  first_try_correct: 3,
  streak: 3,
  last_seen_at: '2026-10-24T10:00:00Z',
  due_at: '2099-01-01T00:00:00Z',
}

vi.mock('@/lib/language-context', async () => {
  const { it: italian } = await import('@/lib/i18n/translations')
  return { useTranslations: () => italian, useLanguage: () => ({ language: 'it' }) }
})
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [repertoire], isLoading: false }),
  useOpeningProgress: () => ({ data: new Map([[2, mastered]]) }),
}))

describe('OpeningsPage', () => {
  it('lists the repertoires with their coverage and a link to train', () => {
    render(
      <MemoryRouter>
        <OpeningsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(o.names['caro-kann'])).toBeInTheDocument()
    expect(screen.getByText(`${o.color.b} · ${o.runs(2)}`)).toBeInTheDocument()
    expect(
      screen.getByText(`${o.mastered(1, 2)} · ${o.runsMastered(1, 2)}`),
    ).toBeInTheDocument()
    expect(screen.getByText(`${o.due(0)} · ${o.newMoves(1)}`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: o.train })).toHaveAttribute(
      'href',
      '/openings/caro-kann',
    )
  })
})
