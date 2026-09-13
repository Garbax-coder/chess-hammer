import { useMemo } from 'react'
import { useTranslations } from '@/lib/language-context'
import type { SessionPuzzleResult } from '@/types/training'

const ROUNDS = [1, 2, 3] as const
type Round = (typeof ROUNDS)[number]

// Larghezza di colonna e dimensioni cella FISSE (pixel reali, non
// viewBox scalato): con sessioni fino a 200 puzzle il grafico deve poter
// scorrere in orizzontale invece di schiacciarsi in poco spazio, come una
// heatmap di contributi stile GitHub.
const COLUMN_WIDTH = 18
const CELL_SIZE = 14
const CELL_GAP = 4
const ROW_HEIGHT = CELL_SIZE + CELL_GAP
const HEATMAP_HEIGHT = ROW_HEIGHT * ROUNDS.length - CELL_GAP
const CHART_HEIGHT = 90
const CHART_MARGIN_TOP = 8
const CHART_MARGIN_BOTTOM = 6
const GAP_BETWEEN = 12
const HEATMAP_TOP = CHART_HEIGHT + GAP_BETWEEN

const ROUND_COLORS: Record<Round, string> = {
  1: 'var(--color-chart-1)',
  2: 'var(--color-chart-2)',
  3: 'var(--color-chart-3)',
}
const SOLVED_COLOR = '#10b981'
const FAILED_COLOR = 'var(--color-destructive)'
const PENDING_COLOR = 'var(--color-muted)'

export function SessionPerformanceChart({ puzzles }: { puzzles: SessionPuzzleResult[] }) {
  const t = useTranslations()
  const n = puzzles.length

  const chart = useMemo(() => {
    const width = Math.max(n * COLUMN_WIDTH, COLUMN_WIDTH)
    const xForIndex = (i: number) => i * COLUMN_WIDTH + COLUMN_WIDTH / 2

    let maxTime = 0
    for (const p of puzzles) {
      for (const round of ROUNDS) {
        const a = p.attempts[round]
        if (a) maxTime = Math.max(maxTime, a.time_seconds)
      }
    }
    maxTime = maxTime || 1

    const innerHeight = CHART_HEIGHT - CHART_MARGIN_TOP - CHART_MARGIN_BOTTOM
    const yForTime = (seconds: number) =>
      CHART_MARGIN_TOP + innerHeight - (seconds / maxTime) * innerHeight

    const linesByRound = ROUNDS.map((round) => {
      const roundPoints = puzzles
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => p.attempts[round])
        .map(({ p, i }) => ({
          x: xForIndex(i),
          y: yForTime(p.attempts[round]!.time_seconds),
          orderIndex: p.orderIndex,
          timeSeconds: p.attempts[round]!.time_seconds,
        }))
      const path = roundPoints
        .map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt.x},${pt.y}`)
        .join(' ')
      return { round, points: roundPoints, path }
    })

    return { width, xForIndex, linesByRound }
  }, [puzzles, n])

  if (n === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t.dashboard.puzzlePerformance.empty}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {ROUNDS.map((round) => (
          <span key={round} className="flex items-center gap-1">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: ROUND_COLORS[round] }}
            />
            {t.dashboard.puzzlePerformance.roundLabel(round)}
          </span>
        ))}
        <span className="bg-border mx-1 h-3 w-px" aria-hidden="true" />
        <span className="flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-sm"
            style={{ backgroundColor: SOLVED_COLOR }}
          />
          {t.dashboard.puzzlePerformance.legendSolved}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-sm"
            style={{ backgroundColor: FAILED_COLOR }}
          />
          {t.dashboard.puzzlePerformance.legendFailed}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-sm"
            style={{ backgroundColor: PENDING_COLOR }}
          />
          {t.dashboard.puzzlePerformance.legendPending}
        </span>
      </div>

      <div className="flex gap-2">
        <div
          className="text-muted-foreground flex shrink-0 flex-col text-[0.65rem]"
          style={{ paddingTop: HEATMAP_TOP }}
        >
          {ROUNDS.map((round) => (
            <div key={round} style={{ height: ROW_HEIGHT }} className="flex items-center">
              {round}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto pb-1">
          <svg
            width={chart.width}
            height={HEATMAP_TOP + HEATMAP_HEIGHT}
            role="img"
            aria-label={t.dashboard.puzzlePerformance.title}
          >
            {chart.linesByRound.map(
              ({ round, path }) =>
                path && (
                  <path
                    key={round}
                    d={path}
                    fill="none"
                    stroke={ROUND_COLORS[round]}
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ),
            )}
            {chart.linesByRound.map(({ round, points }) =>
              points.map((pt, i) => (
                <circle
                  key={`${round}-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={2}
                  fill={ROUND_COLORS[round]}
                >
                  <title>
                    {`#${pt.orderIndex} · ${t.dashboard.puzzlePerformance.roundLabel(round)} · ${pt.timeSeconds}s`}
                  </title>
                </circle>
              )),
            )}

            {puzzles.map((p, i) =>
              ROUNDS.map((round) => {
                const attempt = p.attempts[round]
                const x = chart.xForIndex(i) - CELL_SIZE / 2
                const y = HEATMAP_TOP + (round - 1) * ROW_HEIGHT
                const fill = !attempt
                  ? PENDING_COLOR
                  : attempt.result === 'solved'
                    ? SOLVED_COLOR
                    : FAILED_COLOR
                const label = attempt
                  ? t.sessionPuzzleList.roundResult(
                      round,
                      attempt.result === 'solved',
                      attempt.time_seconds,
                    )
                  : t.sessionPuzzleList.roundTodo(round)
                return (
                  <rect
                    key={`${p.sessionPuzzleId}-${round}`}
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={3}
                    fill={fill}
                  >
                    <title>{`#${p.orderIndex} · ${label}`}</title>
                  </rect>
                )
              }),
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
