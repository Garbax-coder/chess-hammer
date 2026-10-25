import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import type { OpeningNode, OpeningProgress } from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'
import OpeningLearnPage from './OpeningLearnPage'

const o = openingsTranslations.it
const learn = vi.fn()
let progress = new Map<number, OpeningProgress>()

// Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nc3 (Run 5).
function node(id: number, parent: number | null, ply: number, san: string, uci: string) {
  return {
    id,
    parent_id: parent,
    ply,
    uci,
    san,
    epd: `epd-${id}`,
    is_main: true,
  } satisfies OpeningNode
}
const repertoire: RepertoireWithNodes = {
  id: 'r1',
  slug: 'italian-game',
  name: 'Italian Game',
  eco: 'C50',
  color: 'w',
  owner_id: null,
  nodes: [
    node(1, null, 1, 'e4', 'e2e4'),
    node(2, 1, 2, 'e5', 'e7e5'),
    node(3, 2, 3, 'Nf3', 'g1f3'),
    node(4, 1, 2, 'c5', 'c7c5'),
    { ...node(5, 4, 3, 'Nc3', 'b1c3'), comment: 'Dal PGN: sviluppo' },
  ],
}
function learned(nodeId: number): OpeningProgress {
  return {
    node_id: nodeId,
    attempts: 0,
    first_try_correct: 0,
    streak: 0,
    last_seen_at: '2026-10-25T10:00:00Z',
    due_at: '2026-10-25T14:00:00Z',
  }
}

vi.mock('@/lib/language-context', async () => {
  const { it: italian } = await import('@/lib/i18n/translations')
  return { useTranslations: () => italian, useLanguage: () => ({ language: 'it' }) }
})
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [repertoire], isLoading: false }),
  useOpeningProgress: () => ({ data: progress }),
  useOpeningNames: () => ({
    data: new Map([[3, { eco: 'C40', name: "King's Knight Opening" }]]),
  }),
  useLearnOpeningMove: () => ({ mutate: learn, isError: false }),
  useOpeningNotes: () => ({ data: new Map([[1, 'Il centro, subito']]) }),
}))
vi.mock('@/hooks/use-user-stats', () => ({ useUserStats: () => ({ data: undefined }) }))
vi.mock('@/components/opening-board', () => ({
  OPPONENT_DELAY_MS: 500,
  OpeningBoard: ({
    interactive,
    onMove,
    hintUci,
  }: {
    interactive: boolean
    onMove: (uci: string) => boolean
    hintUci?: string
  }) => (
    <div data-testid="board" data-hint={hintUci ?? ''}>
      {['e2e4', 'd2d4', 'g1f3', 'b1c3'].map((uci) => (
        <button
          key={uci}
          type="button"
          disabled={!interactive}
          onClick={() => onMove(uci)}
        >
          {uci}
        </button>
      ))}
    </div>
  ),
}))

function renderLearn(path = '/openings/italian-game/learn') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/openings/:slug/learn" element={<OpeningLearnPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OpeningLearnPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    learn.mockReset()
    progress = new Map()
  })
  afterEach(() => vi.useRealTimers())

  it('guides the user through the first line with new moves', () => {
    renderLearn()
    // Quale linea, rispetto a tutte e a quelle ancora da studiare.
    expect(screen.getByText(`${o.lineOf(1, 2)} · ${o.toLearn(2)}`)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(o.playMove('1.e4'))
    expect(screen.getByTestId('board')).toHaveAttribute('data-hint', 'e2e4')

    // Un'altra mossa non passa e non si registra: si segue la freccia.
    fireEvent.click(screen.getByRole('button', { name: 'd2d4' }))
    expect(learn).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(o.followArrow('1.e4'))

    fireEvent.click(screen.getByRole('button', { name: 'e2e4' }))
    expect(learn).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('status')).toHaveTextContent(o.opponentMoving)

    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByRole('status')).toHaveTextContent(o.playMove('2.Nf3'))

    // "Gioca la mossa": la gioca l'app, e conta come studiata.
    fireEvent.click(screen.getByRole('button', { name: o.playForMe }))
    expect(learn).toHaveBeenLastCalledWith(3)
    expect(screen.getByRole('status')).toHaveTextContent(o.lineLearned)
    expect(screen.getByText("King's Knight Opening")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: o.trainLine })).toHaveAttribute(
      'href',
      '/openings/italian-game?line=3',
    )

    // La prossima linea con mosse nuove, non di nuovo questa.
    fireEvent.click(screen.getByRole('button', { name: o.learnNext }))
    fireEvent.click(screen.getByRole('button', { name: 'e2e4' }))
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByRole('status')).toHaveTextContent(o.playMove('2.Nc3'))
  })

  it('stays available when every line has been learned, as a review', () => {
    progress = new Map([1, 3, 5].map((id) => [id, learned(id)]))
    renderLearn()
    expect(screen.getByText(o.allLearnedReview)).toBeInTheDocument()
    expect(screen.getByText(`${o.lineOf(1, 2)} · ${o.toLearn(0)}`)).toBeInTheDocument()
    // Si ripassa la prima linea (con l'avanzamento rapido, dall'ultima mossa).
    expect(screen.getByRole('status')).toHaveTextContent(o.playMove('2.Nf3'))
    fireEvent.click(screen.getByRole('button', { name: 'g1f3' }))
    // Finita, si passa alla successiva nell'ordine dell'albero.
    fireEvent.click(screen.getByRole('button', { name: o.nextRun }))
    expect(screen.getByText(`${o.lineOf(2, 2)} · ${o.toLearn(0)}`)).toBeInTheDocument()
  })

  it('opens the line chosen from the browse page, skipping the moves already known', () => {
    progress = new Map([1, 3, 5].map((id) => [id, learned(id)]))
    renderLearn('/openings/italian-game/learn?line=5')
    // Avanzamento rapido: 1.e4 c5 si giocano da sole, resta l'ultima mossa.
    expect(screen.getByRole('status')).toHaveTextContent(o.playMove('2.Nc3'))
  })

  it('plays the whole line when fast-forward is off', () => {
    window.localStorage.setItem('openings-fast-forward', 'false')
    progress = new Map([1, 3, 5].map((id) => [id, learned(id)]))
    renderLearn('/openings/italian-game/learn?line=5')
    expect(screen.getByRole('status')).toHaveTextContent(o.playMove('1.e4'))
    window.localStorage.removeItem('openings-fast-forward')
  })

  it('shows the comment of the move just played', () => {
    renderLearn('/openings/italian-game/learn?line=5')
    expect(screen.queryByText('Il centro, subito')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'e2e4' }))
    // La nota personale su 1.e4.
    expect(screen.getByText('Il centro, subito')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(500))
    fireEvent.click(screen.getByRole('button', { name: 'b1c3' }))
    // Il commento del PGN su 2.Nc3.
    expect(screen.getByText('Dal PGN: sviluppo')).toBeInTheDocument()
  })
})
