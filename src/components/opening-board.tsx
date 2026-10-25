import { Chess, type Square } from 'chess.js'
import { useId, useMemo, useState, type CSSProperties } from 'react'
import { Chessboard, type Arrow, type ChessboardOptions } from 'react-chessboard'
import {
  boardThemeById,
  DEFAULT_BOARD_THEME,
  type BoardThemeId,
} from '@/lib/board-themes'
import {
  ARROW_COLORS,
  arrowColorOf,
  type ArrowColor,
  type MoveArrow,
} from '@/lib/opening-arrows'
import { DEFAULT_PIECE_SET, pieceSetById, type PieceSetId } from '@/lib/piece-sets'

const SELECTED_STYLE: CSSProperties = { backgroundColor: 'rgba(250, 204, 21, 0.45)' }
const TARGET_STYLE: CSSProperties = {
  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.22) 24%, transparent 26%)',
}
const LAST_MOVE_STYLE: CSSProperties = { backgroundColor: 'rgba(250, 204, 21, 0.3)' }
/** Pausa prima della risposta dell'avversario, per seguirla sulla scacchiera. */
export const OPPONENT_DELAY_MS = 500

const HINT_ARROW_COLOR = 'rgba(16, 185, 129, 0.85)'
// Colori delle frecce disegnate col tasto destro: verde, Shift rosso, Alt blu,
// Ctrl giallo (come le frecce [%cal] di Lichess).
// Le altre misure sono quelle predefinite di react-chessboard.
const DRAWN_ARROW_OPTIONS: ChessboardOptions['arrowOptions'] = {
  colors: {
    default: ARROW_COLORS.G,
    shift: ARROW_COLORS.R,
    alt: ARROW_COLORS.B,
    ctrl: ARROW_COLORS.Y,
    meta: ARROW_COLORS.Y,
  },
  color: ARROW_COLORS.G,
  secondaryColor: ARROW_COLORS.R,
  tertiaryColor: ARROW_COLORS.Y,
  arrowLengthReducerDenominator: 8,
  sameTargetArrowLengthReducerDenominator: 4,
  arrowWidthDenominator: 5,
  activeArrowWidthMultiplier: 0.9,
  opacity: 0.65,
  activeOpacity: 0.5,
  arrowStartOffset: 0,
}

/**
 * Scacchiera dell'allenamento sulle aperture: mostra una posizione e passa
 * al chiamante la mossa dell'utente (trascinando o con due clic). Il
 * chiamante decide se e' quella del repertorio: la scacchiera non cambia
 * posizione da sola. Le promozioni diventano donna (in apertura non capitano).
 */
