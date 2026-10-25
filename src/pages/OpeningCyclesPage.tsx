import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OpeningBoard } from '@/components/opening-board'
import { RepertoireGate, type RepertoireData } from '@/components/repertoire-gate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOpeningRun, type RunResult } from '@/hooks/use-opening-run'
import {
  useOpeningCycles,
  useRecordOpeningMove,
  useSaveOpeningCycle,
} from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { formatElapsed } from '@/lib/chess-format'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import type { OpeningCycle } from '@/lib/openings'

/** Pausa tra una linea e la successiva del ciclo. */
export const NEXT_LINE_DELAY_MS = 700

const formatMs = (ms: number) => formatElapsed(Math.round(ms / 1000))

// Cicli Woodpecker su un repertorio: tutte le linee di fila, nell'ordine
// dell'albero, senza avanzamento rapido (ogni ciclo e' lo stesso lavoro), a
// tempo. Il ciclo completato si salva con tempo e precisione e si confronta
// con il precedente: l'obiettivo e' finirlo ogni volta piu' in fretta. Le
// mosse contano anche per il ripasso, come nell'allenamento.
export default function OpeningCyclesPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <RepertoireGate slug={slug}>
      {(data) => <OpeningCycles key={data.repertoire.id} {...data} />}
    </RepertoireGate>
  )
}

interface CycleState {
  status: 'idle' | 'running' | 'done'
  lineIndex: number
  startedAt: number
  results: RunResult[]
  totalMs: number
}

const IDLE: CycleState = {
  status: 'idle',
  lineIndex: 0,
  startedAt: 0,
  results: [],
  totalMs: 0,
}

