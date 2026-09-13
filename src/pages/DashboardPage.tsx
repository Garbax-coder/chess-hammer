import { Link } from 'react-router-dom'
import { EloHistoryChart } from '@/components/elo-history-chart'
import { SessionPerformanceCard } from '@/components/session-performance-card'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useActiveSession } from '@/hooks/use-active-session'
import { useSessionProgress } from '@/hooks/use-session-history'
import { useUserStats } from '@/hooks/use-user-stats'
import { useAuth } from '@/lib/auth-context'
import { useTranslations } from '@/lib/language-context'
import { daysForRound } from '@/lib/training-sessions'

export default function DashboardPage() {
  const { user } = useAuth()
  const t = useTranslations()
  const { data: session, isLoading } = useActiveSession()
  const { data: progress } = useSessionProgress(session)
  const { data: stats } = useUserStats()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 py-8 text-center">
      <div>
        <p className="text-muted-foreground text-sm">
          {t.dashboard.loggedInAs(user?.email ?? '')}
        </p>
        {stats && (
          <p className="text-muted-foreground text-xs">
            {t.dashboard.stats(
              stats.current_elo,
              stats.puzzles_solved,
              stats.puzzles_failed,
            )}
          </p>
        )}
      </div>

      {isLoading ? null : session ? (
        <Card className="w-full max-w-md text-left">
          <CardHeader>
            <CardTitle>{t.dashboard.currentSessionTitle}</CardTitle>
            <CardDescription>
              {t.dashboard.currentSessionDescription(
                session.current_round,
                session.total_puzzles,
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {session.resting_until && new Date(session.resting_until) > new Date() && (
              <p className="text-muted-foreground text-xs">
                {t.dashboard.restingNote(
                  new Date(session.resting_until).toLocaleDateString(t.meta.locale),
                )}
              </p>
            )}

            {progress && (
              <div className="flex flex-col gap-1.5">
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>
                    {t.dashboard.roundProgress(
                      progress.round,
                      progress.attemptedThisRound,
                      progress.round === 1 ? progress.roundTargetSize : progress.poolSize,
                    )}
                  </span>
                  <span>
                    {t.dashboard.todayProgress(
                      progress.attemptedToday,
                      progress.dailyTarget,
                    )}
                  </span>
                </div>
                <Progress
                  value={
                    (progress.attemptedThisRound /
                      (progress.round === 1
                        ? progress.roundTargetSize
                        : progress.poolSize)) *
                    100
                  }
                />
              </div>
            )}

            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              <p>
                {t.dashboard.roundSummary(
                  1,
                  session.daily_target_round1,
                  daysForRound(session.total_puzzles, session.daily_target_round1),
                )}
              </p>
              <p>
                {t.dashboard.roundSummary(
                  2,
                  session.daily_target_round2,
                  daysForRound(session.total_puzzles, session.daily_target_round2),
                )}
              </p>
              <p>
                {t.dashboard.roundSummary(
                  3,
                  session.daily_target_round3,
                  daysForRound(session.total_puzzles, session.daily_target_round3),
                )}
              </p>
            </div>

            <Button asChild className="w-full">
              <Link to="/train">{t.dashboard.continueTraining}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md text-left">
          <CardHeader>
            <CardTitle>{t.dashboard.noActiveSessionTitle}</CardTitle>
            <CardDescription>{t.dashboard.noActiveSessionDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/sessions/new">{t.dashboard.createSession}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex w-full flex-col gap-6 text-left">
        <EloHistoryChart />
        <SessionPerformanceCard />
      </div>
    </main>
  )
}
