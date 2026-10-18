import { Link, useParams } from 'react-router-dom'
import { RoundSummary } from '@/components/round-summary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionDetail } from '@/hooks/use-session-history'
import { useSessionRoundStats } from '@/hooks/use-session-stats'
import { useTranslations } from '@/lib/language-context'
import { attemptDays, dayKeyToLocalDate } from '@/lib/session-days'
import { formatDuration, isRoundComplete } from '@/lib/session-stats'

// Riepilogo di un giro, dalla card "Prestazioni puzzle" in dashboard: lo
// stesso della schermata di fine giro, piu' i giorni del giro, ciascuno col
// suo riepilogo giornaliero.
export default function RoundSummaryPage() {
  const { id, round: roundParam } = useParams<{ id: string; round: string }>()
  const t = useTranslations()
  const round = Number(roundParam) as 1 | 2 | 3
  const { data: rows, isLoading: loadingStats } = useSessionRoundStats()
  const { data: detail, isLoading: loadingDetail } = useSessionDetail(id)

  if (loadingStats || loadingDetail || !rows || !detail) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  const { session, puzzles } = detail
  const row = rows.find((r) => r.session_id === id && r.round === round)
  const days = attemptDays(puzzles, round)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.summary.roundTitle(round)}
        </h1>
        <p className="text-muted-foreground text-sm">
          {session.name ||
            t.sessionDetail.title(
              new Date(session.created_at).toLocaleDateString(t.meta.locale),
            )}
        </p>
      </div>

      {!row ? (
        <p className="text-muted-foreground text-sm">{t.summary.noData}</p>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              {!isRoundComplete(row) && (
                <p className="text-muted-foreground text-sm">
                  {t.summary.roundInProgress(
                    row.attempted,
                    round === 1 ? row.total_puzzles : row.pool_size,
                  )}
                </p>
              )}
              <RoundSummary session={session} round={round} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.summary.daysTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {days.map((d) => (
                <Link
                  key={d.day}
                  to={`/sessions/${id}/day/${d.day}`}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm transition-colors"
                >
                  <span className="text-foreground">
                    {dayKeyToLocalDate(d.day).toLocaleDateString(t.meta.locale)}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {t.summary.dayRow(d.solved, d.failed, formatDuration(d.totalSeconds))}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline">
          <Link to={`/sessions/${id}/summary`}>{t.summary.sessionSummaryTitle}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/dashboard">{t.summary.dashboard}</Link>
        </Button>
      </div>
    </main>
  )
}
