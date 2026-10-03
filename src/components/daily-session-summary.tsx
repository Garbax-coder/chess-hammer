import { PuzzleMiniBoard } from '@/components/puzzle-mini-board'
import type { BoardThemeId } from '@/lib/board-themes'
import { formatElapsed } from '@/lib/chess-format'
import { useTranslations } from '@/lib/language-context'
import { dayKeyToLocalDate, type DayEntry } from '@/lib/session-days'

export function DailySessionSummary({
  day,
  entries,
  boardTheme,
  showTitle = true,
}: {
  day: string
  entries: DayEntry[]
  boardTheme?: BoardThemeId
  // False quando il chiamante ha gia' un proprio titolo per lo schermo (es.
  // "Quota di oggi completata" in TrainPage): evita due intestazioni una
  // sopra l'altra per lo stesso momento.
  showTitle?: boolean
}) {
  const t = useTranslations()
  const solved = entries.filter((e) => e.attempt.result === 'solved').length
  const failed = entries.length - solved
  const totalSeconds = entries.reduce((sum, e) => sum + e.attempt.time_seconds, 0)

  return (
    <div className="flex w-full flex-col gap-3">
      {showTitle && (
        <h2 className="text-foreground text-base font-semibold">
          {t.dailySummary.title(dayKeyToLocalDate(day).toLocaleDateString(t.meta.locale))}
        </h2>
      )}
      {entries.length > 0 && (
        <p className="text-muted-foreground text-sm">
          {t.dailySummary.subtitle(solved, failed, formatElapsed(totalSeconds))}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t.dailySummary.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={`${entry.puzzle.sessionPuzzleId}-${entry.round}`}
              className="border-border/60 bg-muted/40 flex items-center gap-3 rounded-md border px-2.5 py-2"
            >
              <span className="text-foreground w-8 shrink-0 text-right text-sm font-bold tabular-nums">
                {entry.puzzle.orderIndex}
              </span>
              <PuzzleMiniBoard fen={entry.puzzle.fen} boardTheme={boardTheme} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">
                  {t.dashboard.puzzlePerformance.roundLabel(entry.round)}
                </span>
                <span className="text-muted-foreground text-xs">{entry.puzzle.rating}</span>
              </div>
              <span
                className={`flex h-6 shrink-0 items-center justify-center rounded px-2 text-xs font-semibold ${
                  entry.attempt.result === 'solved'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {entry.attempt.result === 'solved' ? '✓' : '✕'}{' '}
                {formatElapsed(entry.attempt.time_seconds)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
