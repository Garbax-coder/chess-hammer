import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOpeningProgress, useOpeningStats, useRepertoires } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import {
  accuracyOf,
  averageSecondsOf,
  MIN_HARD_ATTEMPTS,
  summarizeOpenings,
  type OpeningStatsSummary,
} from '@/lib/opening-stats'
import { formatAverage } from '@/lib/session-stats'

const percent = (value: number) => `${Math.round(value)}%`

/**
 * La scheda "Aperture" delle statistiche: totali, attivita' degli ultimi 30
 * giorni, un riepilogo per repertorio e le mosse con piu' errori, ognuna
 * aperta nella consultazione.
 */
export function OpeningStatsPanel() {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: repertoires } = useRepertoires()
  const { data: progress } = useOpeningProgress()
  const { data: stats } = useOpeningStats()
  const summary = useMemo(
    () =>
      repertoires && progress && stats
        ? summarizeOpenings(repertoires, progress, stats, new Date())
        : null,
    [repertoires, progress, stats],
  )

  if (!summary) return <p className="text-muted-foreground text-sm">{t.common.loading}</p>
  return (
    <>
      <p className="text-muted-foreground -mt-3 text-sm">{o.statsSubtitle}</p>
      {summary.overview.tries === 0 ? (
        <p className="text-muted-foreground text-sm">{o.statsEmpty}</p>
      ) : (
        <>
          <OverviewCard summary={summary} />
          <ActivityCard summary={summary} />
          <RepertoiresCard summary={summary} />
          <HardestCard summary={summary} />
        </>
      )}
    </>
  )
}

function OverviewCard({ summary }: { summary: OpeningStatsSummary }) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { overview } = summary
  const seconds = averageSecondsOf(overview)
  const tiles: { label: string; value: string; detail?: string }[] = [
    { label: o.statsTiles.firstTries, value: String(overview.tries) },
    {
      label: o.statsTiles.accuracy,
      value: percent(accuracyOf(overview)),
      detail: String(overview.tries - overview.wrong),
    },
    {
      label: o.statsTiles.averageTime,
      value: seconds === null ? '—' : formatAverage(seconds),
    },
    {
      label: o.statsTiles.mastered,
      value: String(overview.mastered),
      detail: `/ ${overview.userMoves}`,
    },
    {
      label: o.statsTiles.linesMastered,
      value: String(overview.linesMastered),
      detail: `/ ${overview.lines}`,
    },
    { label: o.statsTiles.cycles, value: String(overview.cycles) },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.stats.overviewTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="bg-muted/50 flex flex-col gap-0.5 rounded-md px-3 py-2"
            >
              <dt className="text-muted-foreground text-xs">{tile.label}</dt>
              <dd className="text-foreground flex items-baseline gap-1.5 text-lg font-semibold tabular-nums">
                {tile.value}
                {tile.detail && (
                  <span className="text-muted-foreground text-xs font-normal">
                    {tile.detail}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

// Una barra per giorno, alta quanto le mosse di quel giorno rispetto al
// giorno piu' attivo; la parte piena sono le risposte giuste.
function ActivityCard({ summary }: { summary: OpeningStatsSummary }) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { activity } = summary
  const max = Math.max(1, ...activity.map((d) => d.attempts))
  const active = activity.filter((d) => d.attempts > 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{o.statsActivity}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex h-24 items-end gap-0.5" aria-hidden>
          {activity.map((d) => {
            const label = o.statsDay(
              new Date(`${d.day}T12:00:00Z`).toLocaleDateString(t.meta.locale),
              d.attempts,
              d.correct,
            )
            return (
              <div
                key={d.day}
                title={label}
                className="bg-muted flex flex-1 flex-col justify-end overflow-hidden rounded-sm"
                style={{ height: `${Math.max(4, (d.attempts / max) * 100)}%` }}
              >
                <div
                  className="bg-primary"
                  style={{
                    height: d.attempts > 0 ? `${(d.correct / d.attempts) * 100}%` : 0,
                  }}
                />
              </div>
            )
          })}
        </div>
        <p className="text-muted-foreground text-xs">
          {o.statsActivityNote(
            active.length,
            active.reduce((sum, d) => sum + d.attempts, 0),
          )}
        </p>
      </CardContent>
    </Card>
  )
}

function RepertoiresCard({ summary }: { summary: OpeningStatsSummary }) {
  const o = useOpeningsTranslations()
  const c = o.statsColumns
  return (
    <Card>
      <CardHeader>
        <CardTitle>{o.statsByRepertoire}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="text-muted-foreground text-xs">
              <tr className="border-b">
                <th className="px-1 py-1.5 font-medium">{c.repertoire}</th>
                <th className="px-1 py-1.5 text-right font-medium">{c.moves}</th>
                <th className="px-1 py-1.5 text-right font-medium">{c.mastered}</th>
                <th className="px-1 py-1.5 text-right font-medium">{c.due}</th>
                <th className="px-1 py-1.5 text-right font-medium">{c.tries}</th>
                <th className="px-1 py-1.5 text-right font-medium">{c.accuracy}</th>
                <th className="px-1 py-1.5 text-right font-medium">{c.time}</th>
                <th className="px-1 py-1.5 text-right font-medium">{c.cycles}</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {summary.byRepertoire.map((row) => {
                const seconds = averageSecondsOf(row)
                return (
                  <tr key={row.repertoire.id} className="border-b last:border-0">
                    <th scope="row" className="px-1 py-1.5 font-medium">
                      <Link
                        to={`/openings/${row.repertoire.slug}/lines`}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {o.names[row.repertoire.slug] ?? row.repertoire.name}
                      </Link>
                      <span className="text-muted-foreground block text-xs font-normal">
                        {o.color[row.repertoire.color]}
                      </span>
                    </th>
                    <td className="px-1 py-1.5 text-right">{row.userMoves}</td>
                    <td className="px-1 py-1.5 text-right">{row.mastered}</td>
                    <td className="px-1 py-1.5 text-right">{row.due}</td>
                    <td className="px-1 py-1.5 text-right">{row.tries}</td>
                    <td className="px-1 py-1.5 text-right">
                      {row.tries > 0 ? percent(accuracyOf(row)) : '—'}
                    </td>
                    <td className="px-1 py-1.5 text-right">
                      {seconds === null ? '—' : formatAverage(seconds)}
                    </td>
                    <td className="px-1 py-1.5 text-right">{row.cycles}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function HardestCard({ summary }: { summary: OpeningStatsSummary }) {
  const o = useOpeningsTranslations()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{o.statsHardest}</CardTitle>
        <p className="text-muted-foreground text-xs">
          {o.statsHardestNote(MIN_HARD_ATTEMPTS)}
        </p>
      </CardHeader>
      <CardContent>
        {summary.hardest.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {o.statsHardestEmpty(MIN_HARD_ATTEMPTS)}
          </p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {summary.hardest.map((move) => (
              <li key={move.nodeId} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                  <Link
                    to={`/openings/${move.repertoire.slug}/lines?move=${move.nodeId}`}
                    className="text-foreground decoration-muted-foreground/50 font-mono text-xs underline decoration-dotted underline-offset-4 hover:decoration-current hover:decoration-solid"
                  >
                    {move.line}
                  </Link>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {o.statsHardestLine(Math.round(move.accuracy), move.tries)}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {o.names[move.repertoire.slug] ?? move.repertoire.name}
                </span>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-destructive h-full rounded-full"
                    style={{ width: `${100 - move.accuracy}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
