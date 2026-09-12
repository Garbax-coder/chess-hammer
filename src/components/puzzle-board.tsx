import { Chess, type Square } from 'chess.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import { Button } from '@/components/ui/button'
import { parseUci } from '@/lib/uci'
import type { LichessPuzzle } from '@/types/training'

type Feedback = 'intro' | 'playing' | 'correct' | 'wrong' | 'solved'

const INTRO_DELAY_MS = 500
const AUTO_MOVE_DELAY_MS = 400
const FEEDBACK_HOLD_MS = 900
const WRONG_SQUARE_STYLE = { backgroundColor: 'rgba(220, 38, 38, 0.55)' }
const SELECTED_SQUARE_STYLE = { backgroundColor: 'rgba(59, 130, 246, 0.35)' }
const MOVE_HINT_STYLE = {
  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.22) 22%, transparent 24%)',
}
const CAPTURE_HINT_STYLE = { boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.22)' }

// Riferimento stabile (non un nuovo [] ad ogni render) da usare come
// playedMoves "effettivo" nel render in cui il puzzle e' appena cambiato.
const EMPTY_MOVES: string[] = []

interface PendingCompletion {
  result: 'solved' | 'failed'
  timeSeconds: number
}

interface SquareSelection {
  square: string
  targets: { to: string; capture: boolean }[]
}

interface PuzzleBoardProps {
  puzzle: LichessPuzzle
  autoAdvance: boolean
  onComplete: (result: 'solved' | 'failed', timeSeconds: number) => void
}

