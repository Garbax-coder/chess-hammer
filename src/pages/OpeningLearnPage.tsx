import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import {
  useLearnOpeningMove,
  useOpeningArrows,
  useOpeningNames,
  useOpeningNotes,
} from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import {
  chooseLearnRun,
  commentOf,
  isUserMove,
  mistakeLine,
  mistakesAt,
  moveLabel,
  nameAt,
  runPath,
  type OpeningNode,
} from '@/lib/opening-tree'

// Modalita' Learn: si studia una linea seguendo la freccia. L'avversario
// risponde da solo; ogni mossa dell'utente si gioca guidati (o la gioca
// l'app) e diventa "in apprendimento", da ripassare poi nell'allenamento.
// Nessun tentativo a memoria, quindi nessun errore registrato. Le linee
// sbagliate che partono dalla posizione raggiunta compaiono come "Da
// evitare" e si possono seguire sulla scacchiera.
export default function OpeningLearnPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <RepertoireGate slug={slug}>
      {(data) => <OpeningLearn key={data.repertoire.id} {...data} />}
    </RepertoireGate>
  )
}

function OpeningLearn({ repertoire, tree, progress }: RepertoireData) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: stats } = useUserStats()
  const { data: arrows } = useOpeningArrows()
  const { data: names } = useOpeningNames()
  const { data: notes } = useOpeningNotes()
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
  const lastPlayed = path[index - 1]
  const lastComment = lastPlayed ? commentOf(lastPlayed, notes ?? new Map()) : undefined
  const position = tree.leaves.findIndex((leaf) => leaf.id === leafId)
  const toLearn = tree.leaves.filter((leaf) =>
    runPath(tree, leaf.id).some(
      (n) =>
        n.is_main &&
        !tree.mistakes.has(n.id) &&
        isUserMove(n, color) &&
        !progress.has(n.id),
    ),
  ).length
  const nextToLearn = done ? chooseLearnRun(tree, progress, color, leafId) : undefined
  const nextInOrder = tree.leaves[(position + 1) % tree.leaves.length].id

  // Gli errori da evitare nella posizione raggiunta: le mosse sbagliate
  // dell'utente qui, e quelle che l'avversario poteva giocare al posto della
  // sua ultima risposta. Solo mentre la linea aspetta (il turno dell'utente o
  // la fine), non mentre l'avversario muove.
  const mistakes =
    userTurn || done
      ? [
          ...mistakesAt(tree, lastPlayed?.id ?? null),
          ...(lastPlayed && !isUserMove(lastPlayed, color)
            ? mistakesAt(tree, lastPlayed.parent_id)
            : []),
        ]
      : []
  // Una linea sbagliata seguita sulla scacchiera: vale solo nella posizione
  // in cui la si e' aperta.
  const runKey = `${leafId}:${nonce}:${index}`
  const [preview, setPreview] = useState<{
    key: string
    line: OpeningNode[]
    first: number
    shown: number
  } | null>(null)
  const shownPreview = preview?.key === runKey ? preview : null
  const previewFen = useMemo(() => {
    if (!shownPreview) return null
    const chess = new Chess()
    for (const node of shownPreview.line.slice(0, shownPreview.shown))
      chess.move(node.san)
    return chess.fen()
  }, [shownPreview])
  const previewNode = shownPreview ? shownPreview.line[shownPreview.shown - 1] : undefined
  const boardNode = previewNode ?? lastPlayed

  function openPreview(mistake: OpeningNode) {
    const line = mistakeLine(tree, mistake)
    // Si parte dalla mossa sbagliata giocata.
    setPreview({ key: runKey, line, first: mistake.ply, shown: mistake.ply })
  }

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
          fen={previewFen ?? run.fen}
          orientation={color === 'w' ? 'white' : 'black'}
          interactive={userTurn && !shownPreview}
          onMove={run.handleMove}
          hintUci={userTurn && !shownPreview ? next.uci : undefined}
          lastMoveUci={previewNode?.uci ?? run.lastMoveUci}
          savedArrows={boardNode ? arrows?.get(boardNode.id) : undefined}
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
          {/* Il commento della mossa appena giocata (dal PGN o personale). */}
          {lastComment && (
            <p className="border-l-2 border-sky-500/60 pl-2 text-sm text-sky-800 dark:text-sky-200">
              {lastComment}
            </p>
          )}
          {shownPreview && previewNode ? (
            <Card size="sm" className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-destructive text-sm">
                  {o.mistakeLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="font-mono text-xs">
                  {shownPreview.line
                    .slice(shownPreview.first - 1, shownPreview.shown)
                    .map((n, i) => `${moveLabel(n, i === 0)}${n.is_mistake ? '?' : ''}`)
                    .join(' ')}
                </p>
                {commentOf(previewNode, notes ?? new Map()) && (
                  <p className="border-l-2 border-sky-500/60 pl-2 text-sm text-sky-800 dark:text-sky-200">
                    {commentOf(previewNode, notes ?? new Map())}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t.puzzleBoard.prevMove}
                    disabled={shownPreview.shown <= shownPreview.first}
                    onClick={() =>
                      setPreview({ ...shownPreview, shown: shownPreview.shown - 1 })
                    }
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t.puzzleBoard.nextMove}
                    disabled={shownPreview.shown >= shownPreview.line.length}
                    onClick={() =>
                      setPreview({ ...shownPreview, shown: shownPreview.shown + 1 })
                    }
                  >
                    <ChevronRight />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPreview(null)}>
                    {o.backToLine}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            mistakes.length > 0 && (
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">{o.mistakesTitle}</CardTitle>
                  <p className="text-muted-foreground text-xs">{o.mistakesIntro}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {mistakes.map((mistake) => {
                    const comment = commentOf(mistake, notes ?? new Map())
                    return (
                      <div key={mistake.id} className="flex flex-col gap-1">
                        <span className="text-destructive font-mono text-xs">
                          {moveLabel(mistake, true)}?
                        </span>
                        {comment && (
                          <p className="text-muted-foreground text-xs">{comment}</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-fit"
                          onClick={() => openPreview(mistake)}
                        >
                          {o.showMistake}
                        </Button>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          )}
          {learn.isError && <p className="text-destructive text-xs">{o.saveError}</p>}
          {userTurn && !shownPreview && (
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
