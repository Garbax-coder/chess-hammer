import { Chess, type Square } from 'chess.js'
import { useMemo, useState, type CSSProperties } from 'react'
import { Chessboard, type Arrow } from 'react-chessboard'
import {
  boardThemeById,
  DEFAULT_BOARD_THEME,
  type BoardThemeId,
} from '@/lib/board-themes'
import { DEFAULT_PIECE_SET, pieceSetById, type PieceSetId } from '@/lib/piece-sets'

const SELECTED_STYLE: CSSProperties = { backgroundColor: 'rgba(250, 204, 21, 0.45)' }
const TARGET_STYLE: CSSProperties = {
  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.22) 24%, transparent 26%)',
}
const LAST_MOVE_STYLE: CSSProperties = { backgroundColor: 'rgba(250, 204, 21, 0.3)' }
/** Pausa prima della risposta dell'avversario, per seguirla sulla scacchiera. */
export const OPPONENT_DELAY_MS = 500

const HINT_ARROW_COLOR = 'rgba(16, 185, 129, 0.85)'

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
  boardTheme?: BoardThemeId
  pieceSet?: PieceSetId
}) {
  const theme = useMemo(() => boardThemeById(boardTheme), [boardTheme])
  const pieces = useMemo(() => pieceSetById(pieceSet).pieces, [pieceSet])
  const chess = useMemo(() => new Chess(fen), [fen])
  const [selection, setSelection] = useState<{ fen: string; square: Square } | null>(null)
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
    <div className="aspect-square w-full">
      <Chessboard
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
          animationDurationInMs: 200,
          boardStyle: { borderRadius: '0.5rem', overflow: 'hidden' },
          lightSquareStyle: { backgroundColor: theme.light },
          darkSquareStyle: { backgroundColor: theme.dark },
          pieces,
        }}
      />
    </div>
  )
}
