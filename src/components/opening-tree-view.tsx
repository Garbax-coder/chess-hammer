import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { MOVE_STATE_CLASSES } from '@/lib/opening-move-style'
import type { OpeningColor } from '@/lib/opening-catalog'
import {
  chainFrom,
  isUserMove,
  moveLabel,
  moveState,
  nameChange,
  type MoveState,
  type OpeningName,
  type OpeningNode,
  type OpeningProgress,
  type OpeningTree,
} from '@/lib/opening-tree'

const STATES: MoveState[] = ['new', 'learning', 'due', 'mastered']

/**
 * L'albero delle varianti di un repertorio: una catena di mosse senza
 * alternative sta su una riga, e ogni diramazione apre rami annidati, che si
 * possono comprimere uno per uno o tutti insieme. Un clic su una mossa la
 * seleziona.
 */
export function OpeningTreeView({
  tree,
  color,
  progress,
  now,
  selectedId,
  onSelect,
  names = new Map(),
  comments = new Map(),
  onMoveContextMenu,
}: {
  tree: OpeningTree
  color: OpeningColor
  progress: Map<number, OpeningProgress>
  now: Date
  selectedId: number | null
  onSelect: (nodeId: number) => void
  /** Nomi delle aperture per mossa: scritti dove il nome cambia. */
  names?: Map<number, OpeningName>
  /** Commenti da mostrare, per mossa (gia' risolti: vedi commentOf). */
  comments?: Map<number, string>
  /** Tasto destro (o tocco lungo) su una mossa: per commentarla. */
  onMoveContextMenu?: (node: OpeningNode) => void
}) {
  const o = useOpeningsTranslations()
  const [collapsed, setCollapsed] = useState<ReadonlySet<number>>(new Set())
  const roots = tree.children.get(null) ?? []

  function toggle(nodeId: number) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }

  // Le mosse dove l'albero si dirama: quelle che si comprimono.
  const branchPoints = [...tree.children]
    .filter(([parentId, children]) => parentId !== null && children.length > 1)
    .map(([parentId]) => parentId as number)

  // Comprimendo tutto resta aperto il percorso fino alla mossa selezionata.
  function collapseAll() {
    const open = new Set<number>()
    for (let id = selectedId; id !== null; id = tree.byId.get(id)?.parent_id ?? null) {
      open.add(id)
    }
    setCollapsed(new Set(branchPoints.filter((id) => !open.has(id))))
  }

  const props = {
    tree,
    color,
    progress,
    now,
    selectedId,
    onSelect,
    names,
    comments,
    onMoveContextMenu,
    collapsed,
    toggle,
  }
  const view =
    roots.length === 1 ? (
      <Line start={roots[0]} {...props} />
    ) : (
      <Branches nodes={roots} {...props} />
    )
  if (branchPoints.length === 0) return view
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 text-xs">
        <button
          type="button"
          onClick={() => setCollapsed(new Set())}
          disabled={collapsed.size === 0}
          className="text-primary disabled:text-muted-foreground underline-offset-4 hover:underline disabled:no-underline"
        >
          {o.expandAll}
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="text-primary underline-offset-4 hover:underline"
        >
          {o.collapseAll}
        </button>
      </div>
      {view}
    </div>
  )
}

interface LineProps {
  tree: OpeningTree
  color: OpeningColor
  progress: Map<number, OpeningProgress>
  now: Date
  selectedId: number | null
  onSelect: (nodeId: number) => void
  names: Map<number, OpeningName>
  comments: Map<number, string>
  onMoveContextMenu?: (node: OpeningNode) => void
  collapsed: ReadonlySet<number>
  toggle: (nodeId: number) => void
}

function Line({ start, ...props }: LineProps & { start: OpeningNode }) {
  const o = useOpeningsTranslations()
  const chain = chainFrom(props.tree, start)
  const last = chain[chain.length - 1]
  const branches = props.tree.children.get(last.id) ?? []
  const isCollapsed = props.collapsed.has(last.id)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1">
        {branches.length > 1 && (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? o.expand : o.collapse}
            onClick={() => props.toggle(last.id)}
            className="text-muted-foreground hover:text-foreground -ml-1 rounded p-0.5"
          >
            {isCollapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        )}
        {chain.map((node, index) => {
          const name = nameChange(props.tree, node, props.names)
          const comment = props.comments.get(node.id)
          return (
            <Fragment key={node.id}>
              <Move node={node} startsRow={index === 0} {...props} />
              {name && (
                <span className="text-muted-foreground px-1 text-[0.7rem] italic">
                  {name}
                </span>
              )}
              {comment && (
                <span className="flex items-baseline gap-1 px-1 text-[0.7rem] text-sky-700 dark:text-sky-300">
                  <MessageSquare className="size-3 shrink-0 self-center" aria-hidden />
                  {comment}
                </span>
              )}
            </Fragment>
          )
        })}
      </div>
      {branches.length > 1 && !isCollapsed && <Branches nodes={branches} {...props} />}
    </div>
  )
}

function Branches({ nodes, ...props }: LineProps & { nodes: OpeningNode[] }) {
  return (
    <ul className="border-border/70 ml-1.5 flex flex-col gap-1.5 border-l pl-2.5">
      {nodes.map((node) => (
        <li key={node.id}>
          <Line start={node} {...props} />
        </li>
      ))}
    </ul>
  )
}

function Move({
  node,
  startsRow,
  color,
  progress,
  now,
  selectedId,
  onSelect,
  onMoveContextMenu,
}: LineProps & { node: OpeningNode; startsRow: boolean }) {
  const o = useOpeningsTranslations()
  const alternative = !node.is_main
  const userMove = isUserMove(node, color)
  const state = userMove && !alternative ? moveState(progress.get(node.id), now) : null
  const selected = node.id === selectedId
  return (
    <button
      type="button"
      aria-current={selected ? 'true' : undefined}
      title={alternative ? o.alternativeLabel : state ? o.legend[state] : o.opponentMove}
      onClick={() => onSelect(node.id)}
      onContextMenu={(event) => {
        if (!onMoveContextMenu) return
        event.preventDefault()
        onMoveContextMenu(node)
      }}
      className={`rounded px-1 py-0.5 font-mono text-xs tabular-nums transition-colors ${
        alternative
          ? 'border-muted-foreground/60 text-muted-foreground border border-dashed'
          : state
            ? MOVE_STATE_CLASSES[state]
            : 'text-foreground hover:bg-muted'
      } ${selected ? 'ring-primary ring-2' : ''}`}
    >
      {moveLabel(node, startsRow)}
    </button>
  )
}

/** Legenda dei colori della padronanza. */
export function MoveStateLegend() {
  const o = useOpeningsTranslations()
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{o.legendTitle}:</span>
      {STATES.map((state) => (
        <span
          key={state}
          className={`rounded px-1.5 py-0.5 ${MOVE_STATE_CLASSES[state]}`}
        >
          {o.legend[state]}
        </span>
      ))}
    </div>
  )
}
