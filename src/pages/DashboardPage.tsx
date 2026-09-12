import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useActiveSession } from '@/hooks/use-active-session'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { daysForRound } from '@/lib/training-sessions'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: session, isLoading } = useActiveSession()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground text-sm">
        Accesso effettuato come {user?.email ?? 'utente'}
      </p>

      {isLoading ? null : session ? (
        <Card className="w-full max-w-md text-left">
          <CardHeader>
            <CardTitle>Sessione in corso</CardTitle>
            <CardDescription>
              Giro {session.current_round} di 3 — {session.total_puzzles} puzzle totali
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground flex flex-col gap-1 text-sm">
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

      <Button variant="outline" onClick={() => signOut()}>
        Esci
      </Button>
    </main>
  )
}
