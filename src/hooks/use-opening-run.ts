import { Chess } from 'chess.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { OPPONENT_DELAY_MS } from '@/components/opening-board'
import type { OpeningColor } from '@/lib/opening-catalog'
import {
  alternativesTo,
  fastForwardIndex,
  isUserMove,
  mistakesAt,
  runPath,
  sameMove,
  type OpeningNode,
  type OpeningTree,
} from '@/lib/opening-tree'

export type MoveResult = 'correct' | 'alternative' | 'wrong'

/**
 * Dopo una mossa non del repertorio: quella da giocare, e l'alternativa o
 * l'errore noto (una linea sbagliata del repertorio) giocati.
 */
export interface RunHint {
  node: OpeningNode
  alternative: OpeningNode | null
  mistake: OpeningNode | null
}

export interface RunResult {
  nodeId: number
  /** Giusta o alternativa accettata al primo tentativo. */
  ok: boolean
}

interface RunState {
  key: string
  index: number
  startIndex: number
  hint: RunHint | null
  results: RunResult[]
}

/**
 * Una linea (Run) giocata contro l'avversario automatico: la usano Drill,
 * Learn e cicli. L'avversario risponde da solo dopo una breve pausa; per ogni
 * mossa dell'utente `onFirstTry` riceve solo il primo tentativo. Una mossa
 * diversa da quella del repertorio non fa avanzare: se e' un'alternativa
 * accettata conta come valida, altrimenti come errore, e in entrambi i casi
 * resta da giocare la mossa del repertorio.
 *
 * Con l'avanzamento rapido le mosse iniziali che l'utente conosce gia'
 * (`isKnown`) si giocano da sole. La linea riparte da capo quando cambia
 * `runKey`.
 */
export function useOpeningRun({
  tree,
  color,
  leafId,
  runKey,
  fastForward,
  isKnown,
  onFirstTry,
  onCorrect,
}: {
  tree: OpeningTree
  color: OpeningColor
  leafId: number | undefined
  runKey: string
  fastForward: boolean
  isKnown: (node: OpeningNode) => boolean
  onFirstTry?: (
    node: OpeningNode,
    playedUci: string,
    result: MoveResult,
    ms: number,
  ) => void
  /** Ogni volta che si gioca la mossa del repertorio (anche dopo un errore). */
  onCorrect?: (node: OpeningNode) => void
}) {
  const path = useMemo(
    () => (leafId === undefined ? [] : runPath(tree, leafId)),
    [tree, leafId],
  )

  function initial(): RunState {
    const startIndex = fastForward ? fastForwardIndex(path, color, isKnown) : 0
    return { key: runKey, index: startIndex, startIndex, hint: null, results: [] }
  }
  const [state, setState] = useState(initial)
  // Una linea nuova (o la stessa da capo): si riparte, nello stesso render.
  if (state.key !== runKey) setState(initial())

  const fen = useMemo(() => {
    const chess = new Chess()
    for (const node of path.slice(0, state.index)) chess.move(node.san)
    return chess.fen()
  }, [path, state.index])
  const next: OpeningNode | undefined = path[state.index]
  const done = leafId !== undefined && !next
  const userTurn = !!next && isUserMove(next, color)

  // La risposta dell'avversario, dopo una breve pausa.
  useEffect(() => {
    if (!next || userTurn) return
    const timer = setTimeout(
      () => setState((s) => ({ ...s, index: s.index + 1 })),
      OPPONENT_DELAY_MS,
    )
    return () => clearTimeout(timer)
  }, [next, userTurn])

  // Da quando l'utente ha la mossa, per il tempo di risposta.
  const turnStartedAt = useRef(0)
  useEffect(() => {
    if (userTurn) turnStartedAt.current = Date.now()
  }, [userTurn, state.index, state.key])

  /** La mossa dell'utente (UCI); true se e' quella del repertorio. */
  function handleMove(uci: string): boolean {
    if (!next || !userTurn) return false
    const correct = sameMove(uci, next.uci)
    const alternative = correct
      ? null
      : (alternativesTo(tree, next).find((n) => sameMove(uci, n.uci)) ?? null)
    if (!state.results.some((r) => r.nodeId === next.id)) {
      const result: MoveResult = correct
        ? 'correct'
        : alternative
          ? 'alternative'
          : 'wrong'
      onFirstTry?.(next, uci, result, Date.now() - turnStartedAt.current)
      setState((s) => ({
        ...s,
        results: [...s.results, { nodeId: next.id, ok: result !== 'wrong' }],
      }))
    }
    if (correct) onCorrect?.(next)
    setState((s) =>
      correct
        ? { ...s, index: s.index + 1, hint: null }
        : {
            ...s,
            hint: {
              node: next,
              alternative,
              mistake: alternative
                ? null
                : (mistakesAt(tree, next.parent_id).find((n) => sameMove(uci, n.uci)) ??
                  null),
            },
          },
    )
    return correct
  }

  return {
    path,
    index: state.index,
    startIndex: state.startIndex,
    fen,
    next,
    done,
    userTurn,
    hint: state.hint,
    results: state.results,
    lastMoveUci: path[state.index - 1]?.uci,
    handleMove,
  }
}
