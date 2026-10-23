import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { makeLichessPuzzle } from '@/test/fixtures'
import { PuzzleBoard } from './puzzle-board'

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-stockfish-analysis', () => ({
  useStockfishAnalysis: () => ({ lines: [], analyzing: false }),
}))
vi.mock('@/lib/sound-effects', () => ({
  playMoveSound: () => {},
  playIllegalMoveSound: () => {},
}))

// react-chessboard misura le case per calcolare le animazioni (e lancia un
// errore se la larghezza e' 0, come in jsdom senza layout).
const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect
beforeEach(() => {
  vi.useFakeTimers()
  HTMLElement.prototype.getBoundingClientRect = () =>
    ({
      width: 50,
      height: 50,
      top: 0,
      left: 0,
      right: 50,
      bottom: 50,
      x: 0,
      y: 0,
      toJSON() {},
    }) as DOMRect
})
afterEach(() => {
  vi.useRealTimers()
  HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect
})

function animatedPieces(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('[data-piece]')].filter(
    (el) => el.style.transform,
  )
}

describe('PuzzleBoard', () => {
  it('does not animate pieces of a new puzzle with moves left over from the previous one', () => {
    // Puzzle precedente: risolutore bianco. Il successivo: risolutore nero
    // (scacchiera girata) con una donna proprio sulla casa che la torre del
    // precedente "lascia" (a1 -> b2 nel calcolo della libreria). Senza un
    // board nuovo per ogni puzzle, quella donna scivolava di una casa e
    // tornava indietro prima della vera mossa d'apertura.
    const previous = makeLichessPuzzle({
      fen: '4k3/8/8/8/8/8/8/R3K3 b - - 0 1',
      moves: ['e8d8'],
    })
    const next = makeLichessPuzzle({
      fen: '4k3/8/8/8/8/8/1R6/Q3K3 w - - 0 1',
      moves: ['a1a2'],
    })
    const props = { autoAdvance: true, onComplete: () => {}, onAdvance: () => {} }

    const { container, rerender } = render(<PuzzleBoard puzzle={previous} {...props} />)
    act(() => rerender(<PuzzleBoard puzzle={next} {...props} />))

    expect(animatedPieces(container)).toEqual([])

    // La mossa d'apertura dell'avversario, invece, si anima normalmente.
    act(() => vi.advanceTimersByTime(500))
    expect(animatedPieces(container).map((el) => el.dataset.piece)).toEqual(['wQ'])
  })

  describe('marking squares with the right mouse button', () => {
    const puzzle = makeLichessPuzzle({
      fen: '6k1/p4ppp/8/8/8/8/5PPP/3RR1K1 b - - 0 1',
      moves: ['a7a6', 'd1d8'],
    })
    const ORANGE = 'rgba(249, 115, 22, 0.7)'

    // react-chessboard applica squareStyles a un livello dentro la casa
    // (sopra il colore della scacchiera), non alla casa stessa.
    function renderBoard() {
      const { container } = render(
        <PuzzleBoard
          puzzle={puzzle}
          autoAdvance={false}
          onComplete={() => {}}
          onAdvance={() => {}}
        />,
      )
      act(() => vi.advanceTimersByTime(2000))
      const square = (name: string) =>
        container.querySelector<HTMLElement>(`[data-square="${name}"]`)!
      const color = (name: string) =>
        square(name).querySelector<HTMLElement>(':scope > div')?.style.backgroundColor
      return { square, color }
    }

    it('turns a square orange and back with a second right click', () => {
      const { square, color } = renderBoard()

      act(() => {
        fireEvent.contextMenu(square('e4'))
      })
      expect(color('e4')).toBe(ORANGE)
      expect(color('d4')).not.toBe(ORANGE)

      act(() => {
        fireEvent.contextMenu(square('e4'))
      })
      expect(color('e4')).not.toBe(ORANGE)
    })

    it('marks several squares and clears them all with a left click', () => {
      const { square, color } = renderBoard()

      act(() => {
        fireEvent.contextMenu(square('e4'))
      })
      act(() => {
        fireEvent.contextMenu(square('c6'))
      })
      expect(color('e4')).toBe(ORANGE)
      expect(color('c6')).toBe(ORANGE)

      act(() => {
        fireEvent.click(square('h4'))
      })
      expect(color('e4')).not.toBe(ORANGE)
      expect(color('c6')).not.toBe(ORANGE)
    })
  })

  describe('solving by clicking squares', () => {
    // Il nero apre con a7-a6, poi il bianco ha due matti: Td8# (soluzione) e Te8#.
    const puzzle = makeLichessPuzzle({
      fen: '6k1/p4ppp/8/8/8/8/5PPP/3RR1K1 b - - 0 1',
      moves: ['a7a6', 'd1d8'],
    })

    function playAfterOpening(from: string, to: string) {
      const onComplete = vi.fn()
      const { container } = render(
        <PuzzleBoard
          puzzle={puzzle}
          autoAdvance={false}
          onComplete={onComplete}
          onAdvance={() => {}}
        />,
      )
      act(() => vi.advanceTimersByTime(2000))
      const square = (name: string) => container.querySelector(`[data-square="${name}"]`)!
      act(() => {
        fireEvent.click(square(from))
      })
      act(() => {
        fireEvent.click(square(to))
      })
      return onComplete
    }

    it('counts the solution move as solved', () => {
      expect(playAfterOpening('d1', 'd8')).toHaveBeenCalledWith(
        'solved',
        expect.any(Number),
      )
    })

    it('counts a different checkmate as solved', () => {
      expect(playAfterOpening('e1', 'e8')).toHaveBeenCalledWith(
        'solved',
        expect.any(Number),
      )
    })

    it('still fails a move that is not the solution nor a mate', () => {
      expect(playAfterOpening('e1', 'e7')).toHaveBeenCalledWith(
        'failed',
        expect.any(Number),
      )
    })
  })
})
