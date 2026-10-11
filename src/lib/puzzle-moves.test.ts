import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { isAcceptedMove, needsPromotion } from './puzzle-moves'

describe('needsPromotion', () => {
  const game = new Chess('4k3/1P6/8/8/8/8/6P1/4K3 w - - 0 1')

  it('asks for a piece when a pawn can legally promote', () => {
    expect(needsPromotion(game, 'b7', 'b8')).toBe(true)
  })

  it('does not ask when the pawn cannot reach the last rank from there', () => {
    // Pedone in g2 trascinato fino a g8: mossa illegale, nessun selettore.
    expect(needsPromotion(game, 'g2', 'g8')).toBe(false)
    expect(needsPromotion(game, 'b7', 'a8')).toBe(false)
  })

  it('ignores pieces other than pawns and empty squares', () => {
    expect(needsPromotion(game, 'e1', 'e2')).toBe(false)
    expect(needsPromotion(game, 'c3', 'c8')).toBe(false)
  })
})

describe('isAcceptedMove', () => {
  // Due torri possono dare matto sull'ottava traversa: la soluzione e' Td8#.
  const fen = '6k1/5ppp/p7/8/8/8/5PPP/3RR1K1 w - - 0 2'

  function play(from: string, to: string) {
    return new Chess(fen).move({ from, to })
  }

  it('accepts the move of the solution', () => {
    expect(isAcceptedMove(play('d1', 'd8'), 'd1d8')).toBe(true)
  })

  it('accepts another move that gives checkmate', () => {
    expect(isAcceptedMove(play('e1', 'e8'), 'd1d8')).toBe(true)
  })

  it('rejects other moves, even checks', () => {
    expect(isAcceptedMove(play('e1', 'e7'), 'd1d8')).toBe(false)
    expect(isAcceptedMove(play('d1', 'd7'), 'd1d8')).toBe(false)
  })
})
