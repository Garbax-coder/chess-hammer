import { ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
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

// Colori della padronanza sulle mosse dell'utente (heatmap); le mosse
// dell'avversario restano neutre.
export const MOVE_STATE_CLASSES: Record<MoveState, string> = {
  new: 'bg-muted text-muted-foreground',
  learning: 'bg-amber-500/20 text-amber-800 dark:text-amber-200',
  due: 'bg-red-500/20 text-red-800 dark:text-red-200',
  mastered: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200',
}

const STATES: MoveState[] = ['new', 'learning', 'due', 'mastered']

/**
 * L'albero delle varianti di un repertorio: una catena di mosse senza
 * alternative sta su una riga, e ogni diramazione apre rami annidati, che si
 * possono comprimere. Un clic su una mossa la seleziona.
 */
export function OpeningTreeView({
  tree,
  color,
  progress,
  now,
  selectedId,
  onSelect,
  names = new Map(),
}: {
  tree: OpeningTree
  color: OpeningColor
  progress: Map<number, OpeningProgress>
  now: Date
  selectedId: number | null
  onSelect: (nodeId: number) => void
  /** Nomi delle aperture per mossa: scritti dove il nome cambia. */
  names?: Map<number, OpeningName>
}) {
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

  const props = {
    tree,
    color,
    progress,
    now,
    selectedId,
    onSelect,
    names,
    collapsed,
    toggle,
  }
  return roots.length === 1 ? (
    <Line start={roots[0]} {...props} />
  ) : (
    <Branches nodes={roots} {...props} />
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
          return (
            <Fragment key={node.id}>
              <Move node={node} startsRow={index === 0} {...props} />
              {name && (
                <span className="text-muted-foreground px-1 text-[0.7rem] italic">
                  {name}
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
