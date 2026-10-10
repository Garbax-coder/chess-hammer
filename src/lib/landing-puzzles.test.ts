import { describe, expect, it } from 'vitest'
import {
  applyTryPuzzleReply,
  FORK_PUZZLE,
  MATE_PUZZLE,
  playTryPuzzleMove,
  positionAfter,
  startTryPuzzle,
} from './landing-puzzles'

describe('landing puzzles', () => {
  it('have legal solutions', () => {
    for (const puzzle of [FORK_PUZZLE, MATE_PUZZLE]) {
      expect(() => positionAfter(puzzle.fen, puzzle.moves)).not.toThrow()
    }
  })

  it('start after the opponent move that sets up the puzzle', () => {
    const state = startTryPuzzle(FORK_PUZZLE)
    expect(state).toEqual({
      fen: positionAfter(FORK_PUZZLE.fen, ['d1e2']),
      next: 1,
      status: 'playing',
    })
  })

  it('marks a wrong move without changing the position', () => {
    const start = startTryPuzzle(FORK_PUZZLE)
    const { state, reply } = playTryPuzzleMove(FORK_PUZZLE, start, 'd8d7')
    expect(reply).toBeNull()
    expect(state).toEqual({ ...start, status: 'wrong' })
  })

  it('lets the visitor retry after a wrong move and solves the whole line', () => {
    let state = playTryPuzzleMove(FORK_PUZZLE, startTryPuzzle(FORK_PUZZLE), 'd8d7').state
    const first = playTryPuzzleMove(FORK_PUZZLE, state, 'd8a5')
    expect(first.state.status).toBe('playing')
    expect(first.reply).toBe('b1d2')

    state = applyTryPuzzleReply(FORK_PUZZLE, first.state)
    expect(state.next).toBe(3)
    expect(state.fen).toBe(positionAfter(FORK_PUZZLE.fen, FORK_PUZZLE.moves.slice(0, 3)))

    const last = playTryPuzzleMove(FORK_PUZZLE, state, 'a5e5')
    expect(last.reply).toBeNull()
    expect(last.state.status).toBe('solved')
    expect(last.state.fen).toBe(positionAfter(FORK_PUZZLE.fen, FORK_PUZZLE.moves))
  })

  it('ignores moves once solved', () => {
    const solved = {
      fen: positionAfter(FORK_PUZZLE.fen, FORK_PUZZLE.moves),
      next: 4,
      status: 'solved' as const,
    }
    expect(playTryPuzzleMove(FORK_PUZZLE, solved, 'a5e5').state).toEqual(solved)
    expect(applyTryPuzzleReply(FORK_PUZZLE, solved)).toEqual(solved)
  })
})
