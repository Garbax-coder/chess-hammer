import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/lib/language-context'
import {
  computeSessionCalendar,
  type CalendarDay,
  type RoundNumber,
} from '@/lib/session-calendar'

const ROUNDS: RoundNumber[] = [1, 2, 3]
const ROUND_COLORS: Record<RoundNumber, string> = {
  1: 'var(--color-chart-1)',
  2: 'var(--color-chart-2)',
  3: 'var(--color-chart-3)',
}

// Griglia mensile a pixel fissi (niente viewBox scalato): stessa scelta
// gia' fatta per la heatmap "Prestazioni puzzle", qui non serve nemmeno lo
// scroll orizzontale dato che un mese sta sempre in 7 colonne fisse.
const CELL = 32
const GAP = 3
const STRIDE = CELL + GAP
const COLS = 7
const GRID_WIDTH = COLS * STRIDE - GAP

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Lunedi' come primo giorno della settimana: sposta la domenica (0) in fondo.
function mondayIndex(jsWeekday: number): number {
  return (jsWeekday + 6) % 7
}

function MonthCalendar({
  year,
  month,
  byDate,
  locale,
  weekdayLabels,
}: {
  year: number
  month: number
  byDate: Map<string, CalendarDay>
  locale: string
  weekdayLabels: string[]
}) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = mondayIndex(first.getDay())

  const cells: { date: Date | null; day: CalendarDay | null }[] = []
  for (let i = 0; i < leading; i++) cells.push({ date: null, day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ date, day: byDate.get(dateKey(date)) ?? null })
  }
  const rows = Math.ceil(cells.length / COLS)
  const gridHeight = rows * STRIDE - GAP

  // Una polilinea per giro, che collega i centri delle celle consecutive
  // dello stesso giro presenti in QUESTO mese (un giro a cavallo di due
  // mesi si interrompe al bordo: il colore da solo segnala la continuita').
  const linesByRound: Record<RoundNumber, { x: number; y: number }[]> = {
    1: [],
    2: [],
    3: [],
  }
  cells.forEach((cell, i) => {
    if (!cell.day) return
    const col = i % COLS
    const row = Math.floor(i / COLS)
    linesByRound[cell.day.round].push({
      x: col * STRIDE + CELL / 2,
      y: row * STRIDE + CELL / 2,
    })
  })

  const monthLabel = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-2">
      <p className="text-foreground text-sm font-medium capitalize">{monthLabel}</p>
      <div
        className="text-muted-foreground grid text-center text-[0.65rem]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gap: GAP,
          width: GRID_WIDTH,
        }}
      >
        {weekdayLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="relative" style={{ width: GRID_WIDTH, height: gridHeight }}>
        <svg
          width={GRID_WIDTH}
          height={gridHeight}
          className="pointer-events-none absolute inset-0"
        >
          {ROUNDS.map(
            (round) =>
              linesByRound[round].length > 1 && (
                <polyline
                  key={round}
                  points={linesByRound[round].map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={ROUND_COLORS[round]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.55}
                />
              ),
          )}
        </svg>
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gap: GAP }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-full text-[0.65rem] font-medium"
              style={{
                width: CELL,
                height: CELL,
                backgroundColor: cell.day ? ROUND_COLORS[cell.day.round] : undefined,
                color: cell.day ? 'white' : undefined,
              }}
            >
              {cell.date?.getDate() ?? ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SessionCalendarPreview({
  totalPuzzles,
  dailyTargets,
}: {
  totalPuzzles: number
  dailyTargets: readonly [number, number, number]
}) {
  const t = useTranslations()

  const result = useMemo(
    () => computeSessionCalendar(new Date(), totalPuzzles, dailyTargets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalPuzzles, dailyTargets[0], dailyTargets[1], dailyTargets[2]],
  )

  const weekdayLabels = useMemo(() => {
    // Lunedi' 2024-01-01, cosi' formattiamo 7 giorni consecutivi a partire
    // da un lunedi' reale invece di ricostruire l'ordine a mano.
    const monday = new Date(2024, 0, 1)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toLocaleDateString(t.meta.locale, { weekday: 'narrow' })
    })
  }, [t.meta.locale])

  if (!result || result.days.length === 0) return null

  const byDate = new Map(result.days.map((d) => [dateKey(d.date), d]))
  const months: { year: number; month: number }[] = []
  const seenMonths = new Set<string>()
  for (const d of result.days) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`
    if (!seenMonths.has(key)) {
      seenMonths.add(key)
      months.push({ year: d.date.getFullYear(), month: d.date.getMonth() })
    }
  }

  const lastDay = result.days[result.days.length - 1].date

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base">{t.newSession.calendarTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 text-xs">
          {ROUNDS.map((round) => (
            <span key={round} className="text-muted-foreground flex items-center gap-1">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: ROUND_COLORS[round] }}
              />
              {t.dashboard.puzzlePerformance.roundLabel(round)}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {months.map(({ year, month }) => (
            <MonthCalendar
              key={`${year}-${month}`}
              year={year}
              month={month}
              byDate={byDate}
              locale={t.meta.locale}
              weekdayLabels={weekdayLabels}
            />
          ))}
        </div>

        <p className="text-muted-foreground text-sm">
          {t.newSession.calendarEndDate(lastDay.toLocaleDateString(t.meta.locale))}
        </p>
        {result.truncated && (
          <p className="text-muted-foreground text-xs">
            {t.newSession.calendarTruncated}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
