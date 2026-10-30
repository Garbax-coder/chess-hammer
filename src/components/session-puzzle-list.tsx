import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PuzzleInfoContent } from '@/components/puzzle-info'
import { PuzzleMiniBoard } from '@/components/puzzle-mini-board'
import { Skeleton } from '@/components/ui/skeleton'
import type { BoardThemeId } from '@/lib/board-themes'
import type { Translations } from '@/lib/i18n/translations'
import { useTranslations } from '@/lib/language-context'
import { lastAttemptDay, puzzleIdsForDay } from '@/lib/session-days'
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
  isHighlighted: boolean
  currentRound: 1 | 2 | 3
  practiceAttempts: PracticeAttempt[] | undefined
  canPractice: boolean
  onSelect: (result: SessionPuzzleResult) => void
  boardTheme: BoardThemeId | undefined
  t: Translations
  isSaved: boolean
  onToggleSaved?: (puzzleId: string, saved: boolean) => void
}

function PuzzleRow({
  result,
  isActive,
  isHighlighted,
  currentRound,
  practiceAttempts,
  canPractice,
  onSelect,
  boardTheme,
  t,
  isSaved,
  onToggleSaved,
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
      data-puzzle-row
      className={`flex w-full flex-col gap-1.5 rounded-md border px-2.5 py-2 transition-colors ${
        isActive
          ? 'border-primary bg-primary/10'
          : isHighlighted
            ? 'border-sky-400/70 bg-sky-500/5'
            : 'border-border/60 bg-muted/40'
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
          {isHighlighted && !isActive && (
            <span className="text-sky-600 dark:text-sky-400 self-start text-[0.6rem] font-medium">
              {t.sessionPuzzleList.lastSessionBadge}
            </span>
          )}
          {lastAttempt && (
            <span className="text-muted-foreground text-[0.6rem]">
              {new Date(lastAttempt.attempted_at).toLocaleDateString(t.meta.locale)}
            </span>
          )}
          <PracticeAttemptTags attempts={practiceAttempts} t={t} />
        </div>
      </button>

      <div className="flex items-center justify-between gap-2">
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
      {/* Segnalibro dei puzzle "problematici", da rigiocare in pratica libera. */}
      {onToggleSaved && (
        <button
          type="button"
          aria-pressed={isSaved}
          aria-label={
            isSaved
              ? t.savedPuzzle.unsaveRow(result.orderIndex)
              : t.savedPuzzle.saveRow(result.orderIndex)
          }
          title={isSaved ? t.savedPuzzle.saved : t.savedPuzzle.save}
          onClick={() => onToggleSaved(result.puzzleId, !isSaved)}
          className={`-m-1 rounded-md p-1 transition-colors ${
            isSaved
              ? 'text-primary hover:bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {isSaved ? (
            <BookmarkCheck className="size-3.5" />
          ) : (
            <Bookmark className="size-3.5" />
          )}
        </button>
      )}
      </div>
      {themesOpen && !isPending && (
        <PuzzleInfoContent
          className="pl-3.5"
          fen={result.fen}
          moves={result.moves}
          themes={result.themes}
        />
      )}
    </div>
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
  savedPuzzleIds?: ReadonlySet<string>
  onToggleSaved?: (puzzleId: string, saved: boolean) => void
  /** Al posto del titolo e dell'avviso della quota del giorno, per una
   *  lista che non e' quella di una sessione. */
  title?: string
  practiceHint?: string
  /** Filtri della pratica libera, nell'intestazione: e' la lista che filtrano. */
  filters?: ReactNode
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
  savedPuzzleIds,
  onToggleSaved,
  title,
  practiceHint,
  filters,
}: SessionPuzzleListProps) {
  const t = useTranslations()
  const listRef = useRef<HTMLDivElement>(null)

  // Evidenzia, solo in modalita' pratica libera (canPractice), i puzzle
  // toccati nell'ultimo giorno di calendario in cui si e' allenato: aiuta a
  // ritrovare "quelli di ieri" in una lista lunga fino a 200 righe. Non ha
  // senso durante l'allenamento del giro corrente (canPractice false): li'
  // l'evidenziazione si confonderebbe con lo stato "corrente" del puzzle.
  const highlightedIds = useMemo(() => {
    if (!canPractice) return new Set<string>()
    const day = lastAttemptDay(puzzles)
    return day ? puzzleIdsForDay(puzzles, day) : new Set<string>()
  }, [puzzles, canPractice])

  const orderedPuzzles = useMemo(() => [...puzzles].reverse(), [puzzles])

  // Ogni volta che il puzzle attivo cambia la lista scorre fino a portarlo
  // in cima alla propria area visibile, SENZA spostarlo dalla sua posizione
  // naturale (order_index) nella lista: l'utente lo deve vedere senza
  // scorrere a mano, ma la lista resta ordinata come sempre. Si imposta
  // scrollTop direttamente sul contenitore (non scrollIntoView, che su una
  // pagina lunga puo' trascinare con se' anche lo scroll della pagina
  // intera, non solo di questo riquadro).
  // Non e' gated da canPractice: durante il giro 1 funziona "per caso"
  // perche' ogni nuovo puzzle viene inserito con l'order_index piu' alto
  // (quindi finisce gia' in cima dopo il reverse), ma nei giri 2 e 3 si
  // percorre lo stesso pool fisso dall'inizio, quindi senza questo scroll
  // il puzzle attivo resta fuori vista mentre si avanza nella lista.
  useEffect(() => {
    if (!activeSessionPuzzleId || !listRef.current) return
    const container = listRef.current
    // Si porta in cima il riquadro intero della riga (bordo compreso), non il
    // pulsante al suo interno: altrimenti bordo e margine restavano tagliati.
    const row = container
      .querySelector<HTMLElement>(`[data-session-puzzle-id="${activeSessionPuzzleId}"]`)
      ?.closest<HTMLElement>('[data-puzzle-row]')
    if (!row) return
    const offset =
      row.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    container.scrollTop = offset
  }, [activeSessionPuzzleId, orderedPuzzles])

  return (
    <Card size="sm" className="min-h-0 w-full flex-1 lg:w-64">
      <CardHeader className="gap-2">
        <CardTitle>{title ?? t.sessionPuzzleList.title}</CardTitle>
        {filters}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-1 pt-0">
        {canPractice && (
          <p className="text-muted-foreground mb-1 text-xs">
            {practiceHint ?? t.sessionPuzzleList.quotaHint}
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
          {orderedPuzzles.map((result) => (
            <PuzzleRow
              key={result.sessionPuzzleId}
              result={result}
              isActive={result.sessionPuzzleId === activeSessionPuzzleId}
              isHighlighted={highlightedIds.has(result.sessionPuzzleId)}
              currentRound={currentRound}
              practiceAttempts={practiceAttemptsByPuzzle.get(result.puzzleId)}
              canPractice={canPractice}
              onSelect={onSelectPuzzle}
              boardTheme={boardTheme}
              t={t}
              isSaved={savedPuzzleIds?.has(result.puzzleId) ?? false}
              onToggleSaved={onToggleSaved}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
