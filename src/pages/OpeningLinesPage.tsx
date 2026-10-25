import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OpeningBoard } from '@/components/opening-board'
import {
  MOVE_STATE_CLASSES,
  MoveStateLegend,
  OpeningTreeView,
} from '@/components/opening-tree-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOpeningProgress, useRepertoires } from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import {
  buildOpeningTree,
  isUserMove,
  moveLabel,
  moveState,
  runMastery,
  runPath,
  type OpeningNode,
  type OpeningProgress,
  type OpeningTree,
} from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'

// Consultazione di un repertorio: l'albero delle varianti con la padronanza
// di ogni mossa (heatmap), la posizione della mossa selezionata e le linee,
// ognuna da allenare da sola.
export default function OpeningLinesPage() {
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
  if (!repertoire || !tree) {
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
  return <OpeningLines repertoire={repertoire} tree={tree} progress={progress} />
}

function OpeningLines({
  repertoire,
  tree,
  progress,
}: {
  repertoire: RepertoireWithNodes
  tree: OpeningTree
  progress: Map<number, OpeningProgress>
}) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: stats } = useUserStats()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const now = new Date()
  const color = repertoire.color
  const selected = selectedId === null ? undefined : tree.byId.get(selectedId)

  const fen = useMemo(() => {
    const chess = new Chess()
    if (selectedId !== null) {
      for (const node of runPath(tree, selectedId)) chess.move(node.san)
    }
    return chess.fen()
  }, [tree, selectedId])

  const firstChild = (tree.children.get(selectedId) ?? [])[0]

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-3 lg:sticky lg:top-14 lg:w-[min(30rem,calc(100vh-12rem))] lg:shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-foreground text-base font-semibold tracking-tight">
            {o.names[repertoire.slug] ?? repertoire.name}
          </h1>
          <p className="text-muted-foreground text-xs">
            {o.color[color]} · {o.runs(tree.leaves.length)}
          </p>
          <div className="flex gap-3 text-xs">
            <Link
              to="/openings"
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.back}
            </Link>
            <Link
              to={`/openings/${repertoire.slug}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.train}
            </Link>
          </div>
        </div>

        <OpeningBoard
          fen={fen}
          orientation={color === 'w' ? 'white' : 'black'}
          interactive={false}
          onMove={() => false}
          lastMoveUci={selected?.uci}
          boardTheme={stats?.board_theme}
          pieceSet={stats?.piece_set}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={t.puzzleBoard.prevMove}
            disabled={!selected}
            onClick={() => setSelectedId(selected?.parent_id ?? null)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={t.puzzleBoard.nextMove}
            disabled={!firstChild}
            onClick={() => firstChild && setSelectedId(firstChild.id)}
          >
            <ChevronRight />
          </Button>
          <SelectedMove node={selected} color={color} progress={progress} now={now} />
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-6">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>{o.treeTitle}</CardTitle>
            <MoveStateLegend />
          </CardHeader>
          <CardContent>
            <OpeningTreeView
              tree={tree}
              color={color}
              progress={progress}
              now={now}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{o.linesTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col divide-y">
              {tree.leaves.map((leaf) => (
                <LineRow
                  key={leaf.id}
                  slug={repertoire.slug}
                  tree={tree}
                  leaf={leaf}
                  color={color}
                  progress={progress}
                  now={now}
                  selected={leaf.id === selectedId}
                  onSelect={() => setSelectedId(leaf.id)}
                />
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

/** La mossa selezionata e, se e' dell'utente, i suoi dati di allenamento. */
function SelectedMove({
  node,
  color,
  progress,
  now,
}: {
  node: OpeningNode | undefined
  color: 'w' | 'b'
  progress: Map<number, OpeningProgress>
  now: Date
}) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  if (!node) {
    return <p className="text-muted-foreground text-xs">{o.startPosition}</p>
  }
  const label = moveLabel(node, true)
  if (!isUserMove(node, color)) {
    return (
      <p className="text-muted-foreground text-xs">
        <span className="text-foreground font-mono font-medium">{label}</span> ·{' '}
        {o.opponentMove}
      </p>
    )
  }
  const row = progress.get(node.id)
  const state = moveState(row, now)
  return (
    <div className="flex min-w-0 flex-col text-xs">
      <p className="flex items-center gap-1.5">
        <span className="text-foreground font-mono font-medium">{label}</span>
        <span className={`rounded px-1.5 py-0.5 ${MOVE_STATE_CLASSES[state]}`}>
          {o.legend[state]}
        </span>
      </p>
      <p className="text-muted-foreground">
        {row
          ? o.moveStats(
              row.attempts,
              Math.round((row.first_try_correct / row.attempts) * 100),
            )
          : o.neverPlayed}
      </p>
      {row?.due_at && (
        <p className="text-muted-foreground">
          {state === 'due'
            ? o.dueNow
            : o.nextReview(new Date(row.due_at).toLocaleDateString(t.meta.locale))}
        </p>
      )}
    </div>
  )
}

function LineRow({
  slug,
  tree,
  leaf,
  color,
  progress,
  now,
  selected,
  onSelect,
}: {
  slug: string
  tree: OpeningTree
  leaf: OpeningNode
  color: 'w' | 'b'
  progress: Map<number, OpeningProgress>
  now: Date
  selected: boolean
  onSelect: () => void
}) {
  const o = useOpeningsTranslations()
  const path = runPath(tree, leaf.id)
  const mastery = runMastery(tree, leaf.id, progress, color, now)
  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <button
        type="button"
        aria-current={selected ? 'true' : undefined}
        onClick={onSelect}
        className={`min-w-0 flex-1 rounded-md px-1 text-left font-mono text-xs leading-relaxed ${
          selected ? 'bg-primary/10' : 'hover:bg-muted'
        }`}
      >
        {path.map((node, index) => moveLabel(node, index === 0)).join(' ')}
      </button>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex w-28 flex-col gap-1">
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(mastery.mastered / mastery.total) * 100}%` }}
            />
          </div>
          <span className="text-muted-foreground text-[0.65rem] tabular-nums">
            {o.mastered(mastery.mastered, mastery.total)}
          </span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/openings/${slug}?line=${leaf.id}`}>{o.trainLine}</Link>
        </Button>
      </div>
    </li>
  )
}
