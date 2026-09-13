import { useParams } from 'react-router-dom'
import { PuzzleMiniBoard } from '@/components/puzzle-mini-board'
import { RoundIndicator } from '@/components/session-puzzle-list'
import { useSessionDetail } from '@/hooks/use-session-history'
import { useUserStats } from '@/hooks/use-user-stats'
import { DEFAULT_BOARD_THEME } from '@/lib/board-themes'
import type { Translations } from '@/lib/i18n/translations'
import { useTranslations } from '@/lib/language-context'
import type { BoardThemeId } from '@/lib/board-themes'
import type { SessionPuzzleResult } from '@/types/training'

// Stesso linguaggio visivo della sidebar puzzle in allenamento
// (SessionPuzzleList): mini-scacchiera + indicatori di giro, invece di una
// tabella HTML spoglia, cosi' lo storico e l'allenamento in corso si
// riconoscono come la stessa app.
function PuzzleHistoryRow({
  result,
  currentRound,
  boardTheme,
  t,
}: {
  result: SessionPuzzleResult
  currentRound: 1 | 2 | 3
  boardTheme: BoardThemeId
  t: Translations
}) {
  return (
    <div className="border-border/60 bg-muted/40 flex items-center gap-3 rounded-md border px-2.5 py-2">
      <span className="text-foreground shrink-0 text-2xl leading-none font-bold tabular-nums">
        {result.orderIndex}
      </span>
      <PuzzleMiniBoard fen={result.fen} boardTheme={boardTheme} />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <RoundIndicator
            round={1}
            attempt={result.attempts[1]}
            isCurrent={currentRound === 1}
            t={t}
          />
          <RoundIndicator
            round={2}
            attempt={result.attempts[2]}
            isCurrent={currentRound === 2}
            t={t}
          />
          <RoundIndicator
            round={3}
            attempt={result.attempts[3]}
            isCurrent={currentRound === 3}
            t={t}
          />
        </div>
        <span className="text-muted-foreground shrink-0 text-xs">{result.rating}</span>
      </div>
    </div>
  )
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations()
  const { data, isLoading } = useSessionDetail(id)
  const { data: stats } = useUserStats()
  const boardTheme = stats?.board_theme ?? DEFAULT_BOARD_THEME

  if (isLoading || !data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  const { session, puzzles } = data

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
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

      {puzzles.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t.sessionDetail.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {[...puzzles].reverse().map((p) => (
            <PuzzleHistoryRow
              key={p.puzzleId}
              result={p}
              currentRound={session.current_round}
              boardTheme={boardTheme}
              t={t}
            />
          ))}
        </div>
      )}
    </main>
  )
}
