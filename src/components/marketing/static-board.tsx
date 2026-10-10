import { useId } from 'react'
import { boardThemeById, DEFAULT_BOARD_THEME } from '@/lib/board-themes'
// Solo il set predefinito: importare l'indice dei set porterebbe tutti e
// cinque (~180 KB) nel pacchetto iniziale delle pagine pubbliche.
import { chessnutPieces } from '@/lib/piece-sets/chessnut'

export interface BoardArrow {
  from: string
  to: string
  opacity?: number
}

const FILES = 'abcdefgh'

function squareCenter(square: string, orientation: 'white' | 'black') {
  const file = FILES.indexOf(square[0])
  const rank = Number(square[1])
  return orientation === 'white'
    ? { x: file + 0.5, y: 8 - rank + 0.5 }
    : { x: 7 - file + 0.5, y: rank - 1 + 0.5 }
}

// Scacchiera di sola visualizzazione, senza librerie esterne: si disegna anche
// nel rendering lato server, quindi l'HTML pre-generato delle pagine pubbliche
// contiene gia' la posizione invece di un riquadro vuoto.
export function StaticBoard({
  fen,
  orientation = 'white',
  arrows = [],
  className = '',
}: {
  fen: string
  orientation?: 'white' | 'black'
  arrows?: BoardArrow[]
  className?: string
}) {
  const markerId = `arrowhead-${useId().replace(/:/g, '')}`
  const theme = boardThemeById(DEFAULT_BOARD_THEME)
  const pieces = chessnutPieces
  const rows = fen
    .split(' ')[0]
    .split('/')
    .map((row) => row.replace(/\d/g, (n) => '.'.repeat(Number(n))).split(''))
  const ordered =
    orientation === 'white' ? rows : [...rows].reverse().map((row) => [...row].reverse())

  return (
    <div
      className={`relative aspect-square w-full overflow-hidden rounded-lg ${className}`}
      role="img"
    >
      <div className="grid h-full w-full grid-cols-8 grid-rows-8">
        {ordered.flatMap((row, r) =>
          row.map((piece, c) => {
            const key =
              piece === '.'
                ? null
                : `${piece === piece.toUpperCase() ? 'w' : 'b'}${piece.toUpperCase()}`
            return (
              <div
                key={`${r}-${c}`}
                style={{ backgroundColor: (r + c) % 2 === 0 ? theme.light : theme.dark }}
              >
                {key && pieces[key]?.()}
              </div>
            )
          }),
        )}
      </div>
      {arrows.length > 0 && (
        <svg
          viewBox="0 0 8 8"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 4 4"
              refX="2"
              refY="2"
              markerWidth="2.4"
              markerHeight="2.4"
              orient="auto"
            >
              <path d="M0,0 L4,2 L0,4 z" fill="var(--primary)" />
            </marker>
          </defs>
          {arrows.map(({ from, to, opacity = 0.85 }) => {
            const a = squareCenter(from, orientation)
            const b = squareCenter(to, orientation)
            const len = Math.hypot(b.x - a.x, b.y - a.y)
            const shorten = 0.3 / len
            return (
              <line
                key={`${from}${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x - (b.x - a.x) * shorten}
                y2={b.y - (b.y - a.y) * shorten}
                stroke="var(--primary)"
                strokeWidth="0.16"
                strokeLinecap="round"
                opacity={opacity}
                markerEnd={`url(#${markerId})`}
              />
            )
          })}
        </svg>
      )}
    </div>
  )
}
