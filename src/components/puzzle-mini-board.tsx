import { useMemo } from 'react'
import { solverColorFor } from '@/components/puzzle-board'

const PIECE_GLYPHS: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

function parseFenBoard(fen: string): (string | null)[][] {
  const placement = fen.split(' ')[0]
  return placement.split('/').map((row) => {
    const cells: (string | null)[] = []
    for (const char of row) {
      if (/\d/.test(char)) {
        cells.push(...Array(Number(char)).fill(null))
      } else {
        cells.push(char)
      }
    }
    return cells
  })
}

// Anteprima statica e non interattiva: niente react-chessboard (che monta
// sensori dnd-kit per ogni istanza) dato che questo componente puo' comparire
// decine di volte nella lista puzzle di una sessione.
export function PuzzleMiniBoard({ fen }: { fen: string }) {
  const orientation = useMemo(() => solverColorFor(fen), [fen])
  const board = useMemo(() => {
    const rows = parseFenBoard(fen)
    return orientation === 'white' ? rows : [...rows].reverse().map((row) => [...row].reverse())
  }, [fen, orientation])

  return (
    <div
      className="ring-border/60 grid aspect-square w-11 shrink-0 grid-cols-8 overflow-hidden rounded ring-1"
      style={{ gridTemplateRows: 'repeat(8, minmax(0, 1fr))' }}
    >
      {board.flatMap((row, rankIdx) =>
        row.map((piece, fileIdx) => {
          const isLight = (rankIdx + fileIdx) % 2 === 0
          return (
            <div
              key={`${rankIdx}-${fileIdx}`}
              className={`flex min-h-0 items-center justify-center ${isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`}
            >
              {piece && (
                <span
                  className={`text-[0.5rem] leading-none ${
                    piece === piece.toUpperCase()
                      ? 'text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.9)]'
                      : 'text-black'
                  }`}
                >
                  {PIECE_GLYPHS[piece]}
                </span>
              )}
            </div>
          )
        }),
      )}
    </div>
  )
}
