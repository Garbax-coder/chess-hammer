import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DailySessionSummary } from '@/components/daily-session-summary'
import { DevToolsPanel } from '@/components/dev-tools-panel'
import { EditableSessionName } from '@/components/editable-session-name'
import { PracticeFilterControls } from '@/components/practice-filter-controls'
import { PuzzleBoard } from '@/components/puzzle-board'
import { PuzzleBoardSkeleton } from '@/components/puzzle-board-skeleton'
import { RoundSummary } from '@/components/round-summary'
import { SavePuzzleToggle } from '@/components/save-puzzle-toggle'
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
import {
  nextPuzzleQueryKey,
  outcomeRound,
  useNextPuzzle,
  useRecordAttempt,
} from '@/hooks/use-puzzle-session'
import { sessionRoundStatsKey } from '@/hooks/use-session-stats'
import {
  useRecordPracticeAttempt,
  usePracticeAttempts,
} from '@/hooks/use-practice'
import { useSavedPuzzles, useToggleSavedPuzzle } from '@/hooks/use-saved-puzzles'
import { useSessionPuzzles } from '@/hooks/use-session-history'
import { useSoundEnabled } from '@/hooks/use-sound-enabled'
import { entriesForDay, todayKey } from '@/lib/session-days'
import {
  boardPuzzleFrom,
  deriveSessionProgress,
  practicePool,
  practiceResumePuzzle,
  type PracticeFilter,
} from '@/lib/session-progress'
import { useTranslations } from '@/lib/language-context'
import {
  useUpdateAutoAdvance,
  useUpdatePracticeFilter,
  useUserStats,
} from '@/hooks/use-user-stats'
import type { NextPuzzleOutcome } from '@/lib/puzzle-engine'
import type { SessionPuzzleResult } from '@/types/training'

const PRACTICE_RETRY_DELAY_MS = 2000

