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
      <div
        className="bg-muted relative h-full w-full overflow-hidden rounded-full"
        title={label}
      >
        <div
          className="bg-foreground absolute inset-x-0 bottom-0 transition-all duration-500"
          style={{ height: `${whitePercent}%` }}
        />
        <span
          className="absolute inset-x-0 top-1 text-center text-[0.55rem] leading-none font-semibold text-white mix-blend-difference"
          style={{ writingMode: 'vertical-rl' }}
        >
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
