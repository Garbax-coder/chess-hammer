import { Check } from 'lucide-react'
import { lazy, Suspense, useState, useSyncExternalStore } from 'react'
import { StaticBoard } from '@/components/marketing/static-board'
import { marketingCopy } from '@/lib/i18n/marketing'
import type { Language } from '@/lib/i18n/translations'
import {
  applyTryPuzzleReply,
  FORK_PUZZLE,
  playTryPuzzleMove,
  startTryPuzzle,
} from '@/lib/landing-puzzles'

const REPLY_DELAY_MS = 450
const TryPuzzleBoard = lazy(() => import('@/components/marketing/try-puzzle-board'))
const noSubscribe = () => () => {}

// Puzzle giocabile senza account nella home. Lato server (HTML pre-generato)
// si vede la stessa posizione su una scacchiera statica.
export function TryPuzzle({ lang }: { lang: Language }) {
  const copy = marketingCopy[lang].puzzle
  const isClient = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  )
  const [state, setState] = useState(() => startTryPuzzle(FORK_PUZZLE))
  const [replyPending, setReplyPending] = useState(false)

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }): boolean {
    if (!targetSquare || replyPending) return false
    const { state: next, reply } = playTryPuzzleMove(
      FORK_PUZZLE,
      state,
      `${sourceSquare}${targetSquare}`,
    )
    setState(next)
    if (next.status === 'wrong') return false
    if (reply) {
      setReplyPending(true)
      setTimeout(() => {
        setState((s) => applyTryPuzzleReply(FORK_PUZZLE, s))
        setReplyPending(false)
      }, REPLY_DELAY_MS)
    }
    return true
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {isClient ? (
        <Suspense fallback={<StaticBoard fen={state.fen} orientation="black" />}>
          <TryPuzzleBoard
            fen={state.fen}
            canDrag={state.status !== 'solved' && !replyPending}
            onPieceDrop={onPieceDrop}
          />
        </Suspense>
      ) : (
        <StaticBoard fen={state.fen} orientation="black" />
      )}
      <p className="min-h-10 text-sm" aria-live="polite">
        {state.status === 'playing' && copy.prompt}
        {state.status === 'wrong' && copy.wrong}
        {state.status === 'solved' && (
          <span className="text-primary inline-flex items-center gap-2 font-medium">
            <Check className="size-4 shrink-0" /> {copy.solved}
          </span>
        )}
      </p>
    </div>
  )
}
