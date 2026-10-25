import { Chess } from 'chess.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { OpeningBoard } from '@/components/opening-board'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useOpeningProgress,
  useRecordOpeningMove,
  useRepertoires,
} from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import {
  buildOpeningTree,
  chooseRun,
  isUserMove,
  openingCoverage,
  runPath,
  sameMove,
  type OpeningNode,
  type OpeningProgress,
  type OpeningTree,
} from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'

/** Pausa prima della risposta dell'avversario, per seguirla sulla scacchiera. */
export const OPPONENT_DELAY_MS = 500

// Allenamento (Drill) su un repertorio: un Run alla volta, scelto tra quelli
// con piu' mosse da ripassare. L'avversario risponde da solo; alla mossa
// dell'utente conta solo il primo tentativo, e dopo un errore la freccia
// mostra la mossa del repertorio, da giocare per continuare.
export default function OpeningDrillPage() {
  const { slug } = useParams<{ slug: string }>()
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: repertoires, isLoading } = useRepertoires()
  const { data: progress } = useOpeningProgress()
  const repertoire = repertoires?.find((r) => r.slug === slug)
  const tree = useMemo(
    () => (repertoire ? buildOpeningTree(repertoire.nodes) : undefined),
    [repertoire],
  )

  if (isLoading || !repertoires || !progress) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  if (!repertoire || !tree || tree.leaves.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-sm">{o.notFound}</p>
        <Link
          to="/openings"
          className="text-primary text-sm underline-offset-4 hover:underline"
        >
          {o.back}
        </Link>
      </main>
    )
  }

  return (
    <OpeningDrill
      key={repertoire.id}
      repertoire={repertoire}
      tree={tree}
      progress={progress}
    />
  )
}

interface RunState {
  leafId: number
  /** Indice, nel cammino del Run, della prossima mossa da giocare. */
  index: number
  /** Dopo un errore: la mossa del repertorio, da giocare per continuare. */
  hint: OpeningNode | null
  /** Primo tentativo di ogni mossa dell'utente in questo Run. */
  results: { nodeId: number; ok: boolean }[]
}

function newRun(leafId: number): RunState {
  return { leafId, index: 0, hint: null, results: [] }
}

