import { Link } from 'react-router-dom'
import { DevToolsPanel } from '@/components/dev-tools-panel'
import { PuzzleBoard } from '@/components/puzzle-board'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useActiveSession } from '@/hooks/use-active-session'
import { useNextPuzzle, useRecordAttempt } from '@/hooks/use-puzzle-session'

export default function TrainPage() {
  const { data: session, isLoading: loadingSession } = useActiveSession()
  const { data: outcome, isLoading: loadingPuzzle, refetch } = useNextPuzzle(session)
  const recordAttempt = useRecordAttempt(session)

  if (loadingSession) return null

  if (!session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Nessuna sessione attiva.</p>
        <Button asChild>
          <Link to="/sessions/new">Crea una sessione</Link>
        </Button>
      </main>
    )
  }

  async function handleComplete(result: 'solved' | 'failed', timeSeconds: number) {
    if (outcome?.status !== 'next') return
    await recordAttempt.mutateAsync({
      sessionPuzzleId: outcome.data.sessionPuzzleId,
      round: outcome.data.round,
      result,
      timeSeconds,
      puzzleRating: outcome.data.puzzle.rating,
    })
    refetch()
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          Allenamento
        </h1>
        <p className="text-muted-foreground text-sm">
          Giro {session.current_round} di 3 — {session.total_puzzles} puzzle totali
        </p>
      </div>

      {loadingPuzzle && <p className="text-muted-foreground text-sm">Caricamento…</p>}

      {outcome?.status === 'quota_reached' && (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Quota di oggi completata</CardTitle>
            <CardDescription>
              Hai raggiunto il target giornaliero per il giro {outcome.round}. Torna
              domani per continuare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">Torna alla dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {outcome?.status === 'session_complete' && (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sessione completata 🎉</CardTitle>
            <CardDescription>
              Hai finito tutti e 3 i giri di questa sessione.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/dashboard">Torna alla dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {outcome?.status === 'next' && (
        <PuzzleBoard puzzle={outcome.data.puzzle} onComplete={handleComplete} />
      )}

      {import.meta.env.DEV && <DevToolsPanel />}
    </main>
  )
}
