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
import { useOpeningRun } from '@/hooks/use-opening-run'
import { useLearnOpeningMove, useOpeningNames } from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import {
  chooseLearnRun,
  isUserMove,
  moveLabel,
  nameAt,
  runPath,
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

  // La linea scelta (?line=<foglia>), oppure la prima con mosse nuove; se
  // sono gia' state studiate tutte, la prima: lo studio resta sempre
  // disponibile, come ripasso.
  const [searchParams] = useSearchParams()
  const [leafId, setLeafId] = useState<number>(() => {
    const requested = Number(searchParams.get('line'))
    return tree.leaves.some((leaf) => leaf.id === requested)
      ? requested
      : (chooseLearnRun(tree, progress, color) ?? tree.leaves[0].id)
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

  function startLine(id: number) {
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
  // A fine linea: la prossima con mosse nuove, altrimenti la successiva
  // nell'ordine dell'albero (si ripassano tutte, una dopo l'altra).
  const position = tree.leaves.findIndex((leaf) => leaf.id === leafId)
  const toLearn = tree.leaves.filter((leaf) =>
    runPath(tree, leaf.id).some(
      (n) => n.is_main && isUserMove(n, color) && !progress.has(n.id),
    ),
  ).length
  const nextToLearn = done ? chooseLearnRun(tree, progress, color, leafId) : undefined
  const nextInOrder = tree.leaves[(position + 1) % tree.leaves.length].id

  return (
    <OpeningPageLayout
      left={
        <>
          <OpeningPageHeader
            repertoire={repertoire}
            mode="learn"
            title={o.learn}
            subtitle={o.color[color]}
          />
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
        </>
      }
      board={
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
      }
      right={
        <>
          <span className="text-muted-foreground text-xs tabular-nums">
            {o.lineOf(position + 1, tree.leaves.length)} · {o.toLearn(toLearn)}
          </span>
          {toLearn === 0 && (
            <p className="text-muted-foreground text-xs">{o.allLearnedReview}</p>
          )}
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
              {nextToLearn !== undefined ? (
                <Button onClick={() => startLine(nextToLearn)}>{o.learnNext}</Button>
              ) : (
                <Button onClick={() => startLine(nextInOrder)}>{o.nextRun}</Button>
              )}
              <Button asChild variant="outline">
                <Link to={`${base}?line=${leafId}`}>{o.trainLine}</Link>
              </Button>
              <Button variant="outline" onClick={() => startLine(leafId)}>
                {o.repeatLearn}
              </Button>
            </div>
          )}
        </>
      }
    />
  )
}
