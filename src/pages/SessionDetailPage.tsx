import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EditableSessionName } from '@/components/editable-session-name'
import { PuzzleBoard } from '@/components/puzzle-board'
import { PuzzleBoardSkeleton } from '@/components/puzzle-board-skeleton'
import { SessionPuzzleList } from '@/components/session-puzzle-list'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  usePracticeAttempts,
  usePuzzleById,
  useRecordPracticeAttempt,
} from '@/hooks/use-practice'
import { useSessionDetail } from '@/hooks/use-session-history'
import { useSoundEnabled } from '@/hooks/use-sound-enabled'
import { useUpdateAutoAdvance, useUserStats } from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'
import { isFailedPuzzle, type FailedPuzzleScope } from '@/lib/session-progress'

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
  const recordPracticeAttempt = useRecordPracticeAttempt()

  // Stesso filtro di avanzamento di TrainPage (vedi li' per il motivo):
  // attivo solo quando l'avanzamento automatico e' acceso.
  const [onlyFailedPractice, setOnlyFailedPractice] = useState(false)
  const [failedScope, setFailedScope] = useState<FailedPuzzleScope>('all')

  const selectedSessionPuzzleId = searchParams.get('puzzle')
  const selectedPuzzle = data?.puzzles.find(
    (p) => p.sessionPuzzleId === selectedSessionPuzzleId,
  )
  const { data: practicePuzzle } = usePuzzleById(selectedPuzzle?.puzzleId)

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
    })
  }

  function handlePracticeAdvance() {
    if (!selectedPuzzle) return
    const pool = onlyFailedPractice
      ? puzzles.filter((p) => isFailedPuzzle(p, failedScope))
      : puzzles
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
        </div>

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

          {/* Vedi TrainPage: ha senso solo in pratica (qui sempre il caso,
              questa pagina e' solo pratica libera). */}
          {selectedPuzzle && (
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
          onSelectPuzzle={(p) => selectPuzzle(p.sessionPuzzleId)}
          boardTheme={boardTheme}
        />
      </aside>

      <div className="order-1 flex w-full flex-col items-center justify-center gap-6 lg:order-2 lg:w-auto">
        {selectedPuzzle ? (
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
              progress={{ current: selectedPuzzle.orderIndex, total: session.total_puzzles }}
            />
          ) : (
            <PuzzleBoardSkeleton />
          )
        ) : (
          <p className="text-muted-foreground max-w-sm text-center text-sm">
            {t.sessionDetail.selectPrompt}
          </p>
        )}
      </div>
    </main>
  )
}
