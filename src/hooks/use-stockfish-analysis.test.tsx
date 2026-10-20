import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useStockfishAnalysis } from './use-stockfish-analysis'

const analyze = vi.fn()
vi.mock('@/lib/stockfish-engine', () => ({
  stockfishEngine: {
    analyze: (...args: unknown[]) => analyze(...args),
    stopListening: () => {},
  },
}))

const START = '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1'
const options = { multiPv: 3, depth: 16, enabled: true }

describe('useStockfishAnalysis', () => {
  beforeEach(() => analyze.mockReset())

  it('passes the move history to the engine', () => {
    renderHook(() =>
      useStockfishAnalysis({ fen: START, moves: ['d1d8', 'g8h7'] }, options),
    )
    expect(analyze).toHaveBeenCalledTimes(1)
    expect(analyze.mock.calls[0][0]).toEqual({ fen: START, moves: ['d1d8', 'g8h7'] })
  })

  it('restarts only when the position or its moves change', () => {
    const { rerender } = renderHook(
      ({ moves }: { moves: string[] }) =>
        useStockfishAnalysis({ fen: START, moves }, options),
      { initialProps: { moves: ['d1d8'] } },
    )
    // Nuovo oggetto, stesse mosse: nessuna nuova analisi.
    rerender({ moves: ['d1d8'] })
    expect(analyze).toHaveBeenCalledTimes(1)

    rerender({ moves: ['d1d8', 'g8h7'] })
    expect(analyze).toHaveBeenCalledTimes(2)
    expect(analyze.mock.calls[1][0].moves).toEqual(['d1d8', 'g8h7'])
  })

  it('does not analyse when disabled or without a position', () => {
    renderHook(() => useStockfishAnalysis(null, options))
    renderHook(() =>
      useStockfishAnalysis({ fen: START, moves: [] }, { ...options, enabled: false }),
    )
    expect(analyze).not.toHaveBeenCalled()
  })
})
