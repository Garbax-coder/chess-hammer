import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EditableSessionName } from '@/components/editable-session-name'
import { PracticeFilterControls } from '@/components/practice-filter-controls'
import { PuzzleBoard } from '@/components/puzzle-board'
import { PuzzleBoardSkeleton } from '@/components/puzzle-board-skeleton'
import { SavePuzzleToggle } from '@/components/save-puzzle-toggle'
import { SessionPuzzleList } from '@/components/session-puzzle-list'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  usePracticeAttempts,
  useRecordPracticeAttempt,
} from '@/hooks/use-practice'
import { useSavedPuzzles, useToggleSavedPuzzle } from '@/hooks/use-saved-puzzles'
import { useSessionDetail } from '@/hooks/use-session-history'
import { useSoundEnabled } from '@/hooks/use-sound-enabled'
import {
  useUpdateAutoAdvance,
  useUpdatePracticeFilter,
  useUserStats,
} from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'
import {
  boardPuzzleFrom,
  practicePool,
  practiceResumePuzzle,
  type PracticeFilter,
} from '@/lib/session-progress'

// Stessa modalita' "pratica libera" di TrainPage (PuzzleBoard + tentativi
// che non toccano la sessione/ELO ufficiali), ma qui utilizzabile per
// QUALSIASI sessione, anche completata, non solo quella attiva: e' il
// punto d'arrivo del click su una casella della heatmap "Prestazioni
// puzzle" in dashboard (?puzzle=<sessionPuzzleId> nell'URL).
export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations()
  const { data, isLoading } = useSessionDetail(id)
  const { data: stats } = useUserStats()
  const updateAutoAdvance = useUpdateAutoAdvance()
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundEnabled()
  const [searchParams, setSearchParams] = useSearchParams()
  // "Rifai il puzzle": cambiando la key la scacchiera riparte da capo.
  const [practiceRetries, setPracticeRetries] = useState(0)
  const recordPracticeAttempt = useRecordPracticeAttempt()

  // Stesso filtro salvato di TrainPage.
  const updatePracticeFilter = useUpdatePracticeFilter()
  const { data: savedPuzzleIds } = useSavedPuzzles()
  const toggleSavedPuzzle = useToggleSavedPuzzle()
  const practiceFilter: PracticeFilter = {
    onlyFailed: stats?.practice_only_failed ?? false,
    scope: stats?.practice_failed_scope ?? 'all',
    onlySaved: stats?.practice_only_saved ?? false,
    savedPuzzleIds,
  }

  const selectedSessionPuzzleId = searchParams.get('puzzle')
  const selectedPuzzle = data?.puzzles.find(
    (p) => p.sessionPuzzleId === selectedSessionPuzzleId,
  )
  const practicePuzzle = useMemo(
    () => (selectedPuzzle ? boardPuzzleFrom(selectedPuzzle) : undefined),
    [selectedPuzzle],
  )

  const puzzleIds = useMemo(() => data?.puzzles.map((p) => p.puzzleId) ?? [], [data])
  const { data: practiceAttemptsByPuzzle } = usePracticeAttempts(puzzleIds)

  if (isLoading || !data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  const { session, puzzles } = data
  // "Continua in pratica libera": dopo l'ultimo puzzle praticato in questa
  // sessione, col filtro attivo (stessa regola di allenamento e riepilogo).
  const practiceStart = practiceAttemptsByPuzzle
    ? practiceResumePuzzle(
        puzzles,
        practiceAttemptsByPuzzle,
        practiceFilter,
        session.created_at,
        session.id,
      )
    : undefined
  const autoAdvance = stats?.auto_advance ?? true
  const boardTheme = stats?.board_theme
  const pieceSet = stats?.piece_set

  function selectPuzzle(sessionPuzzleId: string) {
    setSearchParams({ puzzle: sessionPuzzleId })
  }

  function backToList() {
    setSearchParams({})
  }

  async function handlePracticeAttempt(result: 'solved' | 'failed', timeSeconds: number) {
    if (!selectedPuzzle) return
    await recordPracticeAttempt.mutateAsync({
      puzzleId: selectedPuzzle.puzzleId,
      result,
      timeSeconds,
      sessionId: session.id,
    })
  }

  function handlePracticeAdvance() {
    if (!selectedPuzzle) return
    const pool = practicePool(puzzles, practiceFilter)
    const currentIndex = pool.findIndex(
      (p) => p.sessionPuzzleId === selectedPuzzle.sessionPuzzleId,
    )
    const next = currentIndex >= 0 ? pool[currentIndex + 1] : pool[0]
    if (next) {
      selectPuzzle(next.sessionPuzzleId)
    } else {
      backToList()
    }
  }

  return (
    <main className="flex w-full flex-1 flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-3">
      {/* 117px = header (53px) + padding sopra/sotto di questo <main> (py-8,
          32px ciascuno): senza sottrarli, la sidebar sticky puo' sporgere
          di quel tanto oltre il fondo della viewport e costringere a
          scorrere l'intera pagina solo per vederne l'ultima riga. */}
      <aside className="order-2 flex min-h-0 w-full flex-col gap-4 lg:sticky lg:top-14 lg:order-1 lg:max-h-[calc(100vh-117px)] lg:w-64 lg:shrink-0 lg:self-start">
        <div>
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            <EditableSessionName
              session={session}
              fallback={t.sessionDetail.title(
                new Date(session.created_at).toLocaleDateString(t.meta.locale),
              )}
            />
          </h1>
          <p className="text-muted-foreground text-sm">
            {t.sessionDetail.subtitle(
              session.total_puzzles,
              session.current_round,
              t.sessionStatus[session.status],
            )}
          </p>
          <Link
            to={`/sessions/${session.id}/summary`}
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            {t.summary.viewSummary}
          </Link>
        </div>

        {selectedPuzzle && <SavePuzzleToggle puzzleId={selectedPuzzle.puzzleId} />}

        <div className="flex flex-col gap-3">
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

          {/* Sempre visibile: questa pagina e' solo pratica libera, e il
              filtro decide anche da dove riparte "Continua in pratica libera"
              prima di aver scelto un puzzle. */}
          <PracticeFilterControls
            filter={practiceFilter}
            update={updatePracticeFilter.mutate}
            showNoSavedHint={
              practiceFilter.onlySaved === true &&
              !practiceFilter.onlyFailed &&
              !!savedPuzzleIds &&
              !puzzles.some((p) => savedPuzzleIds.has(p.puzzleId))
            }
          />
        </div>

        {selectedPuzzle && (
          <Button variant="outline" size="sm" onClick={backToList}>
            {t.train.backToList}
          </Button>
        )}

        <SessionPuzzleList
          puzzles={puzzles}
          activeSessionPuzzleId={selectedSessionPuzzleId}
          currentRound={session.current_round}
          practiceAttemptsByPuzzle={practiceAttemptsByPuzzle ?? new Map()}
          canPractice
          savedPuzzleIds={savedPuzzleIds}
          onToggleSaved={(puzzleId, saved) => toggleSavedPuzzle.mutate({ puzzleId, saved })}
          onSelectPuzzle={(p) => selectPuzzle(p.sessionPuzzleId)}
          boardTheme={boardTheme}
        />
      </aside>

      <div className="order-1 flex w-full flex-col items-center justify-center gap-6 lg:order-2 lg:w-auto">
        {selectedPuzzle ? (
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
              progress={{ current: selectedPuzzle.orderIndex, total: session.total_puzzles }}
            />
          ) : (
            <PuzzleBoardSkeleton />
          )
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-3">
            <p className="text-muted-foreground text-center text-sm">
              {t.sessionDetail.selectPrompt}
            </p>
            <Button
              disabled={!practiceStart}
              onClick={() => practiceStart && selectPuzzle(practiceStart.sessionPuzzleId)}
            >
              {t.train.startPractice}
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
