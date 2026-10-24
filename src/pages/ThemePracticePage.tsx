import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PracticeFilterControls } from '@/components/practice-filter-controls'
import { PuzzleBoard } from '@/components/puzzle-board'
import { PuzzleBoardSkeleton } from '@/components/puzzle-board-skeleton'
import { PuzzleSidebar } from '@/components/puzzle-sidebar'
import { SavePuzzleToggle } from '@/components/save-puzzle-toggle'
import { SessionPuzzleList } from '@/components/session-puzzle-list'
import { Button } from '@/components/ui/button'
import { usePracticeAttempts, useRecordPracticeAttempt } from '@/hooks/use-practice'
import { useSavedPuzzles, useToggleSavedPuzzle } from '@/hooks/use-saved-puzzles'
import { useThemePuzzles } from '@/hooks/use-theme-puzzles'
import { useUpdatePracticeFilter, useUserStats } from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'
import {
  boardPuzzleFrom,
  practicePool,
  practiceResumePuzzle,
  type PracticeFilter,
} from '@/lib/session-progress'
import type { ThemePuzzleSource } from '@/lib/theme-puzzles'

// Tutti i tentativi di pratica di questi puzzle contano per riprendere da
// dove si era rimasti, qualunque sia la sessione da cui sono stati fatti.
const ANY_TIME = new Date(0).toISOString()

// Pratica libera sui puzzle di una categoria, aperta dalle classifiche della
// pagina /stats: la stessa pratica di una sessione (SessionDetailPage), su
// una lista che raccoglie i puzzle di quella categoria tentati in tutte le
// sessioni. I tentativi restano legati alla sessione da cui viene ciascun
// puzzle, come se lo si ripassasse da li'.
export default function ThemePracticePage() {
  const { theme } = useParams<{ theme: string }>()
  const t = useTranslations()
  const [searchParams, setSearchParams] = useSearchParams()
  const source: ThemePuzzleSource =
    searchParams.get('source') === 'practice' ? 'practice' : 'training'
  const { data: puzzles, isLoading } = useThemePuzzles(theme, source)
  const { data: stats } = useUserStats()
  const [practiceRetries, setPracticeRetries] = useState(0)
  const recordPracticeAttempt = useRecordPracticeAttempt()

  const updatePracticeFilter = useUpdatePracticeFilter()
  const { data: savedPuzzleIds } = useSavedPuzzles()
  const toggleSavedPuzzle = useToggleSavedPuzzle()
  const practiceFilter: PracticeFilter = {
    onlyFailed: stats?.practice_only_failed ?? false,
    scope: stats?.practice_failed_scope ?? 'all',
    onlySaved: stats?.practice_only_saved ?? false,
    savedPuzzleIds,
  }

  const selectedId = searchParams.get('puzzle')
  const selected = puzzles?.find((p) => p.sessionPuzzleId === selectedId)
  const practicePuzzle = useMemo(
    () => (selected ? boardPuzzleFrom(selected) : undefined),
    [selected],
  )

  const puzzleIds = useMemo(() => puzzles?.map((p) => p.puzzleId) ?? [], [puzzles])
  const { data: practiceAttemptsByPuzzle } = usePracticeAttempts(puzzleIds)

  const themeLabel = theme ? (t.puzzleThemes.labels[theme] ?? theme) : ''
  const backPath = source === 'practice' ? '/stats?tab=practice' : '/stats'

  if (isLoading || !puzzles) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  const practiceStart = practiceAttemptsByPuzzle
    ? practiceResumePuzzle(puzzles, practiceAttemptsByPuzzle, practiceFilter, ANY_TIME)
    : undefined
  const autoAdvance = stats?.auto_advance ?? true
  const boardTheme = stats?.board_theme
  const pieceSet = stats?.piece_set

  function selectPuzzle(sessionPuzzleId: string) {
    setSearchParams(
      source === 'practice'
        ? { source, puzzle: sessionPuzzleId }
        : { puzzle: sessionPuzzleId },
    )
  }

  function backToList() {
    setSearchParams(source === 'practice' ? { source } : {})
  }

  async function handlePracticeAttempt(result: 'solved' | 'failed', timeSeconds: number) {
    if (!selected) return
    await recordPracticeAttempt.mutateAsync({
      puzzleId: selected.puzzleId,
      result,
      timeSeconds,
      sessionId: selected.sessionId ?? undefined,
    })
  }

  function handlePracticeAdvance() {
    if (!selected || !puzzles) return
    const pool = practicePool(puzzles, practiceFilter)
    const currentIndex = pool.findIndex(
      (p) => p.sessionPuzzleId === selected.sessionPuzzleId,
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
      <PuzzleSidebar
        title={t.themePractice.title(themeLabel)}
        subtitle={
          <>
            <span>{t.themePractice.subtitle(puzzles.length, source)}</span>
            <Link
              to={backPath}
              className="text-primary w-fit underline-offset-4 hover:underline"
            >
              {t.themePractice.back}
            </Link>
          </>
        }
      >
        <SessionPuzzleList
          puzzles={puzzles}
          activeSessionPuzzleId={selectedId}
          // Ogni puzzle in lista e' stato tentato almeno una volta: il giro 1
          // mostra la soluzione (PGN) solo di quelli tentati ufficialmente.
          currentRound={1}
          practiceAttemptsByPuzzle={practiceAttemptsByPuzzle ?? new Map()}
          canPractice
          title={t.themePractice.listTitle}
          practiceHint={puzzles.length > 0 ? t.themePractice.hint : undefined}
          savedPuzzleIds={savedPuzzleIds}
          onToggleSaved={(puzzleId, saved) =>
            toggleSavedPuzzle.mutate({ puzzleId, saved })
          }
          onSelectPuzzle={(p) => selectPuzzle(p.sessionPuzzleId)}
          boardTheme={boardTheme}
          filters={
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
          }
        />
      </PuzzleSidebar>

      <div className="order-1 flex w-full flex-col items-center justify-center gap-6 lg:order-2 lg:w-auto">
        {selected ? (
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
              progress={{ current: selected.orderIndex, total: puzzles.length }}
              actions={
                <>
                  <SavePuzzleToggle puzzleId={selected.puzzleId} />
                  <Button variant="outline" size="sm" onClick={backToList}>
                    {t.train.backToList}
                  </Button>
                </>
              }
            />
          ) : (
            <PuzzleBoardSkeleton />
          )
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-3">
            <p className="text-muted-foreground text-center text-sm">
              {puzzles.length > 0 ? t.sessionDetail.selectPrompt : t.themePractice.empty}
            </p>
            {puzzles.length > 0 && (
              <Button
                disabled={!practiceStart}
                onClick={() =>
                  practiceStart && selectPuzzle(practiceStart.sessionPuzzleId)
                }
              >
                {t.train.startPractice}
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
