import { Chess } from 'chess.js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { OPPONENT_DELAY_MS, OpeningBoard } from '@/components/opening-board'
import { MoveList } from '@/components/opening-move-list'
import { RepertoireGate, type RepertoireData } from '@/components/repertoire-gate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLearnOpeningMove, useOpeningNames } from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import {
  chooseLearnRun,
  isUserMove,
  moveLabel,
  nameAt,
  runPath,
  sameMove,
  type OpeningNode,
} from '@/lib/opening-tree'

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
  const [index, setIndex] = useState(0)
  const [missed, setMissed] = useState(false)

  const path = useMemo(() => (leafId ? runPath(tree, leafId) : []), [tree, leafId])
  const fen = useMemo(() => {
    const chess = new Chess()
    for (const node of path.slice(0, index)) chess.move(node.san)
    return chess.fen()
  }, [path, index])
  const next: OpeningNode | undefined = path[index]
  const done = leafId !== undefined && !next
  const userTurn = !!next && isUserMove(next, color)

  // La risposta dell'avversario, dopo una breve pausa.
  useEffect(() => {
    if (!next || userTurn) return
    const timer = setTimeout(() => setIndex((i) => i + 1), OPPONENT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [next, userTurn])

  function playNext() {
    if (!next || !userTurn) return
    learn.mutate(next.id)
    setMissed(false)
    setIndex((i) => i + 1)
  }

  function handleMove(uci: string): boolean {
    if (!next || !userTurn) return false
    if (!sameMove(uci, next.uci)) {
      setMissed(true)
      return false
    }
    playNext()
    return true
  }

  function startLine(id: number | undefined) {
    setLeafId(id)
    setIndex(0)
    setMissed(false)
  }

  const lineName = leafId ? nameAt(tree, leafId, names ?? new Map()) : undefined
  const label = next ? moveLabel(next, true) : ''
  const status = done
    ? o.lineLearned
    : missed
      ? o.followArrow(label)
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
          </div>
        </div>

        <p className="text-muted-foreground text-xs">{o.learnIntro}</p>

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
              className={`text-sm font-medium ${missed ? 'text-destructive' : 'text-foreground'}`}
            >
              {status}
            </p>
            <OpeningBoard
              fen={fen}
              orientation={color === 'w' ? 'white' : 'black'}
              interactive={userTurn}
              onMove={handleMove}
              hintUci={userTurn ? next.uci : undefined}
              lastMoveUci={path[index - 1]?.uci}
              boardTheme={stats?.board_theme}
              pieceSet={stats?.piece_set}
            />
            {learn.isError && <p className="text-destructive text-xs">{o.saveError}</p>}
            {userTurn && (
              <Button variant="outline" className="w-fit" onClick={playNext}>
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
