import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useMemo } from 'react'
import { OpeningTreeView } from '@/components/opening-tree-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/lib/language-context'
import { moveTreeAsOpeningTree, ROOT_NODE_ID, type MoveTreeNode } from '@/lib/move-tree'

const NO_PROGRESS = new Map()

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
  const view = useMemo(() => moveTreeAsOpeningTree(nodes, startTurn), [nodes, startTurn])
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
    <Card size="sm" className="w-full lg:w-72">
      <CardHeader>
        <CardTitle>{t.moveHistory.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="max-h-48 overflow-y-auto p-0.5">
          {rootChildren.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t.moveHistory.empty}</p>
          ) : (
            <OpeningTreeView
              plain
              tree={view.tree}
              color="w"
              progress={NO_PROGRESS}
              now={new Date()}
              selectedId={view.toOpeningId(currentId)}
              onSelect={(id) => onSelect(view.fromOpeningId(id))}
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
