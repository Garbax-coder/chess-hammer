import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PuzzleMiniBoard } from '@/components/puzzle-mini-board'
import { Skeleton } from '@/components/ui/skeleton'
import type { BoardThemeId } from '@/lib/board-themes'
import { puzzlePgn } from '@/lib/chess-format'
import type { Translations } from '@/lib/i18n/translations'
import { useTranslations } from '@/lib/language-context'
import type {
  PracticeAttempt,
  PuzzleAttempt,
  SessionPuzzleResult,
} from '@/types/training'

function PuzzleRowSkeleton() {
  return (
    <div className="border-border/60 flex w-full items-center gap-3 rounded-md border px-2.5 py-2">
      <Skeleton className="size-7 shrink-0 rounded" />
      <Skeleton className="size-10 shrink-0 rounded" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  )
}

export interface RoundIndicatorProps {
  round: 1 | 2 | 3
  attempt: PuzzleAttempt | undefined
  isCurrent: boolean
  t: Translations
}

export function RoundIndicator({ round, attempt, isCurrent, t }: RoundIndicatorProps) {
  if (attempt) {
    const solved = attempt.result === 'solved'
    return (
      <span
        title={t.sessionPuzzleList.roundResult(round, solved, attempt.time_seconds)}
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
      title={t.sessionPuzzleList.roundTodo(round)}
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
function PracticeAttemptTags({
  attempts,
  t,
}: {
  attempts: PracticeAttempt[] | undefined
  t: Translations
}) {
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
            title={t.sessionPuzzleList.practiceTooltip(
              new Date(a.attempted_at).toLocaleString(t.meta.locale),
              solved,
              a.time_seconds,
              isBest,
            )}
            className={`flex h-5 shrink-0 items-center justify-center rounded px-1.5 text-[0.6rem] font-semibold ${
              solved
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            } ${isBest ? 'ring-offset-background ring-2 ring-amber-400 ring-offset-1' : ''}`}
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
  boardTheme: BoardThemeId | undefined
  t: Translations
}

function PuzzleRow({
  result,
  isActive,
  currentRound,
  practiceAttempts,
  canPractice,
  onSelect,
  boardTheme,
  t,
}: PuzzleRowProps) {
  const lastAttempt = lastAttemptOf(result)
  // Chiusa di default: con 200 puzzle in lista, mostrare subito i temi di
  // ognuno affollerebbe la sidebar senza reale beneficio finche' non serve.
  const [themesOpen, setThemesOpen] = useState(false)
  // Il PGN copiato contiene la soluzione: va nascosto finche' il puzzle non
  // e' stato tentato nel giro corrente, altrimenti l'utente potrebbe
  // sbirciarla prima di risolverlo.
  const isPending = !result.attempts[currentRound]

  return (
    <div
      className={`flex w-full flex-col gap-1.5 rounded-md border px-2.5 py-2 transition-colors ${
        isActive ? 'border-primary bg-primary/10' : 'border-border/60 bg-muted/40'
      }`}
    >
      <button
        type="button"
        data-session-puzzle-id={result.sessionPuzzleId}
        disabled={!canPractice}
        onClick={() => canPractice && onSelect(result)}
        className={`flex w-full items-center gap-3 text-left ${
          canPractice ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <span className="text-foreground shrink-0 text-2xl leading-none font-bold tabular-nums">
          {result.orderIndex}
        </span>
        <PuzzleMiniBoard fen={result.fen} boardTheme={boardTheme} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
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
            <span className="text-muted-foreground shrink-0 text-[0.65rem]">
              {result.rating}
            </span>
          </div>
          {lastAttempt && (
            <span className="text-muted-foreground text-[0.6rem]">
              {new Date(lastAttempt.attempted_at).toLocaleDateString(t.meta.locale)}
            </span>
          )}
          <PracticeAttemptTags attempts={practiceAttempts} t={t} />
        </div>
      </button>

      <button
        type="button"
        aria-expanded={themesOpen}
        disabled={isPending}
        title={isPending ? t.sessionPuzzleList.infoDisabledHint : undefined}
        onClick={() => setThemesOpen((v) => !v)}
        className={`flex items-center gap-1 self-start text-[0.6rem] transition-colors ${
          isPending
            ? 'text-muted-foreground/50 cursor-not-allowed'
            : 'text-muted-foreground hover:text-foreground cursor-pointer'
        }`}
      >
        <span className={`transition-transform ${themesOpen ? 'rotate-90' : ''}`}>▸</span>
        {t.sessionPuzzleList.themesToggle}
      </button>
      {themesOpen && !isPending && (
        <div className="flex flex-col gap-1.5 pl-3.5">
          <div className="flex flex-wrap gap-1">
            {result.themes.length === 0 && (
              <span className="text-muted-foreground text-[0.6rem]">
                {t.sessionPuzzleList.themesEmpty}
              </span>
            )}
            {result.themes.map((theme) => (
              <span
                key={theme}
                className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[0.6rem]"
              >
                {t.puzzleThemes.labels[theme] ?? theme}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <CopyButton
              getText={() => result.fen}
              label={t.sessionPuzzleList.copyFen}
              copiedLabel={t.sessionPuzzleList.fenCopied}
            />
            <CopyButton
              getText={() => puzzlePgn(result.fen, result.moves)}
              label={t.sessionPuzzleList.copyPgn}
              copiedLabel={t.sessionPuzzleList.fenCopied}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CopyButton({
  getText,
  label,
  copiedLabel,
}: {
  getText: () => string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API non disponibile o permesso negato: nessun feedback
      // di errore, l'utente puo' comunque riprovare.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-[0.6rem] transition-colors"
    >
      {copied ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <Copy className="size-3 shrink-0" />
      )}
      {copied ? copiedLabel : label}
    </button>
  )
}

interface SessionPuzzleListProps {
  puzzles: SessionPuzzleResult[]
  isLoading?: boolean
  activeSessionPuzzleId: string | null
  currentRound: 1 | 2 | 3
  practiceAttemptsByPuzzle: Map<string, PracticeAttempt[]>
  canPractice: boolean
  onSelectPuzzle: (result: SessionPuzzleResult) => void
  boardTheme?: BoardThemeId
}

export function SessionPuzzleList({
  puzzles,
  isLoading = false,
  activeSessionPuzzleId,
  currentRound,
  practiceAttemptsByPuzzle,
  canPractice,
  onSelectPuzzle,
  boardTheme,
}: SessionPuzzleListProps) {
  const t = useTranslations()
  const listRef = useRef<HTMLDivElement>(null)

  // Chi arriva da fuori (es. click su un quadratino della heatmap in
  // dashboard) puo' selezionare un puzzle a meta' di una lista lunga anche
  // 200 righe: la porta in vista automaticamente invece di lasciare
  // l'utente a scorrere alla cieca per trovarla.
  useEffect(() => {
    if (!activeSessionPuzzleId || !listRef.current) return
    const row = listRef.current.querySelector<HTMLElement>(
      `[data-session-puzzle-id="${activeSessionPuzzleId}"]`,
    )
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeSessionPuzzleId])

  return (
    <Card className="min-h-0 w-full flex-1 lg:w-64">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">{t.sessionPuzzleList.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-1 pt-0">
        {canPractice && (
          <p className="text-muted-foreground mb-1 text-xs">
            {t.sessionPuzzleList.quotaHint}
          </p>
        )}
        <div
          ref={listRef}
          className="scrollbar-hide flex max-h-[70vh] flex-col gap-2 overflow-y-auto lg:max-h-none lg:min-h-0 lg:flex-1"
        >
          {isLoading &&
            puzzles.length === 0 &&
            Array.from({ length: 6 }, (_, i) => <PuzzleRowSkeleton key={i} />)}
          {!isLoading && puzzles.length === 0 && (
            <p className="text-muted-foreground text-xs">{t.sessionPuzzleList.empty}</p>
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
              boardTheme={boardTheme}
              t={t}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
