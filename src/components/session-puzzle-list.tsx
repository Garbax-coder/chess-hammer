import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PracticeStat, PuzzleAttempt, SessionPuzzleResult } from '@/types/training'

interface RoundIndicatorProps {
  round: 1 | 2 | 3
  attempt: PuzzleAttempt | undefined
  isCurrent: boolean
}

function RoundIndicator({ round, attempt, isCurrent }: RoundIndicatorProps) {
  if (attempt) {
    const solved = attempt.result === 'solved'
    return (
      <span
        title={`Giro ${round}: ${solved ? 'risolto' : 'fallito'} in ${attempt.time_seconds}s`}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[0.65rem] font-semibold ${
          solved
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'bg-destructive/10 text-destructive'
        }`}
      >
        {solved ? '✓' : '✕'}
      </span>
    )
  }
  return (
    <span
      title={`Giro ${round}: da fare`}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[0.65rem] ${
        isCurrent ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      {round}
    </span>
  )
}

function lastAttemptOf(result: SessionPuzzleResult): PuzzleAttempt | undefined {
  return result.attempts[3] ?? result.attempts[2] ?? result.attempts[1]
}

interface PuzzleRowProps {
  result: SessionPuzzleResult
  isActive: boolean
  currentRound: 1 | 2 | 3
  practiceStat: PracticeStat | undefined
  canPractice: boolean
  onSelect: (result: SessionPuzzleResult) => void
}

function PuzzleRow({
  result,
  isActive,
  currentRound,
  practiceStat,
  canPractice,
  onSelect,
}: PuzzleRowProps) {
  const lastAttempt = lastAttemptOf(result)

  return (
    <button
      type="button"
      disabled={!canPractice}
      onClick={() => canPractice && onSelect(result)}
      className={`flex w-full flex-col gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors ${
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-transparent enabled:hover:bg-muted'
      } ${canPractice ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-mono text-[0.65rem]">
          #{result.orderIndex}
        </span>
        <span className="text-muted-foreground text-[0.65rem]">{result.rating}</span>
      </div>
      <div className="flex items-center gap-1">
        <RoundIndicator round={1} attempt={result.attempts[1]} isCurrent={currentRound === 1} />
        <RoundIndicator round={2} attempt={result.attempts[2]} isCurrent={currentRound === 2} />
        <RoundIndicator round={3} attempt={result.attempts[3]} isCurrent={currentRound === 3} />
      </div>
      {lastAttempt && (
        <span className="text-muted-foreground text-[0.6rem]">
          {new Date(lastAttempt.attempted_at).toLocaleDateString('it-IT')}
        </span>
      )}
      {practiceStat && (
        <span
          className="text-muted-foreground text-[0.6rem]"
          title={`${practiceStat.count} tentativi in pratica libera, migliore ${practiceStat.bestTimeSeconds}s`}
        >
          ↻ {practiceStat.count}
          {practiceStat.bestTimeSeconds !== null && ` · ${practiceStat.bestTimeSeconds}s`}
        </span>
      )}
    </button>
  )
}

interface SessionPuzzleListProps {
  puzzles: SessionPuzzleResult[]
  activeSessionPuzzleId: string | null
  currentRound: 1 | 2 | 3
  practiceStats: Map<string, PracticeStat>
  canPractice: boolean
  onSelectPuzzle: (result: SessionPuzzleResult) => void
}

export function SessionPuzzleList({
  puzzles,
  activeSessionPuzzleId,
  currentRound,
  practiceStats,
  canPractice,
  onSelectPuzzle,
}: SessionPuzzleListProps) {
  return (
    <Card className="w-full lg:w-64">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Puzzle della sessione</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 pt-0">
        {canPractice && (
          <p className="text-muted-foreground mb-1 text-xs">
            Quota di oggi completata: seleziona un puzzle per allenarti liberamente.
          </p>
        )}
        <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
          {puzzles.length === 0 && (
            <p className="text-muted-foreground text-xs">Nessun puzzle ancora eseguito.</p>
          )}
          {puzzles.map((result) => (
            <PuzzleRow
              key={result.sessionPuzzleId}
              result={result}
              isActive={result.sessionPuzzleId === activeSessionPuzzleId}
              currentRound={currentRound}
              practiceStat={practiceStats.get(result.puzzleId)}
              canPractice={canPractice}
              onSelect={onSelectPuzzle}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