function OpeningDrill({
  repertoire,
  tree,
  progress,
}: {
  repertoire: RepertoireWithNodes
  tree: OpeningTree
  progress: Map<number, OpeningProgress>
}) {
  const o = useOpeningsTranslations()
  const { data: stats } = useUserStats()
  const record = useRecordOpeningMove()
  const color = repertoire.color
  // Una linea scelta dalla pagina di consultazione (?line=<foglia>), oppure
  // quella con piu' mosse da fare.
  const [searchParams] = useSearchParams()
  const [run, setRun] = useState<RunState>(() => {
    const requested = Number(searchParams.get('line'))
    return newRun(
      tree.leaves.some((leaf) => leaf.id === requested)
        ? requested
        : chooseRun(tree, progress, color, new Date())!,
    )
  })

  const path = useMemo(() => runPath(tree, run.leafId), [tree, run.leafId])
  const fen = useMemo(() => {
    const chess = new Chess()
    for (const node of path.slice(0, run.index)) chess.move(node.san)
    return chess.fen()
  }, [path, run.index])
  const next: OpeningNode | undefined = path[run.index]
  const done = !next
  const userTurn = !!next && isUserMove(next, color)

  // La risposta dell'avversario, dopo una breve pausa.
  useEffect(() => {
    if (!next || userTurn) return
    const timer = setTimeout(
      () => setRun((r) => ({ ...r, index: r.index + 1 })),
      OPPONENT_DELAY_MS,
    )
    return () => clearTimeout(timer)
  }, [next, userTurn])

  // Da quando l'utente ha la mossa, per il tempo di risposta.
  const turnStartedAt = useRef(0)
  useEffect(() => {
    if (userTurn) turnStartedAt.current = Date.now()
  }, [userTurn, run.index])

  function handleMove(uci: string): boolean {
    if (!next || !userTurn) return false
    const ok = sameMove(uci, next.uci)
    if (!run.results.some((r) => r.nodeId === next.id)) {
      record.mutate({
        nodeId: next.id,
        runLeafId: run.leafId,
        playedUci: uci,
        result: ok ? 'correct' : 'wrong',
        ms: Date.now() - turnStartedAt.current,
      })
      setRun((r) => ({ ...r, results: [...r.results, { nodeId: next.id, ok }] }))
    }
    setRun((r) => (ok ? { ...r, index: r.index + 1, hint: null } : { ...r, hint: next }))
    return ok
  }

  const coverage = openingCoverage(tree, progress, color, new Date())
  const firstTryCorrect = run.results.filter((r) => r.ok).length
  const status = done
    ? o.runDone
    : run.hint
      ? o.wrong(run.hint.san)
      : userTurn
        ? o.yourMove
        : o.opponentMoving

  return (
    <main className="flex w-full flex-1 flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      <aside className="order-2 flex w-full flex-col gap-4 lg:order-1 lg:w-64 lg:shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-foreground text-base font-semibold tracking-tight">
            {o.names[repertoire.slug] ?? repertoire.name}
          </h1>
          <p className="text-muted-foreground text-xs">
            {o.color[color]} · {o.runs(coverage.runs)}
          </p>
          <div className="flex gap-3 text-xs">
            <Link
              to="/openings"
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.back}
            </Link>
            <Link
              to={`/openings/${repertoire.slug}/lines`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.browse}
            </Link>
          </div>
        </div>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">{o.progressTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex flex-col gap-1 text-xs tabular-nums">
            <span>{o.mastered(coverage.mastered, coverage.userMoves)}</span>
            <span>{o.runsMastered(coverage.runsMastered, coverage.runs)}</span>
            <span>
              {o.due(coverage.due)} · {o.newMoves(coverage.userMoves - coverage.seen)}
            </span>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">{o.movesTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <MoveList nodes={path.slice(0, run.index)} results={run.results} />
          </CardContent>
        </Card>
      </aside>

      <div className="order-1 flex w-full max-w-[min(36rem,calc(100svh-10rem))] flex-col gap-3 lg:order-2">
        <p
          role="status"
          className={`text-sm font-medium ${run.hint ? 'text-destructive' : 'text-foreground'}`}
        >
          {status}
        </p>
        <OpeningBoard
          fen={fen}
          orientation={color === 'w' ? 'white' : 'black'}
          interactive={userTurn}
          onMove={handleMove}
          hintUci={run.hint?.uci}
          lastMoveUci={path[run.index - 1]?.uci}
          boardTheme={stats?.board_theme}
          pieceSet={stats?.piece_set}
        />
        {record.isError && <p className="text-destructive text-xs">{o.saveError}</p>}
        {done && (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              {o.runResult(firstTryCorrect, run.results.length)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  setRun(
                    newRun(chooseRun(tree, progress, color, new Date(), run.leafId)!),
                  )
                }
              >
                {o.nextRun}
              </Button>
              <Button variant="outline" onClick={() => setRun(newRun(run.leafId))}>
                {o.repeatRun}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

/** Le mosse gia' giocate del Run, numerate; quelle dell'utente col loro esito. */
function MoveList({
  nodes,
  results,
}: {
  nodes: OpeningNode[]
  results: { nodeId: number; ok: boolean }[]
}) {
  if (nodes.length === 0) return <p className="text-muted-foreground text-xs">—</p>
  return (
    <ol className="flex flex-wrap gap-x-1.5 gap-y-1 text-xs tabular-nums">
      {nodes.map((node) => {
        const result = results.find((r) => r.nodeId === node.id)
        return (
          <li key={node.id} className="flex items-baseline gap-1">
            {node.ply % 2 === 1 && (
              <span className="text-muted-foreground">{(node.ply + 1) / 2}.</span>
            )}
            <span
              className={
                result
                  ? result.ok
                    ? 'font-medium text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive font-medium'
                  : 'text-foreground'
              }
            >
              {node.san}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
