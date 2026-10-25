import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { OpeningProgress } from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'
import OpeningLinesPage from './OpeningLinesPage'

const o = openingsTranslations.it

// Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nc3 (Run 5).
const repertoire: RepertoireWithNodes = {
  id: 'r1',
  slug: 'italian-game',
  name: 'Italian Game',
  eco: 'C50',
  color: 'w',
  nodes: [
    { id: 1, parent_id: null, ply: 1, uci: 'e2e4', san: 'e4', epd: 'a' },
    { id: 2, parent_id: 1, ply: 2, uci: 'e7e5', san: 'e5', epd: 'b' },
    { id: 3, parent_id: 2, ply: 3, uci: 'g1f3', san: 'Nf3', epd: 'c' },
    { id: 4, parent_id: 1, ply: 2, uci: 'c7c5', san: 'c5', epd: 'd' },
    { id: 5, parent_id: 4, ply: 3, uci: 'b1c3', san: 'Nc3', epd: 'e' },
  ],
}
const e4: OpeningProgress = {
  node_id: 1,
  attempts: 4,
  first_try_correct: 3,
  streak: 3,
  last_seen_at: '2026-10-24T10:00:00Z',
  due_at: '2099-01-01T00:00:00Z',
}
let board: { fen: string; lastMoveUci?: string }

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
  useLanguage: () => ({ language: 'it' }),
}))
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [repertoire], isLoading: false }),
  useOpeningProgress: () => ({ data: new Map([[1, e4]]) }),
}))
vi.mock('@/hooks/use-user-stats', () => ({ useUserStats: () => ({ data: undefined }) }))
vi.mock('@/components/opening-board', () => ({
  OpeningBoard: (props: { fen: string; lastMoveUci?: string }) => {
    board = props
    return null
  },
}))

function renderLines() {
  render(
    <MemoryRouter initialEntries={['/openings/italian-game/lines']}>
      <Routes>
        <Route path="/openings/:slug/lines" element={<OpeningLinesPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OpeningLinesPage', () => {
  it('shows the selected move on the board, with its training data', () => {
    renderLines()
    expect(screen.getByText(o.startPosition)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))
    expect(board.fen.startsWith('rnbqkbnr/pppppppp/8/8/4P3/')).toBe(true)
    expect(board.lastMoveUci).toBe('e2e4')
    expect(screen.getByText(o.moveStats(4, 75))).toBeInTheDocument()

    // Avanti segue il primo ramo; indietro torna alla mossa precedente.
    fireEvent.click(
      screen.getByRole('button', { name: itTranslations.puzzleBoard.nextMove }),
    )
    expect(board.lastMoveUci).toBe('e7e5')
    expect(screen.getByText(o.opponentMove, { exact: false })).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: itTranslations.puzzleBoard.prevMove }),
    )
    expect(board.lastMoveUci).toBe('e2e4')
  })

  it('lists the lines, each to be trained on its own', () => {
    renderLines()
    const links = screen.getAllByRole('link', { name: o.trainLine })
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/openings/italian-game?line=3',
      '/openings/italian-game?line=5',
    ])
    expect(screen.getByRole('button', { name: '1.e4 e5 2.Nf3' })).toBeInTheDocument()
    expect(screen.getAllByText(o.mastered(1, 2))).toHaveLength(2)
  })
})
