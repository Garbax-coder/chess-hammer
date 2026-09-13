import { Chess, type Square } from 'chess.js'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Chessboard, type Arrow } from 'react-chessboard'
import { AnalysisPanel } from '@/components/analysis-panel'
import { EvalBar } from '@/components/eval-bar'
import { MoveHistoryPanel } from '@/components/move-history'
import { SolvedFireworks } from '@/components/solved-fireworks'
import { Button } from '@/components/ui/button'
import { useStockfishAnalysis } from '@/hooks/use-stockfish-analysis'
import { evalToWhitePercent } from '@/lib/chess-format'
import { useEngineSettings } from '@/lib/engine-settings'
import { useTranslations } from '@/lib/language-context'
import {
  addMoveNode,
  INITIAL_MOVE_NODES,
  pathFromRoot,
  ROOT_NODE_ID,
  type MoveTreeNode,
} from '@/lib/move-tree'
import { playIllegalMoveSound, playMoveSound } from '@/lib/sound-effects'
import { parseUci } from '@/lib/uci'
import type { LichessPuzzle } from '@/types/training'

const BEST_MOVE_ARROW_COLOR = 'rgba(37, 99, 235, 0.8)'
const BOARD_SIZE = 'min(90vw, 78vh, 720px)'

type Feedback = 'intro' | 'playing' | 'correct' | 'wrong' | 'solved'

const INTRO_DELAY_MS = 500
const AUTO_MOVE_DELAY_MS = 400
const FEEDBACK_HOLD_MS = 900
const WRONG_SQUARE_STYLE = { backgroundColor: 'rgba(220, 38, 38, 0.55)' }
const SELECTED_SQUARE_STYLE = { backgroundColor: 'rgba(59, 130, 246, 0.35)' }
const LAST_MOVE_STYLE = { backgroundColor: 'rgba(250, 204, 21, 0.35)' }
const MOVE_HINT_STYLE = {
  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.22) 22%, transparent 24%)',
}
const CAPTURE_HINT_STYLE = { boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.22)' }

// Posizione (riga/colonna, 0-7 dall'alto a sinistra) di una casa sulla
// scacchiera COSI' COM'E' VISUALIZZATA (tiene conto dell'orientamento), per
// posizionare l'overlay dell'esito finale sopra il pezzo invece che dietro
// (squareStyles del componente Chessboard finisce dietro ai pezzi).
function squareToBoardPosition(
  square: string,
  orientation: 'white' | 'black',
): { row: number; col: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = Number(square[1]) - 1
  return orientation === 'white'
    ? { row: 7 - rank, col: file }
    : { row: rank, col: 7 - file }
}

// Il lato che deve risolvere il puzzle e' l'opposto di chi gioca la mossa di
// apertura (il colore a muovere nella FEN originale, prima del setup).
// Esportata per riuso nell'anteprima mini-scacchiera della lista puzzle.
export function solverColorFor(fen: string): 'white' | 'black' {
  return new Chess(fen).turn() === 'w' ? 'black' : 'white'
}