export function OpeningBoard({
  fen,
  orientation,
  interactive,
  onMove,
  hintUci,
  lastMoveUci,
  savedArrows = [],
  onArrowDrawn,
  boardTheme = DEFAULT_BOARD_THEME,
  pieceSet = DEFAULT_PIECE_SET,
}: {
  fen: string
  orientation: 'white' | 'black'
  interactive: boolean
  /** UCI della mossa giocata (es. e2e4, e7e8q); true se il chiamante la accetta. */
  onMove: (uci: string) => boolean
  /** Freccia della mossa giusta, dopo un errore. */
  hintUci?: string
  lastMoveUci?: string
  /** Frecce salvate sulla posizione (es. dalla consultazione). */
  savedArrows?: MoveArrow[]
  /**
   * Una freccia appena disegnata col tasto destro: il chiamante la salva (o
   * la toglie, se c'era). Senza, le frecce disegnate restano solo finche'
   * non cambia la posizione.
   */
  onArrowDrawn?: (arrow: MoveArrow) => void
  boardTheme?: BoardThemeId
  pieceSet?: PieceSetId
}) {
  const theme = useMemo(() => boardThemeById(boardTheme), [boardTheme])
  const pieces = useMemo(() => pieceSetById(pieceSet).pieces, [pieceSet])
  const chess = useMemo(() => new Chess(fen), [fen])
  const [selection, setSelection] = useState<{ fen: string; square: Square } | null>(null)
  // Cambiando chiave si azzerano le frecce disegnate dentro la scacchiera:
  // quelle salvate le disegna SavedArrows, e ridisegnarne una la toglie.
  const [drawKey, setDrawKey] = useState(0)
  // La selezione vale solo per la posizione in cui e' stata fatta.
  const selected = selection?.fen === fen ? selection.square : null

  const targets = useMemo(
    () =>
      selected
        ? chess.moves({ square: selected, verbose: true }).map((m) => m.to as string)
        : [],
    [chess, selected],
  )

  function play(from: string, to: string): boolean {
    const move = chess
      .moves({ verbose: true })
      .find((m) => m.from === from && m.to === to)
    if (!move) return false
    setSelection(null)
    // Trascinando, una mossa accettata resta dove e' stata lasciata: se la
    // si rifiutasse, il pezzo tornerebbe alla casa di partenza e rifarebbe il
    // movimento quando il chiamante aggiorna la posizione. Una mossa
    // sbagliata invece torna indietro.
    return onMove(`${from}${to}${move.promotion ? 'q' : ''}`)
  }

  function handleSquareClick({ square }: { square: string }) {
    if (!interactive) return
    if (selected && targets.includes(square)) {
      play(selected, square)
      return
    }
    const piece = chess.get(square as Square)
    if (piece && piece.color === chess.turn()) {
      setSelection(selected === square ? null : { fen, square: square as Square })
    } else {
      setSelection(null)
    }
  }

  const squareStyles: Record<string, CSSProperties> = {}
  if (lastMoveUci) {
    squareStyles[lastMoveUci.slice(0, 2)] = LAST_MOVE_STYLE
    squareStyles[lastMoveUci.slice(2, 4)] = LAST_MOVE_STYLE
  }
  if (selected) squareStyles[selected] = SELECTED_STYLE
  for (const target of targets) squareStyles[target] = TARGET_STYLE

  const arrows: Arrow[] = hintUci
    ? [
        {
          startSquare: hintUci.slice(0, 2),
          endSquare: hintUci.slice(2, 4),
          color: HINT_ARROW_COLOR,
        },
      ]
    : []

  return (
    <div className="relative aspect-square w-full">
      <Chessboard
        key={drawKey}
        options={{
          id: 'opening-board',
          position: fen,
          boardOrientation: orientation,
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            interactive && !!targetSquare && play(sourceSquare, targetSquare),
          onSquareClick: handleSquareClick,
          canDragPiece: ({ piece }) => interactive && piece.pieceType[0] === chess.turn(),
          squareStyles,
          arrows,
          arrowOptions: DRAWN_ARROW_OPTIONS,
          onArrowsChange: ({ arrows: drawn }) => {
            const last = drawn[drawn.length - 1]
            if (!onArrowDrawn || !last) return
            onArrowDrawn({
              from: last.startSquare,
              to: last.endSquare,
              color: arrowColorOf(last.color),
            })
            setDrawKey((key) => key + 1)
          },
          animationDurationInMs: 200,
          boardStyle: { borderRadius: '0.5rem', overflow: 'hidden' },
          lightSquareStyle: { backgroundColor: theme.light },
          darkSquareStyle: { backgroundColor: theme.dark },
          pieces,
        }}
      />
      {savedArrows.length > 0 && (
        <SavedArrows arrows={savedArrows} orientation={orientation} />
      )}
    </div>
  )
}

const FILES = 'abcdefgh'

function squareCenter(square: string, orientation: 'white' | 'black') {
  const file = FILES.indexOf(square[0])
  const rank = Number(square[1])
  return orientation === 'white'
    ? { x: file + 0.5, y: 8 - rank + 0.5 }
    : { x: 7 - file + 0.5, y: rank - 1 + 0.5 }
}

// Le frecce salvate, sopra la scacchiera (non intercettano i clic).
function SavedArrows({
  arrows,
  orientation,
}: {
  arrows: MoveArrow[]
  orientation: 'white' | 'black'
}) {
  const id = useId().replace(/:/g, '')
  const colors = Object.keys(ARROW_COLORS) as ArrowColor[]
  return (
    <svg
      viewBox="0 0 8 8"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        {colors.map((color) => (
          <marker
            key={color}
            id={`${id}-${color}`}
            viewBox="0 0 4 4"
            refX="2"
            refY="2"
            markerWidth="2.2"
            markerHeight="2.2"
            orient="auto"
          >
            <path d="M0,0 L4,2 L0,4 z" fill={ARROW_COLORS[color]} />
          </marker>
        ))}
      </defs>
      {arrows.map(({ from, to, color }) => {
        const a = squareCenter(from, orientation)
        const b = squareCenter(to, orientation)
        const shorten = 0.35 / Math.hypot(b.x - a.x, b.y - a.y)
        return (
          <line
            key={`${from}${to}`}
            data-arrow={`${color}${from}${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x - (b.x - a.x) * shorten}
            y2={b.y - (b.y - a.y) * shorten}
            stroke={ARROW_COLORS[color]}
            strokeWidth="0.18"
            strokeLinecap="round"
            opacity={0.75}
            markerEnd={`url(#${id}-${color})`}
          />
        )
      })}
    </svg>
  )
}