export function PuzzleBoard({ puzzle, autoAdvance, onComplete }: PuzzleBoardProps) {
  const gameRef = useRef(new Chess())
  const solutionIndexRef = useRef(1)
  const startedAtRef = useRef(0)
  const lockedRef = useRef(false)
  const playedMovesLenRef = useRef(0)
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoAdvanceRef = useRef(autoAdvance)
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance
  }, [autoAdvance])

  const [playedMoves, setPlayedMoves] = useState<string[]>([])
  const [viewIndex, setViewIndex] = useState(0)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [feedback, setFeedback] = useState<Feedback>('intro')
  const [elapsed, setElapsed] = useState(0)
  const [loadedPuzzleId, setLoadedPuzzleId] = useState(puzzle.puzzle_id)
  const [wrongMove, setWrongMove] = useState<{ fen: string; square: string } | null>(null)
  const [pendingCompletion, setPendingCompletion] = useState<PendingCompletion | null>(
    null,
  )
  const [selection, setSelection] = useState<SquareSelection | null>(null)

  // Quando il puzzle cambia, playedMoves/viewIndex non sono ancora stati
  // azzerati (lo state aggiornato da una setState chiamata qui durante il
  // render non e' visibile nelle costanti locali di QUESTA stessa
  // esecuzione: serve comunque un nuovo render). Calcoliamo quindi dei
  // valori "effettivi" che riflettono gia' il reset imminente, cosi'
  // displayFen qui sotto non rigioca le mosse del puzzle precedente su una
  // FEN che non le supporta (altrimenti: mossa non valida, crash). Le
  // chiamate setState servono solo a far "mettere al passo" lo stato reale
  // per il prossimo render (bottoni, contatori, ecc.).
  const isNewPuzzle = puzzle.puzzle_id !== loadedPuzzleId
  if (isNewPuzzle) {
    setLoadedPuzzleId(puzzle.puzzle_id)
    setPlayedMoves([])
    setViewIndex(0)
    setFeedback('intro')
    setElapsed(0)
    setOrientation(new Chess(puzzle.fen).turn() === 'w' ? 'black' : 'white')
    setWrongMove(null)
    setPendingCompletion(null)
    setSelection(null)
  }
  const effectivePlayedMoves = isNewPuzzle ? EMPTY_MOVES : playedMoves
  const effectiveViewIndex = isNewPuzzle ? 0 : viewIndex
  const effectiveWrongMove = isNewPuzzle ? null : wrongMove

  const isLive = effectiveViewIndex === effectivePlayedMoves.length

  function navigateView(next: number) {
    setWrongMove(null)
    setSelection(null)
    setViewIndex(next)
  }

  function applyMoveAndAdvanceView(uci: string) {
    gameRef.current.move(parseUci(uci))
    setPlayedMoves((prev) => [...prev, uci])
    setSelection(null)
  }

  useEffect(() => {
    gameRef.current = new Chess(puzzle.fen)
    solutionIndexRef.current = 1
    startedAtRef.current = Date.now()
    lockedRef.current = true

    const introTimer = setTimeout(() => {
      applyMoveAndAdvanceView(puzzle.moves[0])
      lockedRef.current = false
      setFeedback('playing')
    }, INTRO_DELAY_MS)

    const tickInterval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000))
    }, 1000)
    tickIntervalRef.current = tickInterval

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
        setWrongMove(null)
        setSelection(null)
        setViewIndex((v) => Math.max(0, v - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setWrongMove(null)
        setSelection(null)
        setViewIndex((v) => Math.min(playedMovesLenRef.current, v + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const replayFen = useMemo(() => {
    const g = new Chess(puzzle.fen)
    for (let i = 0; i < effectiveViewIndex; i++) {
      g.move(parseUci(effectivePlayedMoves[i]))
    }
    return g.fen()
  }, [puzzle, effectivePlayedMoves, effectiveViewIndex])

  const displayFen = isLive && effectiveWrongMove ? effectiveWrongMove.fen : replayFen

  const effectiveSelection = isLive ? selection : null

  const squareStyles = useMemo(() => {
    if (!isLive) return undefined
    if (effectiveWrongMove) {
      return { [effectiveWrongMove.square]: WRONG_SQUARE_STYLE }
    }
    if (effectiveSelection) {
      const styles: Record<string, CSSProperties> = {
        [effectiveSelection.square]: SELECTED_SQUARE_STYLE,
      }
      for (const target of effectiveSelection.targets) {
        styles[target.to] = target.capture ? CAPTURE_HINT_STYLE : MOVE_HINT_STYLE
      }
      return styles
    }
    return undefined
  }, [isLive, effectiveWrongMove, effectiveSelection])

  // Calcolate qui (in un event handler, non durante il render) cosi'
  // gameRef puo' essere letto liberamente senza toccare la logica di
  // rendering: il risultato va semplicemente in state.
  function handleSquareClick({
    piece,
    square,
  }: {
    piece: { pieceType: string } | null
    square: string
  }) {
    if (lockedRef.current || !isLive) return

    if (selection) {
      if (selection.square === square) {
        setSelection(null)
        return
      }
      if (selection.targets.some((t) => t.to === square)) {
        attemptMove(selection.square, square)
        return
      }
    }

    if (piece && piece.pieceType[0] === gameRef.current.turn()) {
      const moves = gameRef.current.moves({ square: square as Square, verbose: true })
      setSelection({
        square,
        targets: moves.map((m) => ({ to: m.to, capture: !!gameRef.current.get(m.to) })),
      })
      return
    }
    setSelection(null)
  }

  function finish(result: 'solved' | 'failed') {
    lockedRef.current = true
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
      tickIntervalRef.current = null
    }
    setFeedback(result === 'solved' ? 'solved' : 'wrong')
    const timeSeconds = Math.round((Date.now() - startedAtRef.current) / 1000)
    setElapsed(timeSeconds)
    if (autoAdvanceRef.current) {
      setTimeout(() => onComplete(result, timeSeconds), FEEDBACK_HOLD_MS)
    } else {
      setPendingCompletion({ result, timeSeconds })
    }
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

  function attemptMove(sourceSquare: string, targetSquare: string): boolean {
    if (lockedRef.current || !isLive) return false

    setSelection(null)
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
      // Il pezzo resta sulla casa sbagliata (evidenziata in rosso) invece di
      // tornare subito indietro: gameRef resta pero' "pulito" (undo) dato che
      // e' la fonte di verita' per le mosse valide del puzzle.
      const wrongFen = game.fen()
      game.undo()
      setWrongMove({ fen: wrongFen, square: targetSquare })
      finish('failed')
      return true
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

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }): boolean {
    if (!targetSquare) return false
    return attemptMove(sourceSquare, targetSquare)
  }

  const turnLabel = orientation === 'white' ? 'Bianco' : 'Nero'

  const statusText = !isLive
    ? `Stai rivedendo la mossa ${effectiveViewIndex}/${effectivePlayedMoves.length}`
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
            onSquareClick: handleSquareClick,
            boardOrientation: orientation,
            canDragPiece: ({ piece }) =>
              isLive &&
              !lockedRef.current &&
              piece.pieceType[0] === gameRef.current.turn(),
            animationDurationInMs: 200,
            boardStyle: { borderRadius: '0.5rem', overflow: 'hidden' },
            squareStyles,
            // react-chessboard usa `id` per generare selettori CSS interni
            // (es. `#${id}-square-a1`): un ID CSS non puo' iniziare con una
            // cifra, mentre molti puzzle_id Lichess sì (es. "00rTX").
            id: `puzzle-${puzzle.puzzle_id}`,
          }}
        />
      </div>

      {pendingCompletion ? (
        <Button
          type="button"
          onClick={() =>
            onComplete(pendingCompletion.result, pendingCompletion.timeSeconds)
          }
        >
          Puzzle successivo →
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={effectiveViewIndex === 0}
            onClick={() => navigateView(Math.max(0, effectiveViewIndex - 1))}
            aria-label="Mossa precedente"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-muted-foreground w-16 text-center text-xs">
            {effectiveViewIndex}/{effectivePlayedMoves.length}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={isLive}
            onClick={() =>
              navigateView(Math.min(effectivePlayedMoves.length, effectiveViewIndex + 1))
            }
            aria-label="Mossa successiva"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
