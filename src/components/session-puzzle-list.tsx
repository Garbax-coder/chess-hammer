import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PracticeAttempt, PuzzleAttempt, SessionPuzzleResult } from '@/types/training'

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

/** Un tag per ogni tentativo in pratica libera: verde/rosso col tempo, il migliore evidenziato. */
function PracticeAttemptTags({ attempts }: { attempts: PracticeAttempt[] | undefined }) {
  if (!attempts || attempts.length === 0) return null

  const bestTime = attempts.reduce<number | null>((best, a) => {
    if (a.result !== 'solved') return best
    return best === null ? a.time_seconds : Math.min(best, a.time_seconds)
  }, null)

  return (
    <div className="flex flex-wrap gap-1">
      {attempts.map((a) => {
        const solved = a.result === 'solved'
        const isBest = solved && a.time_seconds === bestTime
        return (
          <span
            key={a.id}
            title={`Pratica libera — ${new Date(a.attempted_at).toLocaleString('it-IT')}: ${
              solved ? 'risolto' : 'fallito'
            } in ${a.time_seconds}s${isBest ? ' (miglior tempo)' : ''}`}
            className={`flex h-5 shrink-0 items-center justify-center rounded px-1.5 text-[0.6rem] font-semibold ${
              solved
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            } ${isBest ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background' : ''}`}
          >
            {isBest && '★ '}
            {a.time_seconds}s
          </span>
        )
      })}
    </div>
  )
}

interface PuzzleRowProps {
  result: SessionPuzzleResult
  isActive: boolean
  currentRound: 1 | 2 | 3
  practiceAttempts: PracticeAttempt[] | undefined
  canPractice: boolean
  onSelect: (result: SessionPuzzleResult) => void
}

function PuzzleRow({
  result,
  isActive,
  currentRound,
  practiceAttempts,
  canPractice,
  onSelect,
}: PuzzleRowProps) {
  const lastAttempt = lastAttemptOf(result)

  return (
    <button
      type="button"
      disabled={!canPractice}
      onClick={() => canPractice && onSelect(result)}
      className={`flex w-full items-center gap-3 rounded-md border px-2.5 py-2 text-left transition-colors ${
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-border/60 bg-muted/40 enabled:hover:bg-muted'
      } ${canPractice ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className="text-foreground shrink-0 text-2xl leading-none font-bold tabular-nums">
        {result.orderIndex}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <RoundIndicator
              round={1}
              attempt={result.attempts[1]}
              isCurrent={currentRound === 1}
            />
            <RoundIndicator
              round={2}
              attempt={result.attempts[2]}
              isCurrent={currentRound === 2}
            />
            <RoundIndicator
              round={3}
              attempt={result.attempts[3]}
              isCurrent={currentRound === 3}
            />
          </div>
          <span className="text-muted-foreground shrink-0 text-[0.65rem]">
            {result.rating}
          </span>
        </div>
        {lastAttempt && (
          <span className="text-muted-foreground text-[0.6rem]">
            {new Date(lastAttempt.attempted_at).toLocaleDateString('it-IT')}
          </span>
        )}
        <PracticeAttemptTags attempts={practiceAttempts} />
      </div>
    </button>
  )
}

interface SessionPuzzleListProps {
  puzzles: SessionPuzzleResult[]
  activeSessionPuzzleId: string | null
  currentRound: 1 | 2 | 3
  practiceAttemptsByPuzzle: Map<string, PracticeAttempt[]>
  canPractice: boolean
  onSelectPuzzle: (result: SessionPuzzleResult) => void
}

export function SessionPuzzleList({
  puzzles,
  activeSessionPuzzleId,
  currentRound,
  practiceAttemptsByPuzzle,
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
        <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
          {puzzles.length === 0 && (
            <p className="text-muted-foreground text-xs">Nessun puzzle ancora eseguito.</p>
          )}
          {[...puzzles].reverse().map((result) => (
            <PuzzleRow
              key={result.sessionPuzzleId}
              result={result}
              isActive={result.sessionPuzzleId === activeSessionPuzzleId}
              currentRound={currentRound}
              practiceAttempts={practiceAttemptsByPuzzle.get(result.puzzleId)}
              canPractice={canPractice}
              onSelect={onSelectPuzzle}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
