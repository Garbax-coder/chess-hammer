import { useEffect, useRef, useState } from 'react'
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
import { useNextPuzzle, useRecordAttempt } from '@/hooks/use-puzzle-session'

/**
 * Pagina di test del motore ELO/selezione puzzle: mostra FEN, rating e temi
 * del prossimo puzzle e permette di registrare manualmente l'esito.
 * La scacchiera interattiva (drag&drop, validazione mosse) e' una fase
 * successiva: qui verifichiamo che selezione, ELO e avanzamento giro/giorno
 * funzionino correttamente end-to-end.
 */
export default function TrainPage() {
  const { data: session, isLoading: loadingSession } = useActiveSession()
  const { data: outcome, isLoading: loadingPuzzle, refetch } = useNextPuzzle(session)
  const recordAttempt = useRecordAttempt(session)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (outcome?.status !== 'next') return
    startRef.current = Date.now()
    setElapsed(0)
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [outcome])

  if (loadingSession) return null

  if (!session) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Nessuna sessione attiva.</p>
        <Button asChild>
          <Link to="/sessions/new">Crea una sessione</Link>
        </Button>
      </main>
    )
  }

  async function handleAnswer(result: 'solved' | 'failed') {
    if (outcome?.status !== 'next') return
    const timeSeconds = Math.round((Date.now() - startRef.current) / 1000)
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
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Allenamento</CardTitle>
          <CardDescription>
            Giro {session.current_round} di 3 — {session.total_puzzles} puzzle totali
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPuzzle && <p className="text-muted-foreground text-sm">Caricamento…</p>}

          {outcome?.status === 'quota_reached' && (
            <p className="text-sm">
              Quota giornaliera raggiunta per il giro {outcome.round}. Torna domani per
              continuare.
            </p>
          )}

          {outcome?.status === 'session_complete' && (
            <p className="text-sm">
              Sessione completata: hai finito tutti e 3 i giri! 🎉
            </p>
          )}

          {outcome?.status === 'next' && (
            <div className="flex flex-col gap-4">
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span>Rating: {outcome.data.puzzle.rating}</span>
                <span>Temi: {outcome.data.puzzle.themes.join(', ')}</span>
                <span>Tempo: {elapsed}s</span>
              </div>
              <code className="bg-muted rounded-md p-3 text-xs break-all">
                {outcome.data.puzzle.fen}
              </code>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  disabled={recordAttempt.isPending}
                  onClick={() => handleAnswer('solved')}
                >
                  Risolto
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={recordAttempt.isPending}
                  onClick={() => handleAnswer('failed')}
                >
                  Fallito
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
