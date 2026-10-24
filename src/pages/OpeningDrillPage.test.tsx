import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import type { OpeningNode, OpeningProgress } from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'
import OpeningDrillPage, { OPPONENT_DELAY_MS } from './OpeningDrillPage'

const o = openingsTranslations.it
const record = vi.fn()

// Bianco: 1.e4 e5 2.Nf3, un solo Run.
function node(id: number, parent: number | null, ply: number, san: string, uci: string) {
  return { id, parent_id: parent, ply, uci, san, epd: `epd-${id}` } satisfies OpeningNode
}
const repertoire: RepertoireWithNodes = {
  id: 'r1',
  slug: 'italian-game',
  name: 'Italian Game',
  eco: 'C50',
  color: 'w',
  nodes: [
    node(1, null, 1, 'e4', 'e2e4'),
    node(2, 1, 2, 'e5', 'e7e5'),
    node(3, 2, 3, 'Nf3', 'g1f3'),
  ],
}

vi.mock('@/lib/language-context', async () => {
  const { it: italian } = await import('@/lib/i18n/translations')
  return { useTranslations: () => italian, useLanguage: () => ({ language: 'it' }) }
})
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [repertoire], isLoading: false }),
  useOpeningProgress: () => ({ data: new Map<number, OpeningProgress>() }),
  useRecordOpeningMove: () => ({ mutate: record, isError: false }),
}))
vi.mock('@/hooks/use-user-stats', () => ({ useUserStats: () => ({ data: undefined }) }))
// Al posto della scacchiera: la posizione e un pulsante per mossa giocabile.
vi.mock('@/components/opening-board', () => ({
  OpeningBoard: ({
    interactive,
    onMove,
    hintUci,
  }: {
    interactive: boolean
    onMove: (uci: string) => void
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

function renderDrill() {
  render(
    <MemoryRouter initialEntries={['/openings/italian-game']}>
      <Routes>
        <Route path="/openings/:slug" element={<OpeningDrillPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OpeningDrillPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    record.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it('drills a line: first try recorded once, hint after a mistake, opponent replies', () => {
    renderDrill()
    expect(screen.getByRole('status')).toHaveTextContent(o.yourMove)

    // Errore: si registra, compare la freccia della mossa del repertorio.
    fireEvent.click(screen.getByRole('button', { name: 'd2d4' }))
    expect(record).toHaveBeenCalledTimes(1)
    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        nodeId: 1,
        runLeafId: 3,
        playedUci: 'd2d4',
        result: 'wrong',
      }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(o.wrong('e4'))
    expect(screen.getByTestId('board')).toHaveAttribute('data-hint', 'e2e4')

    // La mossa giusta dopo l'errore fa proseguire, senza un secondo tentativo.
    fireEvent.click(screen.getByRole('button', { name: 'e2e4' }))
    expect(record).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent(o.opponentMoving)
    expect(screen.getByRole('button', { name: 'g1f3' })).toBeDisabled()

    act(() => vi.advanceTimersByTime(OPPONENT_DELAY_MS))
    expect(screen.getByRole('status')).toHaveTextContent(o.yourMove)

    fireEvent.click(screen.getByRole('button', { name: 'g1f3' }))
    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({ nodeId: 3, playedUci: 'g1f3', result: 'correct' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(o.runDone)
    expect(screen.getByText(o.runResult(1, 2))).toBeInTheDocument()

    // Si ricomincia: di nuovo la prima mossa.
    fireEvent.click(screen.getByRole('button', { name: o.repeatRun }))
    expect(screen.getByRole('status')).toHaveTextContent(o.yourMove)
  })

  it('shows the repertoire name in the user language', () => {
    renderDrill()
    expect(
      screen.getByRole('heading', { name: o.names['italian-game'] }),
    ).toBeInTheDocument()
  })
})
