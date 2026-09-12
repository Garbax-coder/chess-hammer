import { formatScore } from '@/lib/chess-format'

interface EvalBarProps {
  whitePercent: number
  scoreCp: number | null
  scoreMate: number | null
  sideToMove: 'w' | 'b'
}

export function EvalBar({ whitePercent, scoreCp, scoreMate, sideToMove }: EvalBarProps) {
  const label = formatScore(scoreCp, scoreMate, sideToMove)

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
