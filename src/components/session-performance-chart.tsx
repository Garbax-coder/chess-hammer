import { useMemo, useState } from 'react'
import { PuzzleMiniBoard } from '@/components/puzzle-mini-board'
import type { BoardThemeId } from '@/lib/board-themes'
import { useTranslations } from '@/lib/language-context'
import { dayGroupsForRound, dayKeyToLocalDate, type Round } from '@/lib/session-days'
import type { SessionPuzzleResult } from '@/types/training'

const ROUNDS = [1, 2, 3] as const satisfies readonly Round[]

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
// Riquadro di raggruppamento giornaliero: leggermente piu' grande delle
// celle che contiene, cosi' il bordo/sfondo resta visibile intorno a loro
// invece di coincidere esattamente coi loro margini.
const GROUP_PAD_X = 2
const GROUP_PAD_Y = 2

const ROUND_COLORS: Record<Round, string> = {
  1: 'var(--color-chart-1)',
  2: 'var(--color-chart-2)',
  3: 'var(--color-chart-3)',
}
const SOLVED_COLOR = '#10b981'
const FAILED_COLOR = 'var(--color-destructive)'
const PENDING_COLOR = 'var(--color-muted)'

interface HoverInfo {
  puzzle: SessionPuzzleResult
  round: Round
  rect: DOMRect
}

export function SessionPerformanceChart({
  puzzles,
  boardTheme,
  onSelectPuzzle,
  onSelectDay,
}: {
  puzzles: SessionPuzzleResult[]
  boardTheme?: BoardThemeId
  onSelectPuzzle: (sessionPuzzleId: string) => void
  // Click su un raggruppamento giornaliero (il contorno/sfondo condiviso da
  // piu' celle, non su una cella stessa): apre il riepilogo di quel giorno.
  onSelectDay: (day: string) => void
}) {
  const t = useTranslations()
  const n = puzzles.length
  const [hover, setHover] = useState<HoverInfo | null>(null)

  // Un raggruppamento per giro (riga) per ogni serie di celle consecutive
  // attribuite allo stesso giorno di calendario: vedi dayGroupsForRound.
  const dayGroupsByRound = useMemo(
    () => ROUNDS.map((round) => ({ round, groups: dayGroupsForRound(puzzles, round) })),
    [puzzles],
  )

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

    // Ticks per l'asse Y del grafico tempi (max / meta' / 0), mostrati nella
    // colonna fissa a sinistra: senza non era chiaro che quelle linee
    // rappresentassero secondi di risoluzione.
    const yTicks = [
      { value: maxTime, y: CHART_MARGIN_TOP },
      { value: Math.round(maxTime / 2), y: CHART_MARGIN_TOP + innerHeight / 2 },
      { value: 0, y: CHART_MARGIN_TOP + innerHeight },
    ]

    return { width, xForIndex, linesByRound, yTicks }
  }, [puzzles, n])

  if (n === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t.dashboard.puzzlePerformance.empty}
      </p>
    )
  }

  function showHover(
    e: React.MouseEvent<SVGRectElement>,
    puzzle: SessionPuzzleResult,
    round: Round,
  ) {
    setHover({ puzzle, round, rect: e.currentTarget.getBoundingClientRect() })
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
        <div className="text-muted-foreground flex shrink-0 flex-col text-[0.6rem]">
          <div style={{ height: CHART_HEIGHT }} className="relative w-7">
            {chart.yTicks.map((tick) => (
              <span
                key={tick.value}
                className="absolute right-0 -translate-y-1/2"
                style={{ top: tick.y }}
              >
                {tick.value}s
              </span>
            ))}
          </div>
          <div style={{ height: GAP_BETWEEN }} />
          {ROUNDS.map((round) => (
            <div key={round} style={{ height: ROW_HEIGHT }} className="flex items-center">
              {round}
            </div>
          ))}
        </div>

        <div className="scrollbar-hide overflow-x-auto pb-1">
          <svg
            width={chart.width}
            height={HEATMAP_TOP + HEATMAP_HEIGHT}
            role="img"
            aria-label={t.dashboard.puzzlePerformance.title}
          >
            {chart.yTicks.map((tick) => (
              <line
                key={tick.value}
                x1={0}
                x2={chart.width}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
            ))}

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

            {dayGroupsByRound.map(({ round, groups }) =>
              groups.map((group, groupIndex) => {
                const x =
                  chart.xForIndex(group.startIndex) - CELL_SIZE / 2 - GROUP_PAD_X
                const width =
                  chart.xForIndex(group.endIndex) -
                  chart.xForIndex(group.startIndex) +
                  CELL_SIZE +
                  GROUP_PAD_X * 2
                const y = HEATMAP_TOP + (round - 1) * ROW_HEIGHT - GROUP_PAD_Y
                const height = CELL_SIZE + GROUP_PAD_Y * 2
                const count = group.endIndex - group.startIndex + 1
                return (
                  <rect
                    key={`group-${round}-${group.day}-${group.startIndex}`}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={5}
                    fill="var(--color-muted-foreground)"
                    fillOpacity={groupIndex % 2 === 0 ? 0.1 : 0.2}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                    className="cursor-pointer"
                    onClick={() => onSelectDay(group.day)}
                  >
                    <title>
                      {t.dashboard.puzzlePerformance.dayGroupTooltip(
                        dayKeyToLocalDate(group.day).toLocaleDateString(t.meta.locale),
                        count,
                      )}
                    </title>
                  </rect>
                )
              }),
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
                return (
                  <rect
                    key={`${p.sessionPuzzleId}-${round}`}
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={3}
                    fill={fill}
                    className="cursor-pointer"
                    onMouseEnter={(e) => showHover(e, p, round)}
                    onMouseMove={(e) => showHover(e, p, round)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onSelectPuzzle(p.sessionPuzzleId)}
                  />
                )
              }),
            )}
          </svg>
        </div>
      </div>

      {hover && <PuzzleHoverPopover hover={hover} boardTheme={boardTheme} />}
    </div>
  )
}

function PuzzleHoverPopover({
  hover,
  boardTheme,
}: {
  hover: HoverInfo
  boardTheme: BoardThemeId | undefined
}) {
  const t = useTranslations()
  const { puzzle, round, rect } = hover
  const attempt = puzzle.attempts[round]

  const showAbove = rect.top > 160
  const style: React.CSSProperties = {
    left: Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90),
    top: showAbove ? rect.top - 8 : rect.bottom + 8,
    transform: `translate(-50%, ${showAbove ? '-100%' : '0'})`,
  }

  return (
    <div
      className="bg-popover text-popover-foreground ring-foreground/10 pointer-events-none fixed z-50 flex w-44 flex-col gap-2 rounded-lg p-2.5 text-xs shadow-lg ring-1"
      style={style}
    >
      <div className="flex items-center gap-2">
        <PuzzleMiniBoard fen={puzzle.fen} boardTheme={boardTheme} />
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground font-medium">
            {`#${puzzle.orderIndex} · ${t.dashboard.puzzlePerformance.roundLabel(round)}`}
          </span>
          {attempt ? (
            <span
              className={
                attempt.result === 'solved'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-destructive'
              }
            >
              {attempt.result === 'solved'
                ? t.dashboard.puzzlePerformance.legendSolved
                : t.dashboard.puzzlePerformance.legendFailed}
              {` · ${attempt.time_seconds}s`}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t.dashboard.puzzlePerformance.legendPending}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
