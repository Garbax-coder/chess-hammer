import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DailySessionSummary } from '@/components/daily-session-summary'
import { DevToolsPanel } from '@/components/dev-tools-panel'
import { EditableSessionName } from '@/components/editable-session-name'
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
import {
  nextPuzzleQueryKey,
  useNextPuzzle,
  useRecordAttempt,
} from '@/hooks/use-puzzle-session'
import {
  usePuzzleById,
  useRecordPracticeAttempt,
  usePracticeAttempts,
} from '@/hooks/use-practice'
import { useSessionPuzzles } from '@/hooks/use-session-history'
import { useSoundEnabled } from '@/hooks/use-sound-enabled'
import { entriesForDay, todayKey } from '@/lib/session-days'
import {
  deriveSessionProgress,
  isFailedPuzzle,
  type FailedPuzzleScope,
} from '@/lib/session-progress'
import { useTranslations } from '@/lib/language-context'
import { useUpdateAutoAdvance, useUserStats } from '@/hooks/use-user-stats'
import type { NextPuzzleOutcome } from '@/lib/puzzle-engine'
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

  // Filtro di avanzamento per la pratica libera: attivabile solo con
  // l'avanzamento automatico acceso (altrimenti il sotto-switch resta
  // nascosto, vedi sotto), quindi qui possono restare valorizzati anche
  // quando non visibili/applicati — handlePracticeAdvance li ignora se
  // autoAdvance e' spento.
  const [onlyFailedPractice, setOnlyFailedPractice] = useState(false)
  const [failedScope, setFailedScope] = useState<FailedPuzzleScope>('all')

  const puzzleIds = useMemo(() => puzzles?.map((p) => p.puzzleId) ?? [], [puzzles])
  const { data: practiceAttemptsByPuzzle } = usePracticeAttempts(puzzleIds)

  // order_index e' stabile tra i 3 giri (stesso pool, nuovi tentativi): dice
  // la posizione del puzzle in pratica libera esattamente come in giro
  // ufficiale, quindi si ricava dalla stessa lista invece di portarsela
  // dietro in practiceSelection.
  const practiceOrderIndex = practiceSelection
    ? puzzles?.find((p) => p.sessionPuzzleId === practiceSelection.sessionPuzzleId)
        ?.orderIndex
    : undefined

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
    pendingOutcomeRef.current = { promise: recordAttempt.mutateAsync(params), params }
  }

  async function handleAdvance() {
    const pending = pendingOutcomeRef.current
    if (!pending || !session) return
    try {
      const nextOutcome = await pending.promise
      pendingOutcomeRef.current = null
      queryClient.setQueryData(nextPuzzleQueryKey(session.id), nextOutcome)
    } catch (error) {
      // Se la registrazione e' fallita (es. rete instabile), il bottone
      // non deve restare bloccato per sempre in attesa di una promise gia'
      // rigettata: si riparte da capo con gli stessi parametri, cosi' un
      // secondo click puo' davvero ritentare la richiesta invece di
      // limitarsi a ri-osservare lo stesso fallimento.
      console.error('Registrazione tentativo fallita, verra\' ritentata', error)
      pendingOutcomeRef.current = {
        promise: recordAttempt.mutateAsync(pending.params),
        params: pending.params,
      }
    }
  }

  async function handlePracticeAttempt(result: 'solved' | 'failed', timeSeconds: number) {
    if (!practiceSelection) return
    await recordPracticeAttempt.mutateAsync({
      puzzleId: practiceSelection.puzzleId,
      result,
      timeSeconds,
    })
  }

  function handlePracticeAdvance() {
    if (!practiceSelection) return
    // A differenza della sessione ufficiale, qui non c'e' nessun esito da
    // aspettare: il puzzle successivo si ricava subito dalla lista gia' in
    // mano (puzzles), quindi avanzare non deve aspettare handlePracticeAttempt.
    if (puzzles) {
      // Il sotto-switch "solo puzzle falliti" e' visibile solo con
      // l'avanzamento automatico acceso: se e' spento lo si ignora anche
      // se e' rimasto attivo da prima, cosi' il comportamento segue
      // esattamente cio' che l'utente vede in interfaccia.
      const pool =
        autoAdvance && onlyFailedPractice
          ? puzzles.filter((p) => isFailedPuzzle(p, failedScope))
          : puzzles
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

          {/* Ha senso solo in pratica libera, e solo se l'avanzamento e'
              automatico: con l'automatico spento non si "avanza" mai da
              soli, e' sempre l'utente a scegliere il prossimo puzzle dalla
              lista. */}
          {practiceSelection && autoAdvance && (
            <div className="flex flex-col gap-2 pl-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="only-failed-practice"
                  checked={onlyFailedPractice}
                  onCheckedChange={setOnlyFailedPractice}
                />
                <Label
                  htmlFor="only-failed-practice"
                  className="text-muted-foreground text-sm"
                >
                  {t.train.onlyFailedPuzzles}
                </Label>
              </div>

              {onlyFailedPractice && (
                <div className="flex gap-1 pl-9">
                  {(['all', 'lastRound'] as const).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setFailedScope(scope)}
                      aria-pressed={failedScope === scope}
                      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        failedScope === scope
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {scope === 'all'
                        ? t.train.failedScopeAll
                        : t.train.failedScopeLastRound}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

            {outcome?.status === 'quota_reached' && (
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
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboard">{t.train.backToDashboard}</Link>
                  </Button>
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
                  <DailySessionSummary
                    day={today}
                    entries={todayEntries}
                    boardTheme={boardTheme}
                    showTitle={false}
                  />
                  <div className="flex flex-col gap-2">
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

        {import.meta.env.DEV && <DevToolsPanel />}
      </div>
    </main>
  )
}
