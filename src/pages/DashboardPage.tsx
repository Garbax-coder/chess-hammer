import { Link } from 'react-router-dom'
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
import { daysForRound } from '@/lib/training-sessions'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: session, isLoading } = useActiveSession()
  const { data: progress } = useSessionProgress(session)
  const { data: stats } = useUserStats()

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <div>
        <p className="text-muted-foreground text-sm">
          Accesso effettuato come {user?.email ?? 'utente'}
        </p>
        {stats && (
          <p className="text-muted-foreground text-xs">
            ELO {stats.current_elo} · {stats.puzzles_solved} risolti ·{' '}
            {stats.puzzles_failed} falliti
          </p>
        )}
      </div>

      {isLoading ? null : session ? (
        <Card className="w-full max-w-md text-left">
          <CardHeader>
            <CardTitle>Sessione in corso</CardTitle>
            <CardDescription>
              Giro {session.current_round} di 3 — {session.total_puzzles} puzzle totali
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {progress && (
              <div className="flex flex-col gap-1.5">
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>
                    Giro {progress.round}: {progress.attemptedThisRound}/
                    {progress.round === 1 ? progress.roundTargetSize : progress.poolSize}
                  </span>
                  <span>
                    Oggi: {progress.attemptedToday}/{progress.dailyTarget}
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
                1° giro: {session.daily_target_round1}/giorno (~
                {daysForRound(session.total_puzzles, session.daily_target_round1)} giorni)
              </p>
              <p>
                2° giro: {session.daily_target_round2}/giorno (~
                {daysForRound(session.total_puzzles, session.daily_target_round2)} giorni)
              </p>
              <p>
                3° giro: {session.daily_target_round3}/giorno (~
                {daysForRound(session.total_puzzles, session.daily_target_round3)} giorni)
              </p>
            </div>

            <Button asChild className="w-full">
              <Link to="/train">Continua allenamento</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md text-left">
          <CardHeader>
            <CardTitle>Nessuna sessione attiva</CardTitle>
            <CardDescription>
              Configura un nuovo allenamento Woodpecker per iniziare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/sessions/new">Crea nuova sessione</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
