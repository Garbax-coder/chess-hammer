import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Button } from '@/components/ui/button'
import { parseUci } from '@/lib/uci'
import type { LichessPuzzle } from '@/types/training'

type Feedback = 'intro' | 'playing' | 'correct' | 'wrong' | 'solved'

const INTRO_DELAY_MS = 500
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
  const playedMovesLenRef = useRef(0)

  const [playedMoves, setPlayedMoves] = useState<string[]>([])
  const [viewIndex, setViewIndex] = useState(0)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [feedback, setFeedback] = useState<Feedback>('intro')
  const [elapsed, setElapsed] = useState(0)

  const isLive = viewIndex === playedMoves.length

  function applyMoveAndAdvanceView(uci: string) {
    gameRef.current.move(parseUci(uci))
    setPlayedMoves((prev) => [...prev, uci])
  }

  useEffect(() => {
    gameRef.current = new Chess(puzzle.fen)
    solutionIndexRef.current = 1
    startedAtRef.current = Date.now()
    lockedRef.current = true
    setPlayedMoves([])
    setViewIndex(0)
    setFeedback('intro')
    setElapsed(0)
    setOrientation(new Chess(puzzle.fen).turn() === 'w' ? 'black' : 'white')

    const introTimer = setTimeout(() => {
      applyMoveAndAdvanceView(puzzle.moves[0])
      lockedRef.current = false
      setFeedback('playing')
    }, INTRO_DELAY_MS)

    const tickInterval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000))
    }, 1000)

    return () => {
      clearTimeout(introTimer)
      clearInterval(tickInterval)
    }
  }, [puzzle])

  useEffect(() => {
    playedMovesLenRef.current = playedMoves.length
    setViewIndex(playedMoves.length)
  }, [playedMoves])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setViewIndex((v) => Math.max(0, v - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setViewIndex((v) => Math.min(playedMovesLenRef.current, v + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const displayFen = useMemo(() => {
    const g = new Chess(puzzle.fen)
    for (let i = 0; i < viewIndex; i++) {
      g.move(parseUci(playedMoves[i]))
    }
    return g.fen()
  }, [puzzle, playedMoves, viewIndex])

  function finish(result: 'solved' | 'failed') {
    lockedRef.current = true
    setFeedback(result === 'solved' ? 'solved' : 'wrong')
    const timeSeconds = Math.round((Date.now() - startedAtRef.current) / 1000)
    setTimeout(() => onComplete(result, timeSeconds), FEEDBACK_HOLD_MS)
  }

  function playOpponentReply() {
    const nextIndex = solutionIndexRef.current
    if (nextIndex >= puzzle.moves.length) {
      finish('solved')
      return
    }
    applyMoveAndAdvanceView(puzzle.moves[nextIndex])
    solutionIndexRef.current = nextIndex + 1
    setFeedback('playing')
  }

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }): boolean {
    if (lockedRef.current || !targetSquare || !isLive) return false

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
    setPlayedMoves((prev) => [...prev, move.lan])

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

  const statusText = !isLive
    ? `Stai rivedendo la mossa ${viewIndex}/${playedMoves.length}`
    : feedback === 'intro'
      ? "L'avversario muove…"
      : feedback === 'solved'
        ? 'Risolto! 🎉'
        : feedback === 'wrong'
          ? 'Mossa sbagliata'
          : `Muovi con il ${turnLabel}`

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-muted-foreground flex w-full max-w-[480px] items-center justify-between text-xs">
        <span>Rating {puzzle.rating}</span>
        <span>{statusText}</span>
        <span>{elapsed}s</span>
      </div>

      <div
        className={`rounded-lg ring-2 transition-all duration-300 ${
          feedback === 'wrong'
            ? 'ring-destructive'
            : feedback === 'solved' || feedback === 'correct'
              ? 'ring-primary/50'
              : 'ring-transparent'
        }`}
        style={{ width: 'min(90vw, 480px)', aspectRatio: '1 / 1' }}
      >
        <Chessboard
          options={{
            position: displayFen,
            onPieceDrop: handlePieceDrop,
            boardOrientation: orientation,
            canDragPiece: ({ piece }) =>
              isLive &&
              !lockedRef.current &&
              piece.pieceType[0] === gameRef.current.turn(),
            animationDurationInMs: 200,
            boardStyle: { borderRadius: '0.5rem', overflow: 'hidden' },
            // react-chessboard usa `id` per generare selettori CSS interni
            // (es. `#${id}-square-a1`): un ID CSS non puo' iniziare con una
            // cifra, mentre molti puzzle_id Lichess sì (es. "00rTX").
            id: `puzzle-${puzzle.puzzle_id}`,
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={viewIndex === 0}
          onClick={() => setViewIndex((v) => Math.max(0, v - 1))}
          aria-label="Mossa precedente"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-muted-foreground w-16 text-center text-xs">
          {viewIndex}/{playedMoves.length}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isLive}
          onClick={() => setViewIndex((v) => Math.min(playedMoves.length, v + 1))}
          aria-label="Mossa successiva"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
