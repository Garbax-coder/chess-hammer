import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { OpeningBoard } from '@/components/opening-board'
import { MoveList } from '@/components/opening-move-list'
import { OpeningPageHeader } from '@/components/opening-page-header'
import { OpeningPageLayout } from '@/components/opening-page-layout'
import { RepertoireGate, type RepertoireData } from '@/components/repertoire-gate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useLocalToggle } from '@/hooks/use-local-toggle'
import { useOpeningRun, type RunResult } from '@/hooks/use-opening-run'
import { useRecordOpeningMove } from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { chooseRun, moveState, openingCoverage } from '@/lib/opening-tree'

/** Linee di una sessione di allenamento, prima del ripasso degli errori. */
export const SESSION_LINES = 5

// Allenamento (Drill) su un repertorio, a sessioni: SESSION_LINES linee
// scelte tra quelle con piu' mosse da ripassare, poi di nuovo quelle in cui
// si e' sbagliata almeno una mossa, poi il riepilogo. L'avversario risponde
// da solo; alla mossa dell'utente conta solo il primo tentativo, e dopo un
// errore la freccia mostra la mossa del repertorio, da giocare per
// continuare. Le mosse gia' consolidate in testa alla linea si possono
// saltare (avanzamento rapido).
export default function OpeningDrillPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <RepertoireGate slug={slug}>
      {(data) => <OpeningDrill key={data.repertoire.id} {...data} />}
    </RepertoireGate>
  )
}

interface Session {
  phase: 'main' | 'repeat' | 'done'
  leafId: number
  /** Cambia per ripartire da capo, anche sulla stessa linea. */
  nonce: number
  /** Linee giocate (fase principale) e linee con errori da ripassare. */
  played: number[]
  mistakes: number[]
  repeatIndex: number
  /** Primo tentativo di ogni mossa, di tutte le linee della sessione. */
  results: RunResult[]
}

function newSession(firstLeafId: number): Session {
  return {
    phase: 'main',
    leafId: firstLeafId,
    nonce: 0,
    played: [firstLeafId],
    mistakes: [],
    repeatIndex: 0,
    results: [],
  }
}

