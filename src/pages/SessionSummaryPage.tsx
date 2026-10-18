import { Link, useParams } from 'react-router-dom'
import { StatsComparison } from '@/components/stats-comparison'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionRoundStats } from '@/hooks/use-session-stats'
import { useTranslations } from '@/lib/language-context'
import {
  compareSession,
  formatAverage,
  formatDuration,
  sessionEloChange,
  sessionRounds,
} from '@/lib/session-stats'

// Riepilogo di una sessione: e' la pagina che si apre dopo l'ultimo puzzle
// del giro 3, al posto della schermata "nessuna sessione attiva". Si apre
// anche dal dettaglio di qualunque sessione.
export default function SessionSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations()
  const { data: rows, isLoading } = useSessionRoundStats()

  if (isLoading || !rows) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  const own = rows.filter((r) => r.session_id === id)
  const info = own[0]
  const rounds = sessionRounds(rows, id!)
  const elo = sessionEloChange(rows, id!)
  const comparison = info
    ? compareSession(rows, { id: info.session_id, created_at: info.created_at })
    : null
  const date = (iso: string) => new Date(iso).toLocaleDateString(t.meta.locale)

  const first = rounds[0]?.stats.averageSeconds
  const last = rounds[rounds.length - 1]?.stats.averageSeconds
  const speedPercent =
    rounds.length > 1 && first ? Math.round(((last - first) / first) * 100) : null

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {info?.status === 'completed'
            ? t.summary.sessionCompleteTitle
            : t.summary.sessionSummaryTitle}
        </h1>
        {info && (
          <p className="text-muted-foreground text-sm">
            {info.session_name ||
              t.sessionsHistory.puzzlesRound(info.total_puzzles, own.length)}
            {' · '}
            {t.summary.sessionDates(
              date(info.created_at),
              date(info.completed_at ?? own[own.length - 1].last_attempt_at),
            )}
          </p>
        )}
      </div>

      {!info ? (
        <p className="text-muted-foreground text-sm">{t.summary.noData}</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t.summary.roundsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="-mx-1 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground text-xs">
                    <tr className="border-b">
                      <th className="px-1 py-1.5 font-medium">{t.summary.roundColumn}</th>
                      <th className="px-1 py-1.5 text-right font-medium">
                        {t.summary.metrics.solved}
                      </th>
                      <th className="px-1 py-1.5 text-right font-medium">
                        {t.summary.metrics.failed}
                      </th>
                      <th className="px-1 py-1.5 text-right font-medium">
                        {t.summary.metrics.totalTime}
                      </th>
                      <th className="px-1 py-1.5 text-right font-medium">
                        {t.summary.metrics.averageTime}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {rounds.map(({ round, stats }) => (
                      <tr key={round} className="border-b last:border-0">
                        <th scope="row" className="px-1 py-1.5 font-medium">
                          {t.dashboard.puzzlePerformance.roundLabel(round)}
                        </th>
                        <td className="px-1 py-1.5 text-right">
                          {stats.solved} ({Math.round(stats.solvedRate)}%)
                        </td>
                        <td className="px-1 py-1.5 text-right">{stats.failed}</td>
                        <td className="px-1 py-1.5 text-right">
                          {formatDuration(stats.totalSeconds)}
                        </td>
                        <td className="px-1 py-1.5 text-right">
                          {formatAverage(stats.averageSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {speedPercent !== null && (
                <p className="text-foreground text-sm">
                  {t.summary.speedChange(
                    formatAverage(first),
                    formatAverage(last),
                    speedPercent,
                  )}
                </p>
              )}
              {elo && (
                <p className="text-muted-foreground text-sm">
                  {t.summary.elo(elo.from, elo.to)}
                </p>
              )}
            </CardContent>
          </Card>

          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle>{t.summary.compareTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsComparison comparison={comparison} />
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {info?.status === 'completed' && (
          <Button asChild>
            <Link to="/sessions/new">{t.summary.newSession}</Link>
          </Button>
        )}
        {info && (
          <Button asChild variant="outline">
            <Link to={`/sessions/${id}`}>{t.summary.details}</Link>
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link to="/dashboard">{t.summary.dashboard}</Link>
        </Button>
      </div>
    </main>
  )
}
