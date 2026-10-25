import { MessageSquare, TriangleAlert, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { moveLabel, type OpeningNode } from '@/lib/opening-tree'

export interface MoveMenuTarget {
  node: OpeningNode
  /** Il punto del clic (coordinate della finestra), dove si apre il menu. */
  x: number
  y: number
}

/**
 * Il menu di una mossa dell'albero (tasto destro o tocco lungo): commento,
 * eliminazione con il seguito (con conferma) e segno di errore. Le voci che
 * modificano valgono solo nei repertori personali.
 */
export function OpeningMoveMenu({
  target,
  editable,
  canToggleMistake,
  deleting,
  onComment,
  onDelete,
  onToggleMistake,
  onClose,
}: {
  target: MoveMenuTarget | null
  editable: boolean
  /** Solo la prima mossa di una linea sbagliata, o una mossa fuori da una. */
  canToggleMistake: boolean
  deleting: boolean
  onComment: (node: OpeningNode) => void
  onDelete: (node: OpeningNode) => void
  onToggleMistake: (node: OpeningNode) => void
  onClose: () => void
}) {
  const o = useOpeningsTranslations()
  return (
    <Popover open={target !== null} onOpenChange={(open) => !open && onClose()}>
      {target && (
        <>
          <PopoverAnchor asChild>
            <span
              aria-hidden
              className="pointer-events-none fixed size-0"
              style={{ left: target.x, top: target.y }}
            />
          </PopoverAnchor>
          <PopoverContent align="start" sideOffset={2} className="w-64 p-1">
            {/* key: la conferma dell'eliminazione riparte per ogni mossa. */}
            <MenuItems
              key={target.node.id}
              node={target.node}
              label={o.moveMenu(moveLabel(target.node, true))}
              editable={editable}
              canToggleMistake={canToggleMistake}
              deleting={deleting}
              onComment={onComment}
              onDelete={onDelete}
              onToggleMistake={onToggleMistake}
            />
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

function MenuItems({
  node,
  label,
  editable,
  canToggleMistake,
  deleting,
  onComment,
  onDelete,
  onToggleMistake,
}: {
  node: OpeningNode
  label: string
  editable: boolean
  canToggleMistake: boolean
  deleting: boolean
  onComment: (node: OpeningNode) => void
  onDelete: (node: OpeningNode) => void
  onToggleMistake: (node: OpeningNode) => void
}) {
  const o = useOpeningsTranslations()
  const [confirming, setConfirming] = useState(false)
  return (
    <div role="menu" aria-label={label} className="flex flex-col">
      <MenuItem icon={<MessageSquare />} onClick={() => onComment(node)}>
        {o.commentMove}
      </MenuItem>
      <MenuItem
        icon={<Trash2 />}
        destructive={confirming}
        disabled={!editable || deleting}
        onClick={() => (confirming ? onDelete(node) : setConfirming(true))}
      >
        {confirming ? o.confirmDeleteMove : o.deleteMove}
      </MenuItem>
      <MenuItem
        icon={<TriangleAlert />}
        disabled={!editable || !canToggleMistake}
        onClick={() => onToggleMistake(node)}
      >
        {node.is_mistake ? o.unmarkMistake : o.markMistake}
      </MenuItem>
      {!editable && (
        <p className="text-muted-foreground px-2 pt-1 pb-1.5 text-xs">{o.menuCopyHint}</p>
      )}
    </div>
  )
}

function MenuItem({
  icon,
  destructive = false,
  disabled = false,
  onClick,
  children,
}: {
  icon: ReactNode
  destructive?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 ${
        destructive
          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:bg-destructive/20'
          : 'hover:bg-muted focus-visible:bg-muted'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
