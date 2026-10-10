import { Chess } from 'chess.js'
import { parseUci } from '@/lib/uci'

// Puzzle reali dal database Lichess (CC0) mostrati nelle pagine pubbliche.
// Come in Lichess, moves[0] e' la mossa dell'avversario che apre il puzzle.
export interface LandingPuzzle {
  id: string
  fen: string
  moves: string[]
}

export const FORK_PUZZLE: LandingPuzzle = {
  id: 'rdJxO',
  fen: 'rn1qkb1r/pp3ppp/2p2n2/4N3/4P3/3P4/PPP1b1PP/RNBQK2R w KQkq - 0 8',
  moves: ['d1e2', 'd8a5', 'b1d2', 'a5e5'],
}

export const MATE_PUZZLE: LandingPuzzle = {
  id: 'dAcEd',
  fen: 'rn1q1r1k/ppB1N1pp/2p2p2/2bp3Q/4R3/2N5/PPP3PP/5b1K b - - 1 19',
  moves: ['d8c7', 'h5h7', 'h8h7', 'e4h4'],
}

export function positionAfter(fen: string, uciMoves: string[]): string {
  const game = new Chess(fen)
  for (const uci of uciMoves) game.move(parseUci(uci))
  return game.fen()
}

export type TryPuzzleStatus = 'playing' | 'wrong' | 'solved'

export interface TryPuzzleState {
  fen: string
  // Indice in moves della prossima mossa attesa dal visitatore.
  next: number
  status: TryPuzzleStatus
}

export function startTryPuzzle(puzzle: LandingPuzzle): TryPuzzleState {
  return {
    fen: positionAfter(puzzle.fen, puzzle.moves.slice(0, 1)),
    next: 1,
    status: 'playing',
  }
}

// Mossa del visitatore: se e' quella attesa la gioca e restituisce la
// risposta dell'avversario da mostrare dopo (null se il puzzle e' finito).
export function playTryPuzzleMove(
  puzzle: LandingPuzzle,
  state: TryPuzzleState,
  uci: string,
): { state: TryPuzzleState; reply: string | null } {
  if (state.status === 'solved' || uci !== puzzle.moves[state.next]) {
    return {
      state: { ...state, status: state.status === 'solved' ? 'solved' : 'wrong' },
      reply: null,
    }
  }
  const fen = positionAfter(state.fen, [uci])
  const reply = puzzle.moves[state.next + 1] ?? null
  return {
    state: { fen, next: state.next + 1, status: reply ? 'playing' : 'solved' },
    reply,
  }
}

export function applyTryPuzzleReply(
  puzzle: LandingPuzzle,
  state: TryPuzzleState,
): TryPuzzleState {
  const reply = puzzle.moves[state.next]
  if (!reply) return state
  const next = state.next + 1
  return {
    fen: positionAfter(state.fen, [reply]),
    next,
    status: next >= puzzle.moves.length ? 'solved' : 'playing',
  }
}
