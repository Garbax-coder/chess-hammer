import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ADMIN_PERIODS,
  bucketsFor,
  periodTotal,
  type AdminMetric,
  type AdminPeriod,
  type AdminStats,
} from '@/lib/admin'
import { useAdminTranslations } from '@/lib/i18n/admin'
import { useTranslations } from '@/lib/language-context'

// Il grafico si disegna in pixel reali sulla larghezza della scheda (misurata),
// non scalato via viewBox: affiancate due per riga, o su un telefono, le
// etichette resterebbero altrimenti minuscole. 600 finche' non c'e' misura.
const DEFAULT_WIDTH = 600
const HEIGHT = 150
const MARGIN = { top: 10, right: 4, bottom: 22, left: 32 }
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const BAR_GAP_RATIO = 0.25

// Etichette sotto l'asse: ogni 6 ore nelle 24 ore, ogni giorno nella
// settimana, ogni 5 giorni nel mese (piu' l'ultimo), per non sovrapporle.
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

function showsLabel(period: AdminPeriod, index: number, count: number): boolean {
  if (period === 'week') return true
  const step = period === 'day' ? 6 : 5
  return (count - 1 - index) % step === 0
}

export function AdminMetricCard({
  stats,
  metric,
  period,
  total,
  className,
}: {
  className?: string
  stats: AdminStats
  metric: AdminMetric
  period: AdminPeriod
  /** Totale di sempre, mostrato accanto ai periodi (solo per le registrazioni). */
  total?: number
}) {
  const t = useTranslations()
  const a = useAdminTranslations()
  const locale = t.meta.locale
  const [chartRef, measuredWidth] = useWidth<HTMLDivElement>()
  const WIDTH = measuredWidth || DEFAULT_WIDTH
  const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
  const buckets = bucketsFor(stats, period)
  const max = Math.max(1, ...buckets.map((b) => b[metric]))
  const slot = INNER_WIDTH / buckets.length
  const barWidth = slot * (1 - BAR_GAP_RATIO)

  const formatBucket = (start: string) =>
    period === 'day'
      ? new Date(start).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      : new Date(start).toLocaleDateString(locale, { day: 'numeric', month: 'short' })

  return (
    <Card className={`w-full ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-sm">{a.metrics[metric]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl
          className={`grid gap-2 ${total === undefined ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}
        >
          {ADMIN_PERIODS.map((p) => (
            <div
              key={p}
              className={`rounded-md px-2 py-1.5 ${p === period ? 'bg-primary/10' : 'bg-muted/50'}`}
            >
              <dt className="text-muted-foreground text-xs">{a.period[p]}</dt>
              <dd
                className={`text-lg font-semibold tabular-nums ${p === period ? 'text-primary' : 'text-foreground'}`}
              >
                {periodTotal(stats, metric, p)}
              </dd>
            </div>
          ))}
          {total !== undefined && (
            <div className="bg-muted/50 rounded-md px-2 py-1.5">
              <dt className="text-muted-foreground text-xs">{a.totalLabel}</dt>
              <dd className="text-foreground text-lg font-semibold tabular-nums">
                {total}
              </dd>
            </div>
          )}
        </dl>

        <div ref={chartRef} className="w-full">
          <svg
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block max-w-full"
            role="img"
            aria-label={`${a.metrics[metric]} · ${a.period[period]}`}
          >
            {[0, max].map((value) => {
              const y = MARGIN.top + INNER_HEIGHT - (value / max) * INNER_HEIGHT
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

            {buckets.map((b, i) => {
              const value = b[metric]
              const height = (value / max) * INNER_HEIGHT
              const x = MARGIN.left + i * slot + (slot - barWidth) / 2
              return (
                <g key={b.start}>
                  {/* Zona trasparente a tutta altezza: il suggerimento compare
                    anche sulle barre basse o vuote. */}
                  <rect
                    x={MARGIN.left + i * slot}
                    y={MARGIN.top}
                    width={slot}
                    height={INNER_HEIGHT}
                    fill="transparent"
                  >
                    <title>{a.bucketTitle(formatBucket(b.start), value)}</title>
                  </rect>
                  {value > 0 && (
                    <rect
                      x={x}
                      y={MARGIN.top + INNER_HEIGHT - height}
                      width={barWidth}
                      height={height}
                      rx={Math.min(2, barWidth / 4)}
                      fill="var(--color-chart-1)"
                      pointerEvents="none"
                      data-testid="admin-bar"
                    />
                  )}
                  {showsLabel(period, i, buckets.length) && (
                    <text
                      x={MARGIN.left + i * slot + slot / 2}
                      y={HEIGHT - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      fontSize={10}
                    >
                      {formatBucket(b.start)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
