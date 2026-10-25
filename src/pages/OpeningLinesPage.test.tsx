import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  owner_id: null,
  nodes: [
    { id: 1, parent_id: null, ply: 1, uci: 'e2e4', san: 'e4', epd: 'a', is_main: true },
    { id: 2, parent_id: 1, ply: 2, uci: 'e7e5', san: 'e5', epd: 'b', is_main: true },
    { id: 3, parent_id: 2, ply: 3, uci: 'g1f3', san: 'Nf3', epd: 'c', is_main: true },
    { id: 4, parent_id: 1, ply: 2, uci: 'c7c5', san: 'c5', epd: 'd', is_main: true },
    { id: 5, parent_id: 4, ply: 3, uci: 'b1c3', san: 'Nc3', epd: 'e', is_main: true },
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
  useOpeningNames: () => ({
    data: new Map([
      [3, { eco: 'C40', name: "King's Knight Opening" }],
      [4, { eco: 'B20', name: 'Sicilian Defense' }],
    ]),
  }),
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
  beforeEach(() => window.localStorage.clear())

  it('shows the selected move on the board, with its training data', () => {
    renderLines()
    expect(screen.getByText(o.startPosition)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))
    expect(board.fen.startsWith('rnbqkbnr/pppppppp/8/8/4P3/')).toBe(true)
    expect(board.lastMoveUci).toBe('e2e4')
    expect(screen.getByText(o.moveStats(4, 75))).toBeInTheDocument()

    // Sotto la scacchiera, il nome dell'apertura a quel punto.
    fireEvent.click(screen.getByRole('button', { name: '1...c5' }))
    expect(screen.getByText('B20 · Sicilian Defense')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))

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

  it('lists the lines, each to be learned or trained on its own', () => {
    renderLines()
    // Entrambe le linee hanno una mossa mai vista (2.Nf3, 2.Nc3): si studiano.
    const links = screen.getAllByRole('link', { name: o.learnLine })
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/openings/italian-game/learn?line=3',
      '/openings/italian-game/learn?line=5',
    ])
    expect(screen.queryByRole('link', { name: o.trainLine })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1.e4 e5 2.Nf3' })).toBeInTheDocument()
    // Il nome di ogni linea, con il codice ECO.
    expect(screen.getAllByText("King's Knight Opening").length).toBeGreaterThan(0)
    expect(screen.getByText('C40')).toBeInTheDocument()
    expect(screen.getByText('B20')).toBeInTheDocument()
    expect(screen.getAllByText(o.mastered(1, 2))).toHaveLength(2)
  })

  it('hides the variation names in the tree and in the lines, each on its own', () => {
    renderLines()
    // Il nome compare nell'albero (accanto a 2.Nf3) e sopra la linea.
    expect(screen.getAllByText("King's Knight Opening")).toHaveLength(2)
    const [treeSwitch, linesSwitch] = screen.getAllByRole('switch', { name: o.showNames })

    fireEvent.click(treeSwitch)
    expect(screen.getAllByText("King's Knight Opening")).toHaveLength(1)
    expect(screen.getByText('C40')).toBeInTheDocument()

    fireEvent.click(linesSwitch)
    expect(screen.queryByText("King's Knight Opening")).not.toBeInTheDocument()
    expect(screen.queryByText('C40')).not.toBeInTheDocument()

    // La scelta resta per la prossima visita.
    expect(window.localStorage.getItem('openings-tree-names')).toBe('false')
    expect(window.localStorage.getItem('openings-line-names')).toBe('false')
  })
})
