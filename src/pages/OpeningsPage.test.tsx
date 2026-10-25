import { fireEvent, render, screen } from '@testing-library/react'
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
  owner_id: null,
  nodes: [
    { id: 1, parent_id: null, ply: 1, uci: 'e2e4', san: 'e4', epd: 'a', is_main: true },
    { id: 2, parent_id: 1, ply: 2, uci: 'c7c6', san: 'c6', epd: 'b', is_main: true },
    { id: 3, parent_id: null, ply: 1, uci: 'd2d4', san: 'd4', epd: 'c', is_main: true },
    { id: 4, parent_id: 3, ply: 2, uci: 'd7d5', san: 'd5', epd: 'd', is_main: true },
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
const deleteRepertoire = vi.fn()
let repertoires = [repertoire]
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: repertoires, isLoading: false }),
  useDeleteRepertoire: () => ({ mutate: deleteRepertoire, isPending: false }),
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

  it('marks the personal repertoires and deletes one after a confirmation', () => {
    repertoires = [
      repertoire,
      { ...repertoire, id: 'r2', slug: 'u-abc', name: 'My Caro', owner_id: 'u1' },
    ]
    render(
      <MemoryRouter>
        <OpeningsPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: o.importPgn })).toHaveAttribute(
      'href',
      '/openings/import',
    )
    expect(screen.getByRole('link', { name: o.ecoButton })).toHaveAttribute(
      'href',
      '/openings/eco',
    )
    expect(screen.getAllByText(o.personal)).toHaveLength(1)
    // Solo il repertorio personale si puo' eliminare, e prima si conferma.
    fireEvent.click(screen.getByRole('button', { name: o.deleteRepertoire }))
    expect(deleteRepertoire).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: o.confirmDelete }))
    expect(deleteRepertoire).toHaveBeenCalledWith('r2')
    repertoires = [repertoire]
  })
})
