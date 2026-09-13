import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/lib/language-context'
import {
  isWhiteMove,
  moveNumberFor,
  ROOT_NODE_ID,
  type MoveTreeNode,
} from '@/lib/move-tree'

interface MoveLineProps {
  nodes: Record<string, MoveTreeNode>
  currentId: string
  startTurn: 'w' | 'b'
  onSelect: (id: string) => void
  startId: string
  ply: number
  depth: number
  // Il primo nodo di una MoveLine "variante" e' gia' stato presentato come
  // diramazione dal chiamante (che ha iterato su TUTTI i children del
  // genitore): rilevare di nuovo i suoi stessi fratelli qui creerebbe una
  // ricorsione reciproca infinita (A rende B come variante, B rende A come
  // variante, ...). Si salta quindi il controllo SOLO al primo nodo di una
  // chiamata ricorsiva; dal secondo nodo in poi (diramazioni piu' profonde
  // nella stessa linea) il controllo torna attivo normalmente.
  skipSiblingsAtStart?: boolean
}

function MoveLine({
  nodes,
  currentId,
  startTurn,
  onSelect,
  startId,
  ply,
  depth,
  skipSiblingsAtStart,
}: MoveLineProps) {
  const tokens: ReactNode[] = []
  const variationBlocks: ReactNode[] = []
  let nodeId: string | undefined = startId
  let currentPly = ply
  let isFirstToken = true

  while (nodeId) {
    const node: MoveTreeNode = nodes[nodeId]
    const white = isWhiteMove(currentPly, startTurn)
    const number = moveNumberFor(currentPly, startTurn)
    const prefix = white ? `${number}.` : isFirstToken ? `${number}…` : ''
    const isCurrent = node.id === currentId

    tokens.push(
      <button
        key={node.id}
        type="button"
        onClick={() => onSelect(node.id)}
        className={`shrink-0 rounded px-1 py-0.5 font-mono text-xs ${
          isCurrent
            ? 'bg-primary text-primary-foreground font-semibold'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        {prefix}
        {node.san}
      </button>,
    )

    const parent = node.parentId ? nodes[node.parentId] : undefined
    if (parent && !(isFirstToken && skipSiblingsAtStart)) {
      for (const siblingId of parent.children) {
        if (siblingId === node.id) continue
        variationBlocks.push(
          <div
            key={siblingId}
            className="flex flex-wrap items-center gap-0.5"
            style={{ marginLeft: (depth + 1) * 12 }}
          >
            <MoveLine
              nodes={nodes}
              currentId={currentId}
              startTurn={startTurn}
              onSelect={onSelect}
              startId={siblingId}
              ply={currentPly}
              depth={depth + 1}
              skipSiblingsAtStart
            />
          </div>,
        )
      }
    }

    isFirstToken = false
    nodeId = node.children[0]
    currentPly += 1
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5">{tokens}</div>
      {variationBlocks}
    </>
  )
}

interface MoveHistoryPanelProps {
  nodes: Record<string, MoveTreeNode>
  currentId: string
  startTurn: 'w' | 'b'
  onSelect: (id: string) => void
}

export function MoveHistoryPanel({
  nodes,
  currentId,
  startTurn,
  onSelect,
}: MoveHistoryPanelProps) {
  const t = useTranslations()
  const current = nodes[currentId]
  const rootChildren = nodes[ROOT_NODE_ID]?.children ?? []
  const canGoBack = currentId !== ROOT_NODE_ID
  const canGoForward = current.children.length > 0

  function goToLast() {
    let node = current
    while (node.children.length > 0) {
      node = nodes[node.children[0]]
    }
    if (node.id !== currentId) onSelect(node.id)
  }

  return (
    <Card className="w-full lg:w-72">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">{t.moveHistory.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
          {rootChildren.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t.moveHistory.empty}</p>
          ) : (
            <MoveLine
              nodes={nodes}
              currentId={currentId}
              startTurn={startTurn}
              onSelect={onSelect}
              startId={rootChildren[0]}
              ply={1}
              depth={0}
            />
          )}
        </div>
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canGoBack}
            onClick={() => onSelect(ROOT_NODE_ID)}
            aria-label={t.moveHistory.goToStart}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canGoBack}
            onClick={() => current.parentId && onSelect(current.parentId)}
            aria-label={t.moveHistory.prevMove}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canGoForward}
            onClick={() => onSelect(current.children[0])}
            aria-label={t.moveHistory.nextMove}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canGoForward}
            onClick={goToLast}
            aria-label={t.moveHistory.goToEnd}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
