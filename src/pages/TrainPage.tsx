import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DevToolsPanel } from '@/components/dev-tools-panel'
import { PuzzleBoard } from '@/components/puzzle-board'
import { PuzzleBoardSkeleton } from '@/components/puzzle-board-skeleton'
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
import {
  usePuzzleById,
  useRecordPracticeAttempt,
  usePracticeAttempts,
} from '@/hooks/use-practice'
import { useSessionPuzzles } from '@/hooks/use-session-history'
import { useSoundEnabled } from '@/hooks/use-sound-enabled'
import { deriveSessionProgress } from '@/lib/session-progress'
import { useTranslations } from '@/lib/language-context'
import { useUpdateAutoAdvance, useUserStats } from '@/hooks/use-user-stats'
import type { SessionPuzzleResult } from '@/types/training'

export default function TrainPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { data: session, isLoading: loadingSession } = useActiveSession()
  const { data: outcome, isLoading: loadingPuzzle } = useNextPuzzle(session)
  const recordAttempt = useRecordAttempt(session)
  const { data: stats } = useUserStats()
  const updateAutoAdvance = useUpdateAutoAdvance()
  const { data: puzzles, isLoading: loadingPuzzles } = useSessionPuzzles(session)
  const recordPracticeAttempt = useRecordPracticeAttempt()
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundEnabled()

  // Calcolati dagli stessi dati della lista puzzle in sidebar (puzzles), non
  // da query di rete separate: vedi deriveSessionProgress e useSessionPuzzles.
  const progress = useMemo(
    () => (session && puzzles ? deriveSessionProgress(session, puzzles) : undefined),
    [session, puzzles],
  )

  const [practiceSelection, setPracticeSelection] = useState<{
    sessionPuzzleId: string
    puzzleId: string
  } | null>(null)
  const { data: practicePuzzle } = usePuzzleById(practiceSelection?.puzzleId)

  const puzzleIds = useMemo(() => puzzles?.map((p) => p.puzzleId) ?? [], [puzzles])
  const { data: practiceAttemptsByPuzzle } = usePracticeAttempts(puzzleIds)

  if (loadingSession) return null

  if (!session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">{t.train.noActiveSession}</p>
        <Button asChild>
          <Link to="/sessions/new">{t.train.createSession}</Link>
        </Button>
      </main>
    )
  }

  async function handleComplete(result: 'solved' | 'failed', timeSeconds: number) {
    if (outcome?.status !== 'next') return
    // La mutation scrive gia' il prossimo puzzle nella cache di 'outcome'
    // (vedi useRecordAttempt): non serve un refetch separato qui.
    await recordAttempt.mutateAsync({
      sessionPuzzleId: outcome.data.sessionPuzzleId,
      round: outcome.data.round,
      result,
      timeSeconds,
      puzzleRating: outcome.data.puzzle.rating,
    })
  }

  async function handlePracticeComplete(
    result: 'solved' | 'failed',
    timeSeconds: number,
  ) {
    if (!practiceSelection) return
    await recordPracticeAttempt.mutateAsync({
      puzzleId: practiceSelection.puzzleId,
      result,
      timeSeconds,
    })

    // onComplete scatta solo quando e' il momento di passare oltre: in
    // automatico se autoAdvance e' acceso, altrimenti solo per click
    // esplicito sul bottone "Puzzle successivo" (mostrato apposta quando e'
    // spento). In entrambi i casi l'intento e' lo stesso: andare al puzzle
    // dopo in lista, non serve ricontrollare autoAdvance qui (altrimenti
    // quel click, con l'automatico spento, uscirebbe dalla modalita'
    // pratica invece di avanzare).
    if (puzzles) {
      const currentIndex = puzzles.findIndex(
        (p) => p.sessionPuzzleId === practiceSelection.sessionPuzzleId,
      )
      const next = currentIndex >= 0 ? puzzles[currentIndex + 1] : undefined
      if (next) {
        setPracticeSelection({
          sessionPuzzleId: next.sessionPuzzleId,
          puzzleId: next.puzzleId,
        })
        return
      }
    }

    setPracticeSelection(null)
  }

  function handleSelectPuzzle(result: SessionPuzzleResult) {
    setPracticeSelection({
      sessionPuzzleId: result.sessionPuzzleId,
      puzzleId: result.puzzleId,
    })
  }

  const autoAdvance = stats?.auto_advance ?? true
  const boardTheme = stats?.board_theme
  const pieceSet = stats?.piece_set
  const canPractice =
    outcome?.status === 'quota_reached' ||
    outcome?.status === 'resting' ||
    outcome?.status === 'session_complete'
  const activeSessionPuzzleId =
    practiceSelection?.sessionPuzzleId ??
    (outcome?.status === 'next' ? outcome.data.sessionPuzzleId : null)

  return (
    <main className="flex w-full flex-1 flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-3">
      {/* 117px = header (53px) + padding sopra/sotto di questo <main> (py-8,
          32px ciascuno): senza sottrarli, la sidebar sticky puo' sporgere
          di quel tanto oltre il fondo della viewport e costringere a
          scorrere l'intera pagina solo per vederne l'ultima riga. */}
      <aside className="order-2 flex min-h-0 w-full flex-col gap-4 lg:sticky lg:top-14 lg:order-1 lg:max-h-[calc(100vh-117px)] lg:w-64 lg:shrink-0 lg:self-start">
        <div className="flex flex-col gap-3">
          {practiceSelection ? (
            <div>
              <h1 className="text-foreground text-lg font-semibold tracking-tight">
                {t.train.practiceTitle}
              </h1>
              <p className="text-muted-foreground text-sm">{t.train.practiceSubtitle}</p>
            </div>
          ) : (
            <div>
              <h1 className="text-foreground text-lg font-semibold tracking-tight">
                {t.train.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t.train.roundInfo(session.current_round, session.total_puzzles)}
              </p>
              {progress && (
                <p className="text-muted-foreground text-sm">
                  {t.train.todayPuzzle(
                    Math.min(progress.attemptedToday + 1, progress.dailyTarget),
                    progress.dailyTarget,
                  )}
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
              {t.train.autoAdvance}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="sound-enabled"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
            <Label htmlFor="sound-enabled" className="text-muted-foreground text-sm">
              {t.train.soundEnabled}
            </Label>
          </div>
        </div>

        {practiceSelection && (
          <Button variant="outline" size="sm" onClick={() => setPracticeSelection(null)}>
            {t.train.backToList}
          </Button>
        )}

        <SessionPuzzleList
          puzzles={puzzles ?? []}
          isLoading={loadingPuzzles}
          activeSessionPuzzleId={activeSessionPuzzleId}
          currentRound={session.current_round}
          practiceAttemptsByPuzzle={practiceAttemptsByPuzzle ?? new Map()}
          canPractice={canPractice}
          onSelectPuzzle={handleSelectPuzzle}
          boardTheme={boardTheme}
        />
      </aside>

      <div className="order-1 flex w-full flex-col items-center justify-center gap-6 lg:order-2 lg:w-auto">
        {practiceSelection ? (
          practicePuzzle ? (
            <PuzzleBoard
              key={practicePuzzle.puzzle_id}
              puzzle={practicePuzzle}
              autoAdvance={autoAdvance}
              onComplete={handlePracticeComplete}
              isCompleting={recordPracticeAttempt.isPending}
              boardTheme={boardTheme}
              pieceSet={pieceSet}
            />
          ) : (
            <PuzzleBoardSkeleton />
          )
        ) : (
          <>
            {loadingPuzzle && <PuzzleBoardSkeleton />}

            {outcome?.status === 'quota_reached' && (
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>{t.train.quotaTitle}</CardTitle>
                  <CardDescription>
                    {t.train.quotaDescription(outcome.round)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboard">{t.train.backToDashboard}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {outcome?.status === 'resting' && (
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>{t.train.restingTitle}</CardTitle>
                  <CardDescription>
                    {t.train.restingDescription(
                      new Date(outcome.restingUntil).toLocaleDateString(t.meta.locale),
                      outcome.round,
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ['next-puzzle', session.id],
                      })
                    }
                  >
                    {t.train.checkAgain}
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/dashboard">{t.train.backToDashboard}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {outcome?.status === 'session_complete' && (
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>{t.train.sessionCompleteTitle}</CardTitle>
                  <CardDescription>{t.train.sessionCompleteDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/dashboard">{t.train.backToDashboard}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {outcome?.status === 'next' && (
              <PuzzleBoard
                puzzle={outcome.data.puzzle}
                autoAdvance={autoAdvance}
                onComplete={handleComplete}
                isCompleting={recordAttempt.isPending}
                boardTheme={boardTheme}
                pieceSet={pieceSet}
              />
            )}
          </>
        )}

        {import.meta.env.DEV && <DevToolsPanel />}
      </div>
    </main>
  )
}
