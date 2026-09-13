import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEloHistory } from '@/hooks/use-elo-history'
import type { EloRange } from '@/lib/elo-history'
import { useTranslations } from '@/lib/language-context'

const RANGES: EloRange[] = ['week', 'month', 'year', 'all']

// Coordinate interne del grafico (SVG scalato via viewBox, non pixel reali):
// margini per etichette asse Y a sinistra e date sotto.
const WIDTH = 600
const HEIGHT = 180
const MARGIN = { top: 12, right: 12, bottom: 22, left: 40 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom

export function EloHistoryChart() {
  const t = useTranslations()
  const [range, setRange] = useState<EloRange>('month')
  const { data, isLoading } = useEloHistory(range)

  const chart = useMemo(() => {
    if (!data || data.length === 0) return null
    const values = data.map((p) => p.elo_after)
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const pad = rawMax === rawMin ? 20 : (rawMax - rawMin) * 0.15
    const min = Math.round(rawMin - pad)
    const max = Math.round(rawMax + pad)

    const xForIndex = (i: number) =>
      MARGIN.left +
      (data.length <= 1 ? INNER_WIDTH / 2 : (i / (data.length - 1)) * INNER_WIDTH)
    const yForElo = (elo: number) =>
      MARGIN.top + INNER_HEIGHT - ((elo - min) / (max - min || 1)) * INNER_HEIGHT

    const points = data.map((p, i) => ({
      x: xForIndex(i),
      y: yForElo(p.elo_after),
      elo: p.elo_after,
      date: p.attempted_at,
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const gridLines = [min, Math.round((min + max) / 2), max]

    return { points, linePath, gridLines }
  }, [data])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t.dashboard.eloHistory.title}</CardTitle>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {t.dashboard.eloHistory.range[r]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[180px]" />
        ) : !chart ? (
          <p className="text-muted-foreground text-sm">{t.dashboard.eloHistory.empty}</p>
        ) : (
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img">
            {chart.gridLines.map((value) => {
              const y =
                MARGIN.top +
                INNER_HEIGHT -
                ((value - chart.gridLines[0]) /
                  (chart.gridLines[2] - chart.gridLines[0] || 1)) *
                  INNER_HEIGHT
              return (
                <g key={value}>
                  <line
                    x1={MARGIN.left}
                    x2={WIDTH - MARGIN.right}
                    y1={y}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={MARGIN.left - 6}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-muted-foreground"
                    fontSize={10}
                  >
                    {value}
                  </text>
                </g>
              )
            })}

            {chart.points.length >= 2 && (
              <path
                d={chart.linePath}
                fill="none"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {chart.points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--color-chart-1)">
                <title>
                  {new Date(p.date).toLocaleDateString(t.meta.locale)} ·{' '}
                  {t.profile.elo(p.elo)}
                </title>
              </circle>
            ))}

            <text
              x={MARGIN.left}
              y={HEIGHT - 6}
              textAnchor="start"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {new Date(chart.points[0].date).toLocaleDateString(t.meta.locale)}
            </text>
            <text
              x={WIDTH - MARGIN.right}
              y={HEIGHT - 6}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {new Date(chart.points[chart.points.length - 1].date).toLocaleDateString(
                t.meta.locale,
              )}
            </text>
          </svg>
        )}
      </CardContent>
    </Card>
  )
}
