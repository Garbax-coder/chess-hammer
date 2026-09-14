import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { PuzzleBoard } from '@/components/puzzle-board'
import { PuzzleBoardSkeleton } from '@/components/puzzle-board-skeleton'
import { SessionPuzzleList } from '@/components/session-puzzle-list'
import { Button } from '@/components/ui/button'
import {
  usePracticeAttempts,
  usePuzzleById,
  useRecordPracticeAttempt,
} from '@/hooks/use-practice'
import { useSessionDetail } from '@/hooks/use-session-history'
import { useUserStats } from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const recordPracticeAttempt = useRecordPracticeAttempt()

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
    const currentIndex = puzzles.findIndex(
      (p) => p.sessionPuzzleId === selectedPuzzle.sessionPuzzleId,
    )
    const next = currentIndex >= 0 ? puzzles[currentIndex + 1] : undefined
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
            {t.sessionDetail.title(
              new Date(session.created_at).toLocaleDateString(t.meta.locale),
            )}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t.sessionDetail.subtitle(
              session.total_puzzles,
              session.current_round,
              t.sessionStatus[session.status],
            )}
          </p>
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