// chess.js aggiunge "+" o "#" alla notazione SAN per scacco/scacco matto:
// e' quindi la fonte piu' semplice per capire quale suono riprodurre,
// senza dover richiamare game.isCheck()/isCheckmate() separatamente.
function playSoundForMove(move: { san: string; captured?: string }) {
  const checkmate = move.san.endsWith('#')
  const check = !checkmate && move.san.endsWith('+')
  playMoveSound({ capture: !!move.captured, check, checkmate })
}

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
  const t = useTranslations()
  const gameRef = useRef(new Chess())
  const solutionIndexRef = useRef(1)
  const startedAtRef = useRef(0)
  const lockedRef = useRef(false)
  const nodeIdCounterRef = useRef(0)
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoAdvanceRef = useRef(autoAdvance)
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance
  }, [autoAdvance])

  // Albero delle mosse: registra sia la linea di soluzione del puzzle sia
  // (una volta finito il puzzle) tutte le diramazioni esplorate liberamente
  // dall'utente in modalita' di analisi, cosi' da poterle rivedere tutte
  // nella cronologia senza perdere quelle precedenti.
  const [nodes, setNodes] = useState<Record<string, MoveTreeNode>>(INITIAL_MOVE_NODES)
  const [currentId, setCurrentId] = useState(ROOT_NODE_ID)
  const [orientation, setOrientation] = useState<'white' | 'black'>(() =>
    solverColorFor(puzzle.fen),
  )
  const [feedback, setFeedback] = useState<Feedback>('intro')
  const [elapsed, setElapsed] = useState(0)
  const [loadedPuzzleId, setLoadedPuzzleId] = useState(puzzle.puzzle_id)
  const [wrongMove, setWrongMove] = useState<{
    fen: string
    square: string
    from: string
  } | null>(null)
  const [pendingCompletion, setPendingCompletion] = useState<PendingCompletion | null>(
    null,
  )
  const [selection, setSelection] = useState<SquareSelection | null>(null)
  // Diventa true nel momento esatto in cui il puzzle finisce, e torna false
  // alla prima mossa libera o navigazione in cronologia: isLive da solo non
  // basta perche' ridiventa vero ad ogni mossa di analisi (e' sempre una
  // nuova foglia dell'albero), riportando erroneamente il badge sull'ultima
  // casa toccata invece che sulla vera mossa finale del puzzle.
  const [outcomeVisible, setOutcomeVisible] = useState(false)

  // Quando il puzzle cambia, nodes/currentId non sono ancora stati
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
    setNodes(INITIAL_MOVE_NODES)
    setCurrentId(ROOT_NODE_ID)
    setFeedback('intro')
    setElapsed(0)
    setOrientation(solverColorFor(puzzle.fen))
    setWrongMove(null)
    setPendingCompletion(null)
    setSelection(null)
    setOutcomeVisible(false)
    nodeIdCounterRef.current = 0
  }
  const effectiveNodes = isNewPuzzle ? INITIAL_MOVE_NODES : nodes
  const effectiveCurrentId = isNewPuzzle ? ROOT_NODE_ID : currentId
  const effectiveWrongMove = isNewPuzzle ? null : wrongMove

  const isLive = effectiveNodes[effectiveCurrentId].children.length === 0

  // Riferimenti "sempre aggiornati" letti dall'handler tastiera qui sotto,
  // per non dover ricreare l'effect ad ogni mossa/navigazione.
  const nodesRef = useRef(effectiveNodes)
  nodesRef.current = effectiveNodes
  const currentIdRef = useRef(effectiveCurrentId)
  currentIdRef.current = effectiveCurrentId

  function navigateTo(id: string) {
    setWrongMove(null)
    setSelection(null)
    setOutcomeVisible(false)
    setCurrentId(id)
  }

  function applyMoveAndAdvanceView(uci: string) {
    const move = gameRef.current.move(parseUci(uci))
    playSoundForMove(move)
    // Questa funzione puo' essere invocata con un ritardo (setTimeout, per
    // la risposta automatica dell'avversario): a quel punto effectiveNodes/
    // effectiveCurrentId di QUESTO render potrebbero essere gia' superati
    // da una mossa nel frattempo registrata (es. la mossa corretta del
    // risolutore appena giocata). Si usano quindi i ref "sempre aggiornati"
    // invece delle costanti effective* catturate nella chiusura originale.
    const { nodes: newNodes, id } = addMoveNode(
      nodesRef.current,
      currentIdRef.current,
      uci,
      move.san,
      `n${nodeIdCounterRef.current++}`,
    )
    setNodes(newNodes)
    setCurrentId(id)
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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const cur = nodesRef.current[currentIdRef.current]
        if (cur.parentId) {
          setWrongMove(null)
          setSelection(null)
          setCurrentId(cur.parentId)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const cur = nodesRef.current[currentIdRef.current]
        if (cur.children.length > 0) {
          setWrongMove(null)
          setSelection(null)
          setCurrentId(cur.children[0])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const timelinePath = useMemo(
    () => pathFromRoot(effectiveNodes, effectiveCurrentId),
    [effectiveNodes, effectiveCurrentId],
  )

  const replayFen = useMemo(() => {
    const g = new Chess(puzzle.fen)
    for (const node of timelinePath) {
      g.move(parseUci(node.uci as string))
    }
    return g.fen()
  }, [puzzle, timelinePath])

  const displayFen = isLive && effectiveWrongMove ? effectiveWrongMove.fen : replayFen

  // Casa di partenza/arrivo dell'ultima mossa alla posizione ATTUALMENTE
  // VISUALIZZATA (che sia la punta della linea o un punto della cronologia
  // in fase di revisione: timelinePath riflette gia' effectiveCurrentId).
  const lastMoveSquares = useMemo(() => {
    if (isLive && effectiveWrongMove) {
      return { from: effectiveWrongMove.from, to: effectiveWrongMove.square }
    }
    const lastNode = timelinePath[timelinePath.length - 1]
    if (!lastNode?.uci) return null
    return { from: lastNode.uci.slice(0, 2), to: lastNode.uci.slice(2, 4) }
  }, [isLive, effectiveWrongMove, timelinePath])

  // Modalita' di analisi: attiva solo dopo la fine del puzzle quando
  // l'avanzamento automatico e' spento (altrimenti si passa subito al
  // puzzle successivo e non avrebbe senso). Analizza la posizione
  // attualmente visualizzata, che l'utente puo' cambiare navigando la
  // cronologia con le frecce/i bottoni qui sotto.
  const { settings: engineSettings, update: updateEngineSettings } = useEngineSettings()
  const analysisEnabled = pendingCompletion !== null
  const { lines: engineLines, analyzing } = useStockfishAnalysis(
    analysisEnabled ? displayFen : null,
    {
      multiPv: engineSettings.multiPv,
      depth: engineSettings.depth,
      enabled: analysisEnabled,
    },
  )
  const bestMoveArrows = useMemo<Arrow[]>(() => {
    if (!engineSettings.showBestMoveArrow) return []
    const bestUci = engineLines[0]?.pvUci[0]
    if (!bestUci || bestUci.length < 4) return []
    return [
      {
        startSquare: bestUci.slice(0, 2),
        endSquare: bestUci.slice(2, 4),
        color: BEST_MOVE_ARROW_COLOR,
      },
    ]
  }, [engineLines, engineSettings.showBestMoveArrow])

  const displayTurn = useMemo(() => new Chess(displayFen).turn(), [displayFen])
  const topLine = engineLines[0]
  const whitePercent = topLine
    ? evalToWhitePercent(topLine.scoreCp, topLine.scoreMate, displayTurn)
    : 50

  const effectiveSelection = isLive || analysisEnabled ? selection : null

  // La casella con l'esito finale (segno di spunta verde/croce rossa) si
  // mostra solo appena finito il puzzle, sulla mossa che lo ha concluso:
  // outcomeVisible torna false alla prima mossa libera o navigazione in
  // cronologia (vedi sopra), cosi' non segue le mosse fatte in analisi.
  const finalOutcomeSquare =
    outcomeVisible && (feedback === 'solved' || feedback === 'wrong')
      ? lastMoveSquares?.to
      : undefined

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {}
    const merge = (square: string, style: CSSProperties) => {
      styles[square] = { ...styles[square], ...style }
    }

    if (lastMoveSquares) {
      merge(lastMoveSquares.from, LAST_MOVE_STYLE)
      merge(lastMoveSquares.to, LAST_MOVE_STYLE)
    }
    if (effectiveWrongMove) {
      merge(effectiveWrongMove.square, WRONG_SQUARE_STYLE)
    }
    if (effectiveSelection) {
      merge(effectiveSelection.square, SELECTED_SQUARE_STYLE)
      for (const target of effectiveSelection.targets) {
        merge(target.to, target.capture ? CAPTURE_HINT_STYLE : MOVE_HINT_STYLE)
      }
    }

    return Object.keys(styles).length > 0 ? styles : undefined
  }, [lastMoveSquares, effectiveWrongMove, effectiveSelection])

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
    if (analysisEnabled) {
      if (selection) {
        if (selection.square === square) {
          setSelection(null)
          return
        }
        if (selection.targets.some((t) => t.to === square)) {
          attemptFreeMove(selection.square, square)
          return
        }
      }

      const game = new Chess(displayFen)
      if (piece && piece.pieceType[0] === game.turn()) {
        const moves = game.moves({ square: square as Square, verbose: true })
        setSelection({
          square,
          targets: moves.map((m) => ({ to: m.to, capture: !!game.get(m.to) })),
        })
        return
      }
      setSelection(null)
      return
    }

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

  // Modalita' di analisi: qualsiasi mossa legale, non necessariamente quella
  // del puzzle, giocabile da qualunque punto della cronologia. Se il nodo
  // corrente ha gia' un figlio con quella mossa lo si riusa, altrimenti si
  // crea una nuova diramazione: nessuna variante precedente viene persa.
  function attemptFreeMove(sourceSquare: string, targetSquare: string): boolean {
    setSelection(null)
    setWrongMove(null)
    setOutcomeVisible(false)
    const game = new Chess(displayFen)
    let move
    try {
      move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    } catch {
      return false
    }
    playSoundForMove(move)

    const { nodes: newNodes, id } = addMoveNode(
      nodesRef.current,
      currentIdRef.current,
      move.lan,
      move.san,
      `n${nodeIdCounterRef.current++}`,
    )
    setNodes(newNodes)
    setCurrentId(id)
    return true
  }

  function finish(result: 'solved' | 'failed') {
    lockedRef.current = true
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
      tickIntervalRef.current = null
    }
    setFeedback(result === 'solved' ? 'solved' : 'wrong')
    setOutcomeVisible(true)
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
      // e' la fonte di verita' per le mosse valide del puzzle. La mossa va
      // comunque registrata nell'albero (e' cio' che si vede sulla
      // scacchiera): altrimenti un'eventuale mossa libera successiva in
      // analisi verrebbe agganciata come figlia della posizione PRIMA della
      // mossa sbagliata, incoerente con la posizione realmente visualizzata,
      // e chess.js lancia "Invalid move" al replay della cronologia.
      const wrongFen = game.fen()
      game.undo()
      playIllegalMoveSound()
      const { nodes: newNodes, id } = addMoveNode(
        nodesRef.current,
        currentIdRef.current,
        move.lan,
        move.san,
        `n${nodeIdCounterRef.current++}`,
      )
      setNodes(newNodes)
      setCurrentId(id)
      setWrongMove({ fen: wrongFen, square: targetSquare, from: sourceSquare })
      finish('failed')
      return true
    }

    playSoundForMove(move)
    solutionIndexRef.current += 1
    {
      const { nodes: newNodes, id } = addMoveNode(
        nodesRef.current,
        currentIdRef.current,
        move.lan,
        move.san,
        `n${nodeIdCounterRef.current++}`,
      )
      setNodes(newNodes)
      setCurrentId(id)
    }

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
    if (analysisEnabled) return attemptFreeMove(sourceSquare, targetSquare)
    return attemptMove(sourceSquare, targetSquare)
  }

  const turnLabel = orientation === 'white' ? t.puzzleBoard.white : t.puzzleBoard.black
  const startTurn = puzzle.fen.split(' ')[1] === 'b' ? 'b' : 'w'
  const currentPly = timelinePath.length

  const statusText = analysisEnabled
    ? isLive
      ? t.puzzleBoard.analysisMode
      : t.puzzleBoard.reviewingMove(currentPly)
    : !isLive
      ? t.puzzleBoard.reviewingMove(currentPly)
      : feedback === 'intro'
        ? t.puzzleBoard.opponentMoving
        : feedback === 'solved'
          ? t.puzzleBoard.solved
          : feedback === 'wrong'
            ? t.puzzleBoard.wrongMove
            : t.puzzleBoard.moveWith(turnLabel)

  return (
    <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: BOARD_SIZE }} className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{t.puzzleBoard.rating(puzzle.rating)}</span>
          <span>{statusText}</span>
          <span>{elapsed}s</span>
        </div>

        <div className="flex items-stretch gap-2" style={{ width: BOARD_SIZE }}>
          {/* Colonna riservata SEMPRE (anche vuota) cosi' la comparsa della
              barra di valutazione a fine puzzle non fa "scattare" la
              scacchiera (ne' in larghezza ne' in altezza, dato che non sta
              piu' sopra ma di lato). */}
          <div className="w-5 shrink-0">
            {analysisEnabled && (
              <EvalBar
                orientation="vertical"
                whitePercent={whitePercent}
                scoreCp={topLine?.scoreCp ?? null}
                scoreMate={topLine?.scoreMate ?? null}
                sideToMove={displayTurn}
              />
            )}
          </div>

          <div
            className={`relative min-w-0 flex-1 rounded-lg ring-2 transition-all duration-300 ${
              feedback === 'wrong'
                ? 'ring-destructive'
                : feedback === 'solved' || feedback === 'correct'
                  ? 'ring-primary/50'
                  : 'ring-transparent'
            }`}
            style={{ aspectRatio: '1 / 1' }}
          >
            <Chessboard
              options={{
                position: displayFen,
                onPieceDrop: handlePieceDrop,
                onSquareClick: handleSquareClick,
                boardOrientation: orientation,
                canDragPiece: ({ piece }) =>
                  analysisEnabled
                    ? piece.pieceType[0] === displayTurn
                    : isLive &&
                      !lockedRef.current &&
                      piece.pieceType[0] === gameRef.current.turn(),
                animationDurationInMs: 200,
                boardStyle: { borderRadius: '0.5rem', overflow: 'hidden' },
                squareStyles,
                arrows: bestMoveArrows,
                // react-chessboard usa `id` per generare selettori CSS interni
                // (es. `#${id}-square-a1`): un ID CSS non puo' iniziare con una
                // cifra, mentre molti puzzle_id Lichess sì (es. "00rTX").
                id: `puzzle-${puzzle.puzzle_id}`,
              }}
            />
            {feedback === 'solved' && <SolvedFireworks />}
            {finalOutcomeSquare &&
              (() => {
                const { row, col } = squareToBoardPosition(finalOutcomeSquare, orientation)
                return (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      left: `${col * 12.5}%`,
                      top: `${row * 12.5}%`,
                      width: '12.5%',
                      height: '12.5%',
                    }}
                  >
                    <div
                      className={`absolute top-0.5 right-0.5 flex size-[38%] items-center justify-center rounded-full ${
                        feedback === 'solved' ? 'bg-emerald-600' : 'bg-destructive'
                      }`}
                    >
                      {feedback === 'solved' ? (
                        <Check className="size-[70%] text-white" strokeWidth={3} />
                      ) : (
                        <X className="size-[70%] text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                )
              })()}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={effectiveCurrentId === ROOT_NODE_ID}
            onClick={() => {
              const parentId = effectiveNodes[effectiveCurrentId].parentId
              if (parentId) navigateTo(parentId)
            }}
            aria-label={t.puzzleBoard.prevMove}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-muted-foreground w-16 text-center text-xs">
            {currentPly}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={isLive}
            onClick={() => {
              const childId = effectiveNodes[effectiveCurrentId].children[0]
              if (childId) navigateTo(childId)
            }}
            aria-label={t.puzzleBoard.nextMove}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Questa colonna riserva SEMPRE lo spazio (anche vuota) cosi' la
          scacchiera a sinistra non si sposta quando il pannello di analisi
          appare/scompare al termine del puzzle. */}
      <div className="w-full lg:w-72 lg:shrink-0">
        {pendingCompletion && (
          <div className="flex w-full flex-col gap-4">
            <AnalysisPanel
              fen={displayFen}
              lines={engineLines}
              analyzing={analyzing}
              settings={engineSettings}
              onUpdateSettings={updateEngineSettings}
            />
            <MoveHistoryPanel
              nodes={effectiveNodes}
              currentId={effectiveCurrentId}
              startTurn={startTurn}
              onSelect={navigateTo}
            />
            <Button
              type="button"
              onClick={() =>
                onComplete(pendingCompletion.result, pendingCompletion.timeSeconds)
              }
            >
              {t.puzzleBoard.nextPuzzle}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
