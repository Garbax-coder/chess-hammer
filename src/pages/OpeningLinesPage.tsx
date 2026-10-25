import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OpeningBoard } from '@/components/opening-board'
import { OpeningCommentDialog } from '@/components/opening-comment-dialog'
import { OpeningPageHeader } from '@/components/opening-page-header'
import { OpeningPageLayout } from '@/components/opening-page-layout'
import { RepertoireGate } from '@/components/repertoire-gate'
import { MoveStateLegend, OpeningTreeView } from '@/components/opening-tree-view'
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
import {
  useOpeningNames,
  useOpeningNotes,
  useSaveOpeningNote,
} from '@/hooks/use-openings'
import { useUserStats } from '@/hooks/use-user-stats'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { MOVE_STATE_CLASSES } from '@/lib/opening-move-style'
import { useTranslations } from '@/lib/language-context'
import {
  commentOf,
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
const NO_COMMENTS = new Map<number, string>()

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
  // Nomi delle varianti, da mostrare o no in ciascuna delle due card, e
  // commenti nell'albero.
  const [treeNames, setTreeNames] = useLocalToggle('openings-tree-names', true)
  const [lineNames, setLineNames] = useLocalToggle('openings-line-names', true)
  const [treeComments, setTreeComments] = useLocalToggle('openings-tree-comments', true)
  // Commenti: quelli personali hanno la precedenza su quelli del PGN.
  const { data: notes = NO_COMMENTS } = useOpeningNotes()
  const saveNote = useSaveOpeningNote()
  const [commentNode, setCommentNode] = useState<OpeningNode | null>(null)
  const comments = useMemo(() => {
    const map = new Map<number, string>()
    for (const node of tree.byId.values()) {
      const text = commentOf(node, notes)
      if (text) map.set(node.id, text)
    }
    return map
  }, [tree, notes])

  function saveComment(text: string) {
    if (!commentNode) return
    // Vuoto: si toglie la nota; se la mossa ha un commento del PGN, una nota
    // vuota lo nasconde.
    const note = text === '' ? (commentNode.comment ? '' : null) : text
    saveNote.mutate(
      { nodeId: commentNode.id, note },
      { onSuccess: () => setCommentNode(null) },
    )
  }
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
    <>
      <OpeningCommentDialog
        moveLabel={commentNode ? moveLabel(commentNode, true) : null}
        initial={commentNode ? (comments.get(commentNode.id) ?? '') : ''}
        saving={saveNote.isPending}
        onSave={saveComment}
        onDelete={() => saveComment('')}
        onClose={() => setCommentNode(null)}
      />
      <OpeningPageLayout
        variant="browse"
        left={
          <>
            <OpeningPageHeader
              repertoire={repertoire}
              mode="lines"
              subtitle={`${o.color[color]} · ${o.runs(tree.leaves.length)}`}
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
            </div>
            <SelectedMove
              node={selected}
              comment={selected ? comments.get(selected.id) : undefined}
              tree={tree}
              names={names}
              color={color}
              progress={progress}
              now={now}
            />
          </>
        }
        board={
          <OpeningBoard
            fen={fen}
            orientation={color === 'w' ? 'white' : 'black'}
            interactive={false}
            onMove={() => false}
            lastMoveUci={selected?.uci}
            boardTheme={stats?.board_theme}
            pieceSet={stats?.piece_set}
          />
        }
        right={
          <>
            <Card>
              <CardHeader className="gap-2">
                <CardTitle>{o.treeTitle}</CardTitle>
                <CardAction className="flex flex-col items-end gap-1.5">
                  <LabeledSwitch
                    id="tree-names"
                    label={o.showNames}
                    checked={treeNames}
                    onChange={setTreeNames}
                  />
                  <LabeledSwitch
                    id="tree-comments"
                    label={o.showComments}
                    checked={treeComments}
                    onChange={setTreeComments}
                  />
                </CardAction>
                <MoveStateLegend />
                <p className="text-muted-foreground text-xs">{o.commentHint}</p>
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
                  comments={treeComments ? comments : NO_COMMENTS}
                  onMoveContextMenu={setCommentNode}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{o.linesTitle}</CardTitle>
                <CardAction>
                  <LabeledSwitch
                    id="line-names"
                    label={o.showNames}
                    checked={lineNames}
                    onChange={setLineNames}
                  />
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
          </>
        }
      />
    </>
  )
}

function LabeledSwitch({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
        {label}
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
  comment,
  tree,
  names,
  color,
  progress,
  now,
}: {
  node: OpeningNode | undefined
  comment: string | undefined
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
      {comment && <p className="mt-1 text-sky-700 dark:text-sky-300">{comment}</p>}
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
      <div className="flex flex-col gap-2">
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
        <div className="flex items-center justify-between gap-3">
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
          {/* Studio e allenamento sempre; in evidenza lo studio finche' la
              linea ha mosse mai viste, poi l'allenamento. */}
          <div className="flex flex-wrap justify-end gap-1.5">
            <Button asChild size="sm" variant={mastery.new > 0 ? 'default' : 'outline'}>
              <Link to={`/openings/${slug}/learn?line=${leaf.id}`}>{o.learnLine}</Link>
            </Button>
            <Button asChild size="sm" variant={mastery.new > 0 ? 'outline' : 'default'}>
              <Link to={`/openings/${slug}?line=${leaf.id}`}>{o.trainLine}</Link>
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}