function OpeningDrill({ repertoire, tree, progress }: RepertoireData) {
  const o = useOpeningsTranslations()
  const { data: stats } = useUserStats()
  const record = useRecordOpeningMove()
  const color = repertoire.color
  const base = `/openings/${repertoire.slug}`
  const [fastForward, setFastForward] = useLocalToggle('openings-fast-forward', true)
  const sessionLines = Math.min(SESSION_LINES, tree.leaves.length)

  // La prima linea: quella scelta dalla consultazione (?line=<foglia>),
  // oppure quella con piu' mosse da fare.
  const [searchParams] = useSearchParams()
  const [session, setSession] = useState<Session>(() => {
    const requested = Number(searchParams.get('line'))
    const first = tree.leaves.some((leaf) => leaf.id === requested)
      ? requested
      : chooseRun(tree, progress, color, new Date())!
    return newSession(first)
  })

  const run = useOpeningRun({
    tree,
    color,
    leafId: session.phase === 'done' ? undefined : session.leafId,
    runKey: `${session.leafId}:${session.nonce}`,
    fastForward,
    isKnown: (node) => moveState(progress.get(node.id), new Date()) === 'mastered',
    onFirstTry: (node, playedUci, result, ms) =>
      record.mutate({
        nodeId: node.id,
        runLeafId: session.leafId,
        playedUci,
        result,
        ms,
      }),
  })

  const lineHasMistakes = run.results.some((r) => !r.ok)
  const lastMainLine = session.phase === 'main' && session.played.length >= sessionLines
  const mistakesAfterThis =
    session.mistakes.length +
    (lineHasMistakes && !session.mistakes.includes(session.leafId) ? 1 : 0)
  const nextLabel =
    session.phase === 'repeat'
      ? session.repeatIndex + 1 < session.mistakes.length
        ? o.nextRun
        : o.showSummary
      : lastMainLine
        ? mistakesAfterThis > 0
          ? o.continueRepeat
          : o.showSummary
        : o.nextRun

  // Fine della linea: la prossima della sessione, il ripasso degli errori o
  // il riepilogo.
  function nextLine() {
    setSession((s) => {
      const results = [...s.results, ...run.results]
      if (s.phase === 'main') {
        const mistakes =
          lineHasMistakes && !s.mistakes.includes(s.leafId)
            ? [...s.mistakes, s.leafId]
            : s.mistakes
        if (s.played.length < sessionLines) {
          const leafId = chooseRun(tree, progress, color, new Date(), new Set(s.played))!
          return {
            ...s,
            leafId,
            nonce: s.nonce + 1,
            played: [...s.played, leafId],
            mistakes,
            results,
          }
        }
        if (mistakes.length > 0) {
          return {
            ...s,
            phase: 'repeat',
            leafId: mistakes[0],
            nonce: s.nonce + 1,
            mistakes,
            repeatIndex: 0,
            results,
          }
        }
        return { ...s, phase: 'done', mistakes, results }
      }
      const repeatIndex = s.repeatIndex + 1
      if (repeatIndex < s.mistakes.length) {
        return {
          ...s,
          leafId: s.mistakes[repeatIndex],
          nonce: s.nonce + 1,
          repeatIndex,
          results,
        }
      }
      return { ...s, phase: 'done', results }
    })
  }

  const coverage = openingCoverage(tree, progress, color, new Date())
  const firstTryCorrect = run.results.filter((r) => r.ok).length
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
  const sessionLabel =
    session.phase === 'repeat'
      ? o.repeatPhase(session.repeatIndex + 1, session.mistakes.length)
      : o.sessionLine(session.played.length, sessionLines)

  return (
    <OpeningPageLayout
      left={
        <>
          <OpeningPageHeader
            repertoire={repertoire}
            mode="train"
            subtitle={`${o.color[color]} · ${o.runs(coverage.runs)}`}
          />
          <div className="flex items-center gap-2">
            <Switch
              id="fast-forward"
              checked={fastForward}
              onCheckedChange={setFastForward}
            />
            <Label
              htmlFor="fast-forward"
              className="text-muted-foreground text-xs font-normal"
            >
              {o.fastForward}
            </Label>
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
          {session.phase !== 'done' && (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">{o.movesTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <MoveList nodes={run.path.slice(0, run.index)} results={run.results} />
              </CardContent>
            </Card>
          )}
        </>
      }
      board={
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
      }
      right={
        session.phase === 'done' ? (
          <SessionSummary
            lines={session.played.length}
            results={session.results}
            repeated={session.mistakes.length}
            onRestart={() =>
              setSession(newSession(chooseRun(tree, progress, color, new Date())!))
            }
            browsePath={`${base}/lines`}
          />
        ) : (
          <>
            <span className="text-muted-foreground text-xs tabular-nums">
              {sessionLabel}
            </span>
            <p
              role="status"
              className={`text-sm font-medium ${
                hint
                  ? hint.alternative
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-destructive'
                  : 'text-foreground'
              }`}
            >
              {status}
            </p>
            {record.isError && <p className="text-destructive text-xs">{o.saveError}</p>}
            {run.done && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">
                  {o.runResult(firstTryCorrect, run.results.length)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={nextLine}>{nextLabel}</Button>
                  <Button
                    variant="outline"
                    onClick={() => setSession((s) => ({ ...s, nonce: s.nonce + 1 }))}
                  >
                    {o.repeatRun}
                  </Button>
                </div>
              </div>
            )}
          </>
        )
      }
    />
  )
}

function SessionSummary({
  lines,
  results,
  repeated,
  onRestart,
  browsePath,
}: {
  lines: number
  results: RunResult[]
  repeated: number
  onRestart: () => void
  browsePath: string
}) {
  const o = useOpeningsTranslations()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{o.sessionDone}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-foreground text-sm tabular-nums">
          {o.sessionSummary(lines, results.filter((r) => r.ok).length, results.length)}
        </p>
        <p className="text-muted-foreground text-sm">{o.repeatedLines(repeated)}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onRestart}>{o.newSession}</Button>
          <Button asChild variant="outline">
            <Link to={browsePath}>{o.browse}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