export default function TrainPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
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

  // "Rifai il puzzle" in pratica libera: cambiando la key la scacchiera
  // riparte da capo sullo stesso puzzle.
  const [practiceRetries, setPracticeRetries] = useState(0)
  const [practiceSelection, setPracticeSelection] = useState<{
    sessionPuzzleId: string
    puzzleId: string
  } | null>(null)

  const updatePracticeFilter = useUpdatePracticeFilter()
  const { data: savedPuzzleIds } = useSavedPuzzles()
  const toggleSavedPuzzle = useToggleSavedPuzzle()
  const practiceFilter: PracticeFilter = {
    onlyFailed: stats?.practice_only_failed ?? false,
    scope: stats?.practice_failed_scope ?? 'all',
    onlySaved: stats?.practice_only_saved ?? false,
    savedPuzzleIds,
  }

  const puzzleIds = useMemo(() => puzzles?.map((p) => p.puzzleId) ?? [], [puzzles])
  const { data: practiceAttemptsByPuzzle } = usePracticeAttempts(puzzleIds)

  // order_index e' stabile tra i 3 giri (stesso pool, nuovi tentativi): dice
  // la posizione del puzzle in pratica libera esattamente come in giro
  // ufficiale, quindi si ricava dalla stessa lista invece di portarsela
  // dietro in practiceSelection.
  const practiceResult = practiceSelection
    ? puzzles?.find((p) => p.sessionPuzzleId === practiceSelection.sessionPuzzleId)
    : undefined
  const practiceOrderIndex = practiceResult?.orderIndex
  const practicePuzzle = useMemo(
    () => (practiceResult ? boardPuzzleFrom(practiceResult) : undefined),
    [practiceResult],
  )

  // Riepilogo del giorno corrente, mostrato a fine quota/giro/sessione (vedi
  // sotto): calcolato dagli stessi dati gia' in mano (puzzles), nessuna
  // query in piu'.
  const today = todayKey()
  const todayEntries = useMemo(
    () => entriesForDay(puzzles ?? [], today),
    [puzzles, today],
  )

  // Il risultato della mutation (il prossimo puzzle) viene tenuto qui
  // finche' l'utente non e' davvero pronto ad avanzare (handleAdvance):
  // applicarlo subito in cache farebbe cambiare la scacchiera sotto i suoi
  // occhi mentre sta ancora rivedendo/analizzando il tentativo appena
  // concluso (rilevante solo con avanzamento automatico spento — con
  // l'automatico acceso i due momenti sono comunque separati dalla pausa
  // di feedback, ma teniamo lo stesso schema in entrambi i casi).
  // Si tengono anche i parametri originali (non solo la promise): se la
  // mutation fallisce (es. rete instabile su mobile), handleAdvance deve
  // poter ritentare la STESSA chiamata invece di restare bloccato per
  // sempre — senza i parametri potrebbe solo ri-attendere una promise gia'
  // rigettata, che rifiuta di nuovo all'istante senza mai ritentare
  // davvero la richiesta di rete.
  const pendingOutcomeRef = useRef<{
    promise: Promise<NextPuzzleOutcome>
    params: Parameters<typeof recordAttempt.mutateAsync>[0]
  } | null>(null)

  // Giro appena concluso senza pausa (0 giorni di riposo): prima del giro
  // successivo si mostra il suo riepilogo. Con la pausa ci pensa gia' la
  // schermata "Pausa tra i giri".
  const [completedRound, setCompletedRound] = useState<1 | 2 | null>(null)

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
    // Registra SUBITO, non al passaggio al prossimo puzzle: altrimenti un
    // fallimento visto solo in modalita' di analisi, seguito da un reload
    // prima di premere "Puzzle successivo", andrebbe perso e il puzzle
    // ripartirebbe come se non fosse mai stato tentato.
    const params = {
      sessionPuzzleId: outcome.data.sessionPuzzleId,
      round: outcome.data.round,
      result,
      timeSeconds,
      puzzleRating: outcome.data.puzzle.rating,
    }
    pendingOutcomeRef.current = { promise: recordAttemptHandled(params), params }
  }

  // L'esito si legge solo al passaggio al puzzle successivo (handleAdvance),
  // che gestisce anche l'errore e ritenta: un errore di rete che arriva prima
  // (es. connessione persa su telefono) va comunque segnato come gestito,
  // altrimenti finisce tra gli errori non gestiti (Sentry JAVASCRIPT-REACT-5).
  function recordAttemptHandled(params: Parameters<typeof recordAttempt.mutateAsync>[0]) {
    const promise = recordAttempt.mutateAsync(params)
    promise.catch(() => {})
    return promise
  }

  async function handleAdvance() {
    const pending = pendingOutcomeRef.current
    if (!pending || !session) return
    try {
      const nextOutcome = await pending.promise
      pendingOutcomeRef.current = null
      // Ultimo puzzle della sessione: si apre il suo riepilogo, e solo ora
      // si rilegge la sessione attiva (vedi useRecordAttempt).
      if (nextOutcome.status === 'session_complete') {
        navigate(`/sessions/${session.id}/summary`)
        void queryClient.invalidateQueries({ queryKey: ['active-session'] })
        void queryClient.invalidateQueries({ queryKey: ['sessions-list'] })
        void queryClient.invalidateQueries({ queryKey: sessionRoundStatsKey(session.user_id) })
        return
      }
      const finishedRound = pending.params.round
      if (
        nextOutcome.status !== 'resting' &&
        finishedRound !== 3 &&
        outcomeRound(nextOutcome) !== finishedRound
      ) {
        setCompletedRound(finishedRound)
      }
      queryClient.setQueryData(nextPuzzleQueryKey(session.id), nextOutcome)
    } catch (error) {
      // Se la registrazione e' fallita (es. rete instabile), il bottone
      // non deve restare bloccato per sempre in attesa di una promise gia'
      // rigettata: si riparte da capo con gli stessi parametri, cosi' un
      // secondo click puo' davvero ritentare la richiesta invece di
      // limitarsi a ri-osservare lo stesso fallimento.
      console.error('Registrazione tentativo fallita, verra\' ritentata', error)
      pendingOutcomeRef.current = {
        promise: recordAttemptHandled(pending.params),
        params: pending.params,
      }
    }
  }

  // Nessuno aspetta questo salvataggio (si passa subito al puzzle dopo): con
  // la rete instabile si ritenta una volta, e un errore residuo si registra
  // nella console invece di restare non gestito. Un tentativo di pratica
  // perso non tocca la sessione ufficiale ne' l'ELO.
  async function handlePracticeAttempt(result: 'solved' | 'failed', timeSeconds: number) {
    if (!practiceSelection) return
    const attempt = {
      puzzleId: practiceSelection.puzzleId,
      result,
      timeSeconds,
      sessionId: session!.id,
    }
    for (let tries = 1; ; tries++) {
      try {
        await recordPracticeAttempt.mutateAsync(attempt)
        return
      } catch (error) {
        if (tries >= 2) {
          console.warn('Tentativo di pratica non salvato', error)
          return
        }
        await new Promise((resolve) => setTimeout(resolve, PRACTICE_RETRY_DELAY_MS))
      }
    }
  }

  function handlePracticeAdvance() {
    if (!practiceSelection) return
    // A differenza della sessione ufficiale, qui non c'e' nessun esito da
    // aspettare: il puzzle successivo si ricava subito dalla lista gia' in
    // mano (puzzles), quindi avanzare non deve aspettare handlePracticeAttempt.
    if (puzzles) {
      const pool = practicePool(puzzles, practiceFilter)
      const currentIndex = pool.findIndex(
        (p) => p.sessionPuzzleId === practiceSelection.sessionPuzzleId,
      )
      const next = currentIndex >= 0 ? pool[currentIndex + 1] : pool[0]
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
  // Il puzzle sulla scacchiera, per il segnalibro dei "problematici".
  const currentPuzzleId =
    practiceSelection?.puzzleId ??
    (completedRound === null && outcome?.status === 'next' ? outcome.data.puzzle.puzzle_id : null)
  const activeSessionPuzzleId =
    practiceSelection?.sessionPuzzleId ??
    (outcome?.status === 'next' ? outcome.data.sessionPuzzleId : null)
  // Solo a dati pronti: con i tentativi di pratica o il filtro salvato non
  // ancora arrivati partirebbe dal primo puzzle invece di riprendere.
  const practiceStart =
    puzzles && practiceAttemptsByPuzzle && stats
      ? practiceResumePuzzle(
          puzzles,
          practiceAttemptsByPuzzle,
          practiceFilter,
          session.created_at,
          session.id,
        )
      : undefined
  const startPracticeButton = (
    <Button
      className="w-full"
      disabled={!practiceStart}
      onClick={() => practiceStart && handleSelectPuzzle(practiceStart)}
    >
      {t.train.startPractice}
    </Button>
  )

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
                <EditableSessionName session={session} fallback={t.train.title} />
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

          {currentPuzzleId && <SavePuzzleToggle puzzleId={currentPuzzleId} />}

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

          {/* Solo quando la pratica libera e' disponibile: decide sia il
              "Puzzle successivo" in pratica sia da dove riprende "Continua in
              pratica libera" nelle schermate di riepilogo. */}
          {(practiceSelection || canPractice) && (
            <PracticeFilterControls
              filter={practiceFilter}
              update={updatePracticeFilter.mutate}
              showNoSavedHint={
                practiceFilter.onlySaved === true &&
                !practiceFilter.onlyFailed &&
                !!savedPuzzleIds &&
                !(puzzles ?? []).some((p) => savedPuzzleIds.has(p.puzzleId))
              }
            />
          )}
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
          savedPuzzleIds={savedPuzzleIds}
          onToggleSaved={(puzzleId, saved) => toggleSavedPuzzle.mutate({ puzzleId, saved })}
          onSelectPuzzle={handleSelectPuzzle}
          boardTheme={boardTheme}
        />
      </aside>

      <div className="order-1 flex w-full flex-col items-center justify-center gap-6 lg:order-2 lg:w-auto">
        {practiceSelection ? (
          practicePuzzle ? (
            <PuzzleBoard
              key={`${practicePuzzle.puzzle_id}-${practiceRetries}`}
              onRetry={() => setPracticeRetries((n) => n + 1)}
              puzzle={practicePuzzle}
              autoAdvance={autoAdvance}
              onComplete={handlePracticeAttempt}
              onAdvance={handlePracticeAdvance}
              isCompleting={recordPracticeAttempt.isPending}
              boardTheme={boardTheme}
              pieceSet={pieceSet}
              progress={
                practiceOrderIndex !== undefined
                  ? { current: practiceOrderIndex, total: session.total_puzzles }
                  : undefined
              }
            />
          ) : (
            <PuzzleBoardSkeleton />
          )
        ) : (
          <>
            {loadingPuzzle && <PuzzleBoardSkeleton />}

            {completedRound !== null && (
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>{t.summary.roundCompleteTitle(completedRound)}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <RoundSummary session={session} round={completedRound} />
                  <Button className="w-full" onClick={() => setCompletedRound(null)}>
                    {t.summary.continue}
                  </Button>
                </CardContent>
              </Card>
            )}

            {completedRound === null && outcome?.status === 'quota_reached' && (
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>{t.train.quotaTitle}</CardTitle>
                  <CardDescription>
                    {t.train.quotaDescription(outcome.round)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <DailySessionSummary
                    day={today}
                    entries={todayEntries}
                    boardTheme={boardTheme}
                    showTitle={false}
                  />
                  <div className="flex flex-col gap-2">
                    {startPracticeButton}
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/dashboard">{t.train.backToDashboard}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {outcome?.status === 'resting' && (
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>{t.train.restingTitle}</CardTitle>
                  <CardDescription>
                    {t.train.restingDescription(
                      new Date(outcome.restingUntil).toLocaleDateString(t.meta.locale),
                      outcome.round,
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {outcome.round > 1 && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-foreground text-sm font-semibold">
                        {t.summary.roundCompleteTitle(outcome.round - 1)}
                      </h3>
                      <RoundSummary
                        session={session}
                        round={(outcome.round - 1) as 1 | 2}
                      />
                    </div>
                  )}
                  <DailySessionSummary
                    day={today}
                    entries={todayEntries}
                    boardTheme={boardTheme}
                    showTitle={false}
                  />
                  <div className="flex flex-col gap-2">
                    {startPracticeButton}
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
                  </div>
                </CardContent>
              </Card>
            )}

            {outcome?.status === 'session_complete' && (
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>{t.train.sessionCompleteTitle}</CardTitle>
                  <CardDescription>{t.train.sessionCompleteDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <DailySessionSummary
                    day={today}
                    entries={todayEntries}
                    boardTheme={boardTheme}
                    showTitle={false}
                  />
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link to={`/sessions/${session.id}/summary`}>
                        {t.summary.viewSummary}
                      </Link>
                    </Button>
                    {startPracticeButton}
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/dashboard">{t.train.backToDashboard}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {completedRound === null && outcome?.status === 'next' && (
              <PuzzleBoard
                puzzle={outcome.data.puzzle}
                autoAdvance={autoAdvance}
                onComplete={handleComplete}
                onAdvance={handleAdvance}
                isCompleting={recordAttempt.isPending}
                boardTheme={boardTheme}
                pieceSet={pieceSet}
                progress={
                  progress
                    ? {
                        current: Math.min(
                          progress.attemptedThisRound + 1,
                          progress.roundTargetSize,
                        ),
                        total: progress.roundTargetSize,
                      }
                    : undefined
                }
              />
            )}
          </>
        )}

        {import.meta.env.DEV && (
          <DevToolsPanel
            onOpenPuzzle={(sessionPuzzleId, puzzleId) =>
              setPracticeSelection({ sessionPuzzleId, puzzleId })
            }
          />
        )}
      </div>
    </main>
  )
}