function OpeningCycles({ repertoire, tree }: RepertoireData) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: stats } = useUserStats()
  const { data: cycles } = useOpeningCycles(repertoire.id)
  const record = useRecordOpeningMove()
  const save = useSaveOpeningCycle()
  const color = repertoire.color
  const base = `/openings/${repertoire.slug}`
  const lines = tree.leaves
  const [state, setState] = useState<CycleState>(IDLE)
  const running = state.status === 'running'
  const lastCycle = cycles?.[cycles.length - 1]
  const nextCycle = (lastCycle?.cycle ?? 0) + 1

  const run = useOpeningRun({
    tree,
    color,
    leafId: running ? lines[state.lineIndex].id : undefined,
    runKey: `${state.startedAt}:${state.lineIndex}`,
    fastForward: false,
    isKnown: () => false,
    onFirstTry: (node, playedUci, result, ms) =>
      record.mutate({
        nodeId: node.id,
        runLeafId: lines[state.lineIndex].id,
        playedUci,
        result,
        ms,
      }),
  })

  // A fine linea si passa da soli alla successiva; dopo l'ultima il ciclo
  // e' completo e si salva.
  const runResults = useRef(run.results)
  runResults.current = run.results
  useEffect(() => {
    if (!running || !run.done) return
    const timer = setTimeout(() => {
      setState((s) => {
        const results = [...s.results, ...runResults.current]
        if (s.lineIndex + 1 < lines.length) {
          return { ...s, lineIndex: s.lineIndex + 1, results }
        }
        return { ...s, status: 'done', results, totalMs: Date.now() - s.startedAt }
      })
    }, NEXT_LINE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [running, run.done, lines.length])

  const savedFor = useRef(0)
  useEffect(() => {
    if (state.status !== 'done' || savedFor.current === state.startedAt) return
    savedFor.current = state.startedAt
    save.mutate({
      repertoireId: repertoire.id,
      cycle: nextCycle,
      lines: lines.length,
      moves: state.results.length,
      correct: state.results.filter((r) => r.ok).length,
      totalMs: state.totalMs,
      startedAt: new Date(state.startedAt).toISOString(),
    })
  }, [state, save, repertoire.id, nextCycle, lines.length])

  // L'orologio del ciclo in corso.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [running])

  function start() {
    const startedAt = Date.now()
    setNow(startedAt)
    setState({ ...IDLE, status: 'running', startedAt })
  }

  const hint = run.hint
  const status = run.done
    ? o.runDone
    : hint
      ? hint.alternative
        ? o.alternativePlayed(hint.alternative.san, hint.node.san)
        : o.wrong(hint.node.san)
      : run.userTurn
        ? o.yourMove
        : o.opponentMoving
  // Il ciclo appena salvato e quello prima, per il confronto.
  const saved = state.status === 'done' ? save.data : undefined
  const before = saved ? cycles?.filter((c) => c.cycle < saved.cycle).at(-1) : lastCycle

  return (
    <main className="flex w-full flex-1 flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      <aside className="order-2 flex w-full flex-col gap-4 lg:order-1 lg:w-72 lg:shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-foreground text-base font-semibold tracking-tight">
            {o.names[repertoire.slug] ?? repertoire.name} · {o.cycles}
          </h1>
          <p className="text-muted-foreground text-xs">
            {o.color[color]} · {o.runs(lines.length)}
          </p>
          <div className="flex gap-3 text-xs">
            <Link
              to="/openings"
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.back}
            </Link>
            <Link to={base} className="text-primary underline-offset-4 hover:underline">
              {o.train}
            </Link>
            <Link
              to={`${base}/lines`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.browse}
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground text-xs">{o.cyclesIntro}</p>
        <CycleHistory cycles={cycles ?? []} locale={t.meta.locale} />
      </aside>

      <div className="order-1 flex w-full max-w-[min(36rem,calc(100svh-10rem))] flex-col gap-3 lg:order-2">
        {state.status === 'idle' && (
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-foreground text-lg font-semibold">{o.cyclesTitle}</h2>
            {lastCycle && (
              <p className="text-muted-foreground text-sm">
                {o.previousCycle(formatMs(lastCycle.total_ms))}
              </p>
            )}
            <Button onClick={start}>{o.startCycle(nextCycle)}</Button>
          </div>
        )}

        {running && (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <p
                role="status"
                className={`text-sm font-medium ${hint && !hint.alternative ? 'text-destructive' : 'text-foreground'}`}
              >
                {status}
              </p>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {o.cycleProgress(nextCycle, state.lineIndex + 1, lines.length)} ·{' '}
                <span className="text-foreground font-medium">
                  {formatMs(now - state.startedAt)}
                </span>
              </span>
            </div>
            <OpeningBoard
              fen={run.fen}
              orientation={color === 'w' ? 'white' : 'black'}
              interactive={run.userTurn}
              onMove={run.handleMove}
              hintUci={hint?.node.uci}
              lastMoveUci={run.lastMoveUci}
              boardTheme={stats?.board_theme}
              pieceSet={stats?.piece_set}
            />
            {lastCycle && (
              <p className="text-muted-foreground text-xs">
                {o.previousCycle(formatMs(lastCycle.total_ms))}
              </p>
            )}
          </>
        )}

        {state.status === 'done' && (
          <Card>
            <CardHeader>
              <CardTitle>{o.cycleDone(saved?.cycle ?? nextCycle)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-foreground text-sm tabular-nums">
                {o.cycleResult(
                  formatMs(state.totalMs),
                  state.results.filter((r) => r.ok).length,
                  state.results.length,
                )}
              </p>
              {before && (
                <p className="text-muted-foreground text-sm">
                  {state.totalMs <= before.total_ms
                    ? o.faster(formatMs(before.total_ms - state.totalMs))
                    : o.slower(formatMs(state.totalMs - before.total_ms))}
                </p>
              )}
              {save.isError && <p className="text-destructive text-xs">{o.saveError}</p>}
              <Button className="w-fit" disabled={!saved} onClick={start}>
                {o.startCycle((saved?.cycle ?? nextCycle) + 1)}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

function CycleHistory({ cycles, locale }: { cycles: OpeningCycle[]; locale: string }) {
  const o = useOpeningsTranslations()
  const c = o.cycleColumns
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm">{o.cyclesTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {cycles.length === 0 ? (
          <p className="text-muted-foreground text-xs">{o.noCycles}</p>
        ) : (
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 font-medium">{c.cycle}</th>
                <th className="py-1 font-medium">{c.date}</th>
                <th className="py-1 text-right font-medium">{c.time}</th>
                <th className="py-1 text-right font-medium">{c.accuracy}</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((cycle) => (
                <tr key={cycle.id} className="border-t">
                  <td className="py-1">{cycle.cycle}</td>
                  <td className="py-1">
                    {new Date(cycle.completed_at).toLocaleDateString(locale)}
                  </td>
                  <td className="py-1 text-right">{formatMs(cycle.total_ms)}</td>
                  <td className="py-1 text-right">
                    {cycle.moves > 0
                      ? Math.round((cycle.correct / cycle.moves) * 100)
                      : 0}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
