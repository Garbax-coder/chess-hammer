import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ARROW_COLORS } from '@/lib/opening-arrows'
import { OpeningBoard } from './opening-board'

// react-chessboard sostituita da un segnaposto che conserva le opzioni: qui
// conta come la scacchiera risponde al rilascio di un pezzo.
interface BoardOptions {
  onPieceDrop: (args: { sourceSquare: string; targetSquare: string | null }) => boolean
  onSquareClick: (args: { square: string; piece: unknown }) => void
  onArrowsChange: (args: {
    arrows: { startSquare: string; endSquare: string; color: string }[]
  }) => void
}
let options: BoardOptions
vi.mock('react-chessboard', () => ({
  Chessboard: (props: { options: BoardOptions }) => {
    options = props.options
    return null
  },
}))

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

describe('OpeningBoard', () => {
  it('keeps an accepted drop where it was left, so the move is not animated twice', () => {
    const onMove = vi.fn(() => true)
    render(<OpeningBoard fen={START} orientation="white" interactive onMove={onMove} />)

    expect(options.onPieceDrop({ sourceSquare: 'g1', targetSquare: 'f3' })).toBe(true)
    expect(onMove).toHaveBeenCalledWith('g1f3')
  })

  it('sends a rejected or illegal drop back to its square', () => {
    const onMove = vi.fn(() => false)
    render(<OpeningBoard fen={START} orientation="white" interactive onMove={onMove} />)

    expect(options.onPieceDrop({ sourceSquare: 'd2', targetSquare: 'd4' })).toBe(false)
    expect(onMove).toHaveBeenCalledWith('d2d4')
    onMove.mockClear()
    expect(options.onPieceDrop({ sourceSquare: 'g1', targetSquare: 'g3' })).toBe(false)
    expect(onMove).not.toHaveBeenCalled()
  })

  it('plays a move with two clicks, and ignores input when it is not the user turn', () => {
    const onMove = vi.fn(() => true)
    const { rerender } = render(
      <OpeningBoard fen={START} orientation="white" interactive onMove={onMove} />,
    )
    act(() => options.onSquareClick({ square: 'e2', piece: null }))
    act(() => options.onSquareClick({ square: 'e4', piece: null }))
    expect(onMove).toHaveBeenCalledWith('e2e4')

    onMove.mockClear()
    rerender(
      <OpeningBoard
        fen={START}
        orientation="white"
        interactive={false}
        onMove={onMove}
      />,
    )
    expect(options.onPieceDrop({ sourceSquare: 'g1', targetSquare: 'f3' })).toBe(false)
    expect(onMove).not.toHaveBeenCalled()
  })

  it('hands over an arrow drawn with the right button, and shows the saved ones', () => {
    const onArrowDrawn = vi.fn()
    const { container } = render(
      <OpeningBoard
        fen={START}
        orientation="black"
        interactive={false}
        onMove={() => false}
        savedArrows={[{ from: 'g1', to: 'f3', color: 'G' }]}
        onArrowDrawn={onArrowDrawn}
      />,
    )
    expect(container.querySelector('[data-arrow="Gg1f3"]')).not.toBeNull()

    act(() => options.onArrowsChange({ arrows: [] }))
    expect(onArrowDrawn).not.toHaveBeenCalled()
    act(() =>
      options.onArrowsChange({
        arrows: [{ startSquare: 'd1', endSquare: 'h5', color: ARROW_COLORS.R }],
      }),
    )
    expect(onArrowDrawn).toHaveBeenCalledWith({ from: 'd1', to: 'h5', color: 'R' })
  })
})
