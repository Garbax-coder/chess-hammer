import { Chessboard } from 'react-chessboard'
import { boardThemeById, DEFAULT_BOARD_THEME } from '@/lib/board-themes'
import { chessnutPieces } from '@/lib/piece-sets/chessnut'

// Caricata a parte (React.lazy in try-puzzle.tsx): react-chessboard e il suo
// drag & drop non servono per leggere la pagina, solo per giocare il puzzle.
export default function TryPuzzleBoard({
  fen,
  canDrag,
  onPieceDrop,
}: {
  fen: string
  canDrag: boolean
  onPieceDrop: (move: { sourceSquare: string; targetSquare: string | null }) => boolean
}) {
  const theme = boardThemeById(DEFAULT_BOARD_THEME)
  return (
    <Chessboard
      options={{
        id: 'landing-try-puzzle',
        position: fen,
        boardOrientation: 'black',
        onPieceDrop,
        canDragPiece: ({ piece }) => canDrag && piece.pieceType[0] === 'b',
        pieces: chessnutPieces,
        showNotation: false,
        animationDurationInMs: 200,
        lightSquareStyle: { backgroundColor: theme.light },
        darkSquareStyle: { backgroundColor: theme.dark },
        boardStyle: { borderRadius: '0.5rem', overflow: 'hidden' },
      }}
    />
  )
}
