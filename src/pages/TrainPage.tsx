import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DevToolsPanel } from '@/components/dev-tools-panel'
import { PuzzleBoard } from '@/components/puzzle-board'
import { SessionPuzzleList } from '@/components/session-puzzle-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useActiveSession } from '@/hooks/use-active-session'
import { useNextPuzzle, useRecordAttempt } from '@/hooks/use-puzzle-session'
import { usePuzzleById, useRecordPracticeAttempt, usePracticeAttempts } from '@/hooks/use-practice'
import { useSessionDetail, useSessionProgress } from '@/hooks/use-session-history'
import { useSoundEnabled } from '@/hooks/use-sound-enabled'
import { useUpdateAutoAdvance, useUserStats } from '@/hooks/use-user-stats'
import type { SessionPuzzleResult } from '@/types/training'

export default function TrainPage() {
  const { data: session, isLoading: loadingSession } = useActiveSession()
  const { data: outcome, isLoading: loadingPuzzle, refetch } = useNextPuzzle(session)
  const recordAttempt = useRecordAttempt(session)
  const { data: stats } = useUserStats()
  const updateAutoAdvance = useUpdateAutoAdvance()
  const { data: progress } = useSessionProgress(session)
  const { data: sessionDetail } = useSessionDetail(session?.id)
  const recordPracticeAttempt = useRecordPracticeAttempt()
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundEnabled()

  const [practiceSelection, setPracticeSelection] = useState<{
    sessionPuzzleId: string
    puzzleId: string
  } | null>(null)
  const { data: practicePuzzle } = usePuzzleById(practiceSelection?.puzzleId)

  const puzzleIds = useMemo(
    () => sessionDetail?.puzzles.map((p) => p.puzzleId) ?? [],
    [sessionDetail],
  )
  const { data: practiceAttemptsByPuzzle } = usePracticeAttempts(puzzleIds)

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

  async function handlePracticeComplete(result: 'solved' | 'failed', timeSeconds: number) {
    if (!practiceSelection) return
    await recordPracticeAttempt.mutateAsync({
      puzzleId: practiceSelection.puzzleId,
      result,
      timeSeconds,
    })

    if (autoAdvance && sessionDetail) {
      const puzzles = sessionDetail.puzzles
      const currentIndex = puzzles.findIndex(
        (p) => p.sessionPuzzleId === practiceSelection.sessionPuzzleId,
      )
      const next = currentIndex >= 0 ? puzzles[currentIndex + 1] : undefined
      if (next) {
        setPracticeSelection({ sessionPuzzleId: next.sessionPuzzleId, puzzleId: next.puzzleId })
        return
      }
    }

    setPracticeSelection(null)
  }

  function handleSelectPuzzle(result: SessionPuzzleResult) {
    setPracticeSelection({ sessionPuzzleId: result.sessionPuzzleId, puzzleId: result.puzzleId })
  }

  const autoAdvance = stats?.auto_advance ?? true
  const canPractice = outcome?.status === 'quota_reached' || outcome?.status === 'session_complete'
  const activeSessionPuzzleId =
    practiceSelection?.sessionPuzzleId ??
    (outcome?.status === 'next' ? outcome.data.sessionPuzzleId : null)

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-4 py-8 lg:flex-row lg:justify-center">
      <aside className="order-2 flex w-full flex-col gap-4 lg:order-1 lg:w-64 lg:shrink-0 lg:self-start">
        <div className="flex flex-col gap-3">
          {practiceSelection ? (
            <div>
              <h1 className="text-foreground text-lg font-semibold tracking-tight">
                Pratica libera
              </h1>
              <p className="text-muted-foreground text-sm">
                Il risultato non viene tracciato nella sessione ufficiale.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-foreground text-lg font-semibold tracking-tight">
                Allenamento
              </h1>
              <p className="text-muted-foreground text-sm">
                Giro {session.current_round} di 3 — {session.total_puzzles} puzzle totali
              </p>
              {progress && (
                <p className="text-muted-foreground text-sm">
                  Puzzle di oggi: {Math.min(progress.attemptedToday + 1, progress.dailyTarget)}/
                  {progress.dailyTarget}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              id="auto-advance"
              checked={autoAdvance}
              onCheckedChange={(checked) => updateAutoAdvance.mutate(checked)}
            />
            <Label htmlFor="auto-advance" className="text-muted-foreground text-sm">
              Avanzamento automatico
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="sound-enabled"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
            <Label htmlFor="sound-enabled" className="text-muted-foreground text-sm">
              Suoni
            </Label>
          </div>
        </div>

        <SessionPuzzleList
          puzzles={sessionDetail?.puzzles ?? []}
          activeSessionPuzzleId={activeSessionPuzzleId}
          currentRound={session.current_round}
          practiceAttemptsByPuzzle={practiceAttemptsByPuzzle ?? new Map()}
          canPractice={canPractice}
          onSelectPuzzle={handleSelectPuzzle}
        />
      </aside>

      <div className="order-1 flex flex-1 flex-col items-center justify-center gap-6 lg:order-2">
        {practiceSelection ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setPracticeSelection(null)}>
              Torna alla lista
            </Button>
            {practicePuzzle ? (
              <PuzzleBoard
                key={practicePuzzle.puzzle_id}
                puzzle={practicePuzzle}
                autoAdvance={autoAdvance}
                onComplete={handlePracticeComplete}
              />
            ) : (
              <p className="text-muted-foreground text-sm">Caricamento…</p>
            )}
          </>
        ) : (
          <>
            {loadingPuzzle && <p className="text-muted-foreground text-sm">Caricamento…</p>}

            {outcome?.status === 'quota_reached' && (
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Quota di oggi completata</CardTitle>
                  <CardDescription>
                    Hai raggiunto il target giornaliero per il giro {outcome.round}. Torna
                    domani per continuare, oppure seleziona un puzzle dalla lista a sinistra
                    per allenarti liberamente.
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
                    Hai finito tutti e 3 i giri di questa sessione. Puoi continuare a
                    esercitarti liberamente selezionando un puzzle dalla lista a sinistra.
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
              <PuzzleBoard
                puzzle={outcome.data.puzzle}
                autoAdvance={autoAdvance}
                onComplete={handleComplete}
              />
            )}
          </>
        )}

        {import.meta.env.DEV && <DevToolsPanel />}
      </div>
    </main>
  )
}
