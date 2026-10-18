import { useTranslations } from '@/lib/language-context'
import {
  formatAverage,
  formatDuration,
  type Comparison,
  type PerformanceStats,
} from '@/lib/session-stats'

type Metric = 'solved' | 'failed' | 'totalTime' | 'averageTime'
const METRICS: Metric[] = ['solved', 'failed', 'totalTime', 'averageTime']

function formatMetric(metric: Metric, stats: PerformanceStats): string {
  switch (metric) {
    case 'solved':
      return `${Math.round(stats.solved)} (${Math.round(stats.solvedRate)}%)`
    case 'failed':
      return `${Math.round(stats.failed)}`
    case 'totalTime':
      return formatDuration(stats.totalSeconds)
    case 'averageTime':
      return formatAverage(stats.averageSeconds)
  }
}

// Il valore di questa sessione e' "meglio" della precedente? Solo per le due
// metriche che si confrontano a parita' di dimensione della sessione.
function trend(metric: Metric, current: PerformanceStats, previous: PerformanceStats) {
  if (metric === 'solved')
    return Math.sign(Math.round(current.solvedRate - previous.solvedRate))
  if (metric === 'averageTime')
    return Math.sign(Math.round(previous.averageSeconds - current.averageSeconds))
  return 0
}

/**
 * Tabella "questa sessione / precedente / media delle precedenti" per
 * risolti, sbagliati, tempo totale e tempo medio a puzzle.
 */
export function StatsComparison({ comparison }: { comparison: Comparison }) {
  const t = useTranslations()
  const { current, previous, average, previousCount } = comparison

  if (!previous || !average) {
    return <p className="text-muted-foreground text-sm">{t.summary.noPrevious}</p>
  }

  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground text-xs">
          <tr className="border-b">
            <th className="px-1 py-1.5 font-medium">
              <span className="sr-only">{t.summary.compareTitle}</span>
            </th>
            <th className="px-1 py-1.5 text-right font-medium">
              {t.summary.columns.current}
            </th>
            <th className="px-1 py-1.5 text-right font-medium">
              {t.summary.columns.previous}
            </th>
            <th className="px-1 py-1.5 text-right font-medium">
              {t.summary.columns.average(previousCount)}
            </th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {METRICS.map((metric) => {
            const better = trend(metric, current, previous)
            return (
              <tr key={metric} className="border-b last:border-0">
                <th scope="row" className="text-muted-foreground px-1 py-1.5 font-normal">
                  {t.summary.metrics[metric]}
                </th>
                <td
                  className={`px-1 py-1.5 text-right font-medium ${
                    better > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : better < 0
                        ? 'text-destructive'
                        : 'text-foreground'
                  }`}
                >
                  {formatMetric(metric, current)}
                </td>
                <td className="text-muted-foreground px-1 py-1.5 text-right">
                  {formatMetric(metric, previous)}
                </td>
                <td className="text-muted-foreground px-1 py-1.5 text-right">
                  {formatMetric(metric, average)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
