import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OpeningBoard } from '@/components/opening-board'
import { RepertoireGate } from '@/components/repertoire-gate'
import {
  MOVE_STATE_CLASSES,
  MoveStateLegend,
  OpeningTreeView,
} from '@/components/opening-tree-view'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useLocalToggle } from '@/hooks/use-local-toggle'
import { useOpeningNames } from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import {
  isUserMove,
  moveLabel,
  moveState,
  nameAt,
  runMastery,
  runPath,
  type OpeningName,
  type OpeningNode,
  type OpeningProgress,
  type OpeningTree,
} from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'

const NO_NAMES = new Map<number, OpeningName>()

// Consultazione di un repertorio: l'albero delle varianti con la padronanza
// di ogni mossa (heatmap), la posizione della mossa selezionata e le linee,
// ognuna da allenare da sola.
export default function OpeningLinesPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <RepertoireGate slug={slug}>{(data) => <OpeningLines {...data} />}</RepertoireGate>
  )
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
  // I nomi arrivano a parte: finche' non ci sono la pagina funziona senza.
  const { data: names = NO_NAMES } = useOpeningNames()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  // Nomi delle varianti, da mostrare o no in ciascuna delle due card.
  const [treeNames, setTreeNames] = useLocalToggle('openings-tree-names', true)
  const [lineNames, setLineNames] = useLocalToggle('openings-line-names', true)
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
              to={`/openings/${repertoire.slug}/learn`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.learn}
            </Link>
            <Link
              to={`/openings/${repertoire.slug}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.train}
            </Link>
            <Link
              to={`/openings/${repertoire.slug}/cycles`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {o.cycles}
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
          <SelectedMove
            node={selected}
            tree={tree}
            names={names}
            color={color}
            progress={progress}
            now={now}
          />
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-6">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>{o.treeTitle}</CardTitle>
            <CardAction>
              <NamesSwitch id="tree-names" checked={treeNames} onChange={setTreeNames} />
            </CardAction>
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
              names={treeNames ? names : NO_NAMES}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{o.linesTitle}</CardTitle>
            <CardAction>
              <NamesSwitch id="line-names" checked={lineNames} onChange={setLineNames} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col divide-y">
              {tree.leaves.map((leaf) => (
                <LineRow
                  key={leaf.id}
                  slug={repertoire.slug}
                  tree={tree}
                  names={lineNames ? names : NO_NAMES}
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

function NamesSwitch({
  id,
  checked,
  onChange,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const o = useOpeningsTranslations()
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
        {o.showNames}
      </Label>
    </div>
  )
}

/**
 * La mossa selezionata: il nome dell'apertura a quel punto e, se la mossa e'
 * dell'utente, i suoi dati di allenamento.
 */
function SelectedMove({
  node,
  tree,
  names,
  color,
  progress,
  now,
}: {
  node: OpeningNode | undefined
  tree: OpeningTree
  names: Map<number, OpeningName>
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
  const name = nameAt(tree, node.id, names)
  const row = progress.get(node.id)
  const state = node.is_main && isUserMove(node, color) ? moveState(row, now) : null
  return (
    <div className="flex min-w-0 flex-col text-xs">
      {name && (
        <p className="text-foreground truncate font-medium" title={name.name}>
          {name.eco} · {name.name}
        </p>
      )}
      <p className="text-muted-foreground flex items-center gap-1.5">
        <span className="text-foreground font-mono font-medium">{label}</span>
        {state ? (
          <span className={`rounded px-1.5 py-0.5 ${MOVE_STATE_CLASSES[state]}`}>
            {o.legend[state]}
          </span>
        ) : (
          <span>· {node.is_main ? o.opponentMove : o.alternativeLabel}</span>
        )}
      </p>
      {state && (
        <p className="text-muted-foreground">
          {row
            ? o.moveStats(
                row.attempts,
                Math.round((row.first_try_correct / row.attempts) * 100),
              )
            : o.neverPlayed}
        </p>
      )}
      {state && row?.due_at && (
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
  names,
  leaf,
  color,
  progress,
  now,
  selected,
  onSelect,
}: {
  slug: string
  tree: OpeningTree
  names: Map<number, OpeningName>
  leaf: OpeningNode
  color: 'w' | 'b'
  progress: Map<number, OpeningProgress>
  now: Date
  selected: boolean
  onSelect: () => void
}) {
  const o = useOpeningsTranslations()
  const path = runPath(tree, leaf.id)
  const name = nameAt(tree, leaf.id, names)
  const mastery = runMastery(tree, leaf.id, progress, color, now)
  return (
    <li className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
      {name && (
        <p className="text-foreground text-sm font-medium">
          <span className="text-muted-foreground font-mono text-xs">{name.eco}</span>{' '}
          {name.name}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
          {/* Una linea con mosse mai viste si studia; poi si allena. */}
          {mastery.new > 0 ? (
            <Button asChild size="sm">
              <Link to={`/openings/${slug}/learn?line=${leaf.id}`}>{o.learnLine}</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to={`/openings/${slug}?line=${leaf.id}`}>{o.trainLine}</Link>
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}
