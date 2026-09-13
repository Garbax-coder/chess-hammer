import { formatScore } from '@/lib/chess-format'

interface EvalBarProps {
  whitePercent: number
  scoreCp: number | null
  scoreMate: number | null
  sideToMove: 'w' | 'b'
  orientation?: 'horizontal' | 'vertical'
}

export function EvalBar({
  whitePercent,
  scoreCp,
  scoreMate,
  sideToMove,
  orientation = 'horizontal',
}: EvalBarProps) {
  const label = formatScore(scoreCp, scoreMate, sideToMove)

  if (orientation === 'vertical') {
    return (
      <div className="relative h-full w-full" title={label}>
        <div className="bg-muted absolute inset-0 overflow-hidden rounded-full">
          <div
            className="bg-foreground absolute inset-x-0 bottom-0 transition-all duration-500"
            style={{ height: `${whitePercent}%` }}
          />
        </div>
        {/* Il contenitore del testo NON e' quello con overflow-hidden: la
            barra e' stretta (poche decine di px), quindi l'etichetta in
            orizzontale deve poter sporgere oltre i suoi bordi senza
            essere tagliata. */}
        <span className="bg-background text-foreground absolute top-2 left-1/2 -translate-x-1/2 rounded px-1 text-[0.65rem] font-semibold whitespace-nowrap shadow-sm">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-muted relative h-5 w-full overflow-hidden rounded-full">
      <div
        className="bg-foreground absolute inset-y-0 left-0 transition-all duration-500"
        style={{ width: `${whitePercent}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[0.65rem] font-semibold text-white mix-blend-difference">
        {label}
      </span>
    </div>
  )
}
