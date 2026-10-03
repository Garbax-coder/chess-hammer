import { describe, expect, it } from 'vitest'
import {
  evalToWhitePercent,
  formatElapsed,
  formatScore,
  puzzlePgn,
  replayToChess,
} from './chess-format'

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
// Scambio di cavalli avanti e indietro: dopo 4 mosse si torna alla posizione
// di partenza (2a occorrenza), dopo 8 alla 3a — triplice ripetizione.
const KNIGHT_SHUFFLE = ['b1c3', 'b8c6', 'c3b1', 'c6b8']

describe('formatElapsed', () => {
  it('formats seconds as m:ss', () => {
    expect(formatElapsed(5)).toBe('0:05')
    expect(formatElapsed(65)).toBe('1:05')
    expect(formatElapsed(600)).toBe('10:00')
  })

  it('handles zero', () => {
    expect(formatElapsed(0)).toBe('0:00')
  })
})

describe('puzzlePgn', () => {
  it('replays UCI moves from the puzzle FEN into a PGN', () => {
    // Posizione dopo 1.e4: il puzzle dataset dara' qui la mossa successiva.
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    const pgn = puzzlePgn(fen, ['e7e5', 'g1f3'])
    expect(pgn).toContain('e5')
    expect(pgn).toContain('Nf3')
  })

  it('stops silently at the first illegal move instead of throwing', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    expect(() => puzzlePgn(fen, ['e2e4'])).not.toThrow()
  })
})

describe('replayToChess', () => {
  it('reaches the same position as replaying the moves directly', () => {
    const game = replayToChess(START_FEN, ['e2e4', 'e7e5'])
    expect(game.fen()).toBe(
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    )
  })

  it('preserves position history, so isThreefoldRepetition becomes true after a 3rd occurrence', () => {
    const afterOneShuffle = replayToChess(START_FEN, KNIGHT_SHUFFLE)
    expect(afterOneShuffle.isThreefoldRepetition()).toBe(false) // 2nd occurrence only

    const afterTwoShuffles = replayToChess(START_FEN, [...KNIGHT_SHUFFLE, ...KNIGHT_SHUFFLE])
    expect(afterTwoShuffles.isThreefoldRepetition()).toBe(true) // 3rd occurrence
  })

  it('is false for a position reached only once (fresh Chess(fen) could never tell the difference)', () => {
    const game = replayToChess(START_FEN, ['e2e4'])
    expect(game.isThreefoldRepetition()).toBe(false)
  })
})

describe('formatScore', () => {
  it('shows a mate score from the point of view of White', () => {
    expect(formatScore(null, 3, 'w')).toBe('M3')
    expect(formatScore(null, 3, 'b')).toBe('-M3')
  })

  it('formats a centipawn score with sign and one decimal', () => {
    expect(formatScore(140, null, 'w')).toBe('+1.4')
    expect(formatScore(140, null, 'b')).toBe('-1.4')
  })

  it('shows # when the position is already checkmate', () => {
    expect(formatScore(null, null, 'w', true)).toBe('#')
  })

  it('shows a dash when there is nothing to show', () => {
    expect(formatScore(null, null, 'w')).toBe('–')
  })
})

describe('evalToWhitePercent', () => {
  it('is 50 at an even position', () => {
    expect(evalToWhitePercent(0, null, 'w')).toBe(50)
  })

  it('is 0/100 on checkmate depending on who is mated', () => {
    expect(evalToWhitePercent(null, null, 'w', true)).toBe(0)
    expect(evalToWhitePercent(null, null, 'b', true)).toBe(100)
  })

  it('favors White as the centipawn score increases for White to move', () => {
    expect(evalToWhitePercent(500, null, 'w')).toBeGreaterThan(50)
  })

  it('stays within [0, 100]', () => {
    expect(evalToWhitePercent(100000, null, 'w')).toBeLessThanOrEqual(100)
    expect(evalToWhitePercent(-100000, null, 'w')).toBeGreaterThanOrEqual(0)
  })
})
