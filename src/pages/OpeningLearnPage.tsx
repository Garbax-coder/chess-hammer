import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { OpeningBoard } from '@/components/opening-board'
import { MoveList } from '@/components/opening-move-list'
import { RepertoireGate, type RepertoireData } from '@/components/repertoire-gate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useLocalToggle } from '@/hooks/use-local-toggle'
import { useOpeningRun } from '@/hooks/use-opening-run'
import { useLearnOpeningMove, useOpeningNames } from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { chooseLearnRun, moveLabel, nameAt } from '@/lib/opening-tree'

// Modalita' Learn: si studia una linea seguendo la freccia. L'avversario
// risponde da solo; ogni mossa dell'utente si gioca guidati (o la gioca
// l'app) e diventa "in apprendimento", da ripassare poi nell'allenamento.
// Nessun tentativo a memoria, quindi nessun errore registrato.
export default function OpeningLearnPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <RepertoireGate slug={slug}>
      {(data) => <OpeningLearn key={data.repertoire.id} {...data} />}
    </RepertoireGate>
  )
}

function OpeningLearn({ repertoire, tree, progress }: RepertoireData) {
  const o = useOpeningsTranslations()
  const { data: stats } = useUserStats()
  const { data: names } = useOpeningNames()
  const learn = useLearnOpeningMove()
  const color = repertoire.color
  const base = `/openings/${repertoire.slug}`

  // La linea scelta (?line=<foglia>), oppure la prima con mosse nuove.
  const [searchParams] = useSearchParams()
  const [leafId, setLeafId] = useState<number | undefined>(() => {
    const requested = Number(searchParams.get('line'))
    return tree.leaves.some((leaf) => leaf.id === requested)
      ? requested
      : chooseLearnRun(tree, progress, color)
  })
  const [nonce, setNonce] = useState(0)
  const [fastForward, setFastForward] = useLocalToggle('openings-fast-forward', true)

  const run = useOpeningRun({
    tree,
    color,
    leafId,
    runKey: `${leafId}:${nonce}`,
    fastForward,
    // Nello studio sono note le mosse gia' studiate o allenate.
    isKnown: (node) => progress.has(node.id),
    onCorrect: (node) => learn.mutate(node.id),
  })
  const { path, index, next, done, userTurn, hint } = run

  function startLine(id: number | undefined) {
    setLeafId(id)
    setNonce((n) => n + 1)
  }

  const lineName = leafId ? nameAt(tree, leafId, names ?? new Map()) : undefined
  const label = next ? moveLabel(next, true) : ''
  const status = done
    ? o.lineLearned
    : hint
      ? hint.alternative
        ? o.alternativePlayed(hint.alternative.san, hint.node.san)
        : o.followArrow(label)
      : userTurn
        ? o.playMove(label)
        : o.opponentMoving
  const nextToLearn = done ? chooseLearnRun(tree, progress, color, leafId) : undefined

  return (
    <main className="flex w-full flex-1 flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      <aside className="order-2 flex w-full flex-col gap-4 lg:order-1 lg:w-64 lg:shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-foreground text-base font-semibold tracking-tight">
            {o.names[repertoire.slug] ?? repertoire.name} · {o.learn}
          </h1>
          <p className="text-muted-foreground text-xs">{o.color[color]}</p>
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
            <Link
              to={`/openings/${repertoire.slug}/cycles`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.cycles}
            </Link>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">{o.learnIntro}</p>

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
            <CardTitle className="text-sm">{o.movesTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {lineName && (
              <p className="text-foreground text-xs font-medium">
                <span className="text-muted-foreground font-mono">{lineName.eco}</span>{' '}
                {lineName.name}
              </p>
            )}
            <MoveList nodes={path.slice(0, index)} />
          </CardContent>
        </Card>
      </aside>

      <div className="order-1 flex w-full max-w-[min(36rem,calc(100svh-10rem))] flex-col gap-3 lg:order-2">
        {leafId === undefined ? (
          <div className="flex flex-col gap-3">
            <p className="text-foreground text-sm">{o.allLearned}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to={base}>{o.train}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={`${base}/lines`}>{o.browse}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
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
            <OpeningBoard
              fen={run.fen}
              orientation={color === 'w' ? 'white' : 'black'}
              interactive={userTurn}
              onMove={run.handleMove}
              hintUci={userTurn ? next.uci : undefined}
              lastMoveUci={run.lastMoveUci}
              boardTheme={stats?.board_theme}
              pieceSet={stats?.piece_set}
            />
            {learn.isError && <p className="text-destructive text-xs">{o.saveError}</p>}
            {userTurn && (
              <Button
                variant="outline"
                className="w-fit"
                onClick={() => next && run.handleMove(next.uci)}
              >
                {o.playForMe}
              </Button>
            )}
            {done && (
              <div className="flex flex-wrap gap-2">
                {nextToLearn !== undefined && (
                  <Button onClick={() => startLine(nextToLearn)}>{o.learnNext}</Button>
                )}
                <Button
                  asChild
                  variant={nextToLearn === undefined ? 'default' : 'outline'}
                >
                  <Link to={`${base}?line=${leafId}`}>{o.trainLine}</Link>
                </Button>
                <Button variant="outline" onClick={() => startLine(leafId)}>
                  {o.repeatLearn}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
