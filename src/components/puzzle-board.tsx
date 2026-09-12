import { Chess } from 'chess.js'
import { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { parseUci } from '@/lib/uci'
import type { LichessPuzzle } from '@/types/training'

type Feedback = 'playing' | 'correct' | 'wrong' | 'solved'

const AUTO_MOVE_DELAY_MS = 400
const FEEDBACK_HOLD_MS = 900

interface PuzzleBoardProps {
  puzzle: LichessPuzzle
  onComplete: (result: 'solved' | 'failed', timeSeconds: number) => void
}

export function PuzzleBoard({ puzzle, onComplete }: PuzzleBoardProps) {
  const gameRef = useRef(new Chess())
  const solutionIndexRef = useRef(1)
  const startedAtRef = useRef(0)
  const lockedRef = useRef(false)

  const [fen, setFen] = useState('')
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [feedback, setFeedback] = useState<Feedback>('playing')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const game = new Chess(puzzle.fen)
    const setupMove = parseUci(puzzle.moves[0])
    game.move(setupMove)

    gameRef.current = game
    solutionIndexRef.current = 1
    startedAtRef.current = Date.now()
    lockedRef.current = false
    setFen(game.fen())
    setOrientation(game.turn() === 'w' ? 'white' : 'black')
    setFeedback('playing')
    setElapsed(0)

    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [puzzle])

  function finish(result: 'solved' | 'failed') {
    lockedRef.current = true
    setFeedback(result === 'solved' ? 'solved' : 'wrong')
    const timeSeconds = Math.round((Date.now() - startedAtRef.current) / 1000)
    setTimeout(() => onComplete(result, timeSeconds), FEEDBACK_HOLD_MS)
  }

  function playOpponentReply() {
    const game = gameRef.current
    const nextIndex = solutionIndexRef.current
    if (nextIndex >= puzzle.moves.length) {
      finish('solved')
      return
    }
    game.move(parseUci(puzzle.moves[nextIndex]))
    solutionIndexRef.current = nextIndex + 1
    setFen(game.fen())
    setFeedback('playing')
  }

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }): boolean {
    if (lockedRef.current || !targetSquare) return false

    const game = gameRef.current
    const expectedUci = puzzle.moves[solutionIndexRef.current]
    const promotion =
      expectedUci?.slice(0, 2) === sourceSquare &&
      expectedUci.slice(2, 4) === targetSquare
        ? expectedUci.slice(4, 5) || undefined
        : 'q'

    let move
    try {
      move = game.move({ from: sourceSquare, to: targetSquare, promotion })
    } catch {
      return false
    }

    const isCorrect = move.lan === expectedUci
    if (!isCorrect) {
      game.undo()
      finish('failed')
      return false
    }

    solutionIndexRef.current += 1
    setFen(game.fen())

    if (solutionIndexRef.current >= puzzle.moves.length) {
      finish('solved')
      return true
    }

    setFeedback('correct')
    lockedRef.current = true
    setTimeout(() => {
      lockedRef.current = false
      playOpponentReply()
    }, AUTO_MOVE_DELAY_MS)

    return true
  }

  const turnLabel = orientation === 'white' ? 'Bianco' : 'Nero'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-muted-foreground flex w-full max-w-[480px] items-center justify-between text-xs">
        <span>Rating {puzzle.rating}</span>
        <span>
          {feedback === 'solved'
            ? 'Risolto! 🎉'
            : feedback === 'wrong'
              ? 'Mossa sbagliata'
              : `Muovi con il ${turnLabel}`}
        </span>
        <span>{elapsed}s</span>
      </div>

      <div style={{ width: 'min(90vw, 480px)', aspectRatio: '1 / 1' }}>
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: handlePieceDrop,
            boardOrientation: orientation,
            canDragPiece: ({ piece }) =>
              !lockedRef.current && piece.pieceType[0] === gameRef.current.turn(),
            animationDurationInMs: 200,
            // react-chessboard usa `id` per generare selettori CSS interni
            // (es. `#${id}-square-a1`): un ID CSS non puo' iniziare con una
            // cifra, mentre molti puzzle_id Lichess sì (es. "00rTX").
            id: `puzzle-${puzzle.puzzle_id}`,
          }}
        />
      </div>
    </div>
  )
}
