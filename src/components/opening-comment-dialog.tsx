import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useOpeningsTranslations } from '@/lib/i18n/openings'

/**
 * Il commento personale su una mossa: si apre col tasto destro sulla mossa
 * nell'albero. Salvare un testo vuoto equivale a eliminarlo.
 */
export function OpeningCommentDialog({
  moveLabel,
  initial,
  saving,
  onSave,
  onDelete,
  onClose,
}: {
  /** La mossa in notazione (es. "3.Bc4"); null = finestra chiusa. */
  moveLabel: string | null
  initial: string
  saving: boolean
  onSave: (text: string) => void
  onDelete: () => void
  onClose: () => void
}) {
  const o = useOpeningsTranslations()
  return (
    <Dialog open={moveLabel !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {moveLabel !== null && (
          // key: il testo riparte da quello della mossa aperta.
          <CommentForm
            key={moveLabel}
            title={o.commentTitle(moveLabel)}
            initial={initial}
            saving={saving}
            onSave={onSave}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CommentForm({
  title,
  initial,
  saving,
  onSave,
  onDelete,
  onClose,
}: {
  title: string
  initial: string
  saving: boolean
  onSave: (text: string) => void
  onDelete: () => void
  onClose: () => void
}) {
  const o = useOpeningsTranslations()
  const [text, setText] = useState(initial)
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <textarea
        aria-label={title}
        value={text}
        maxLength={2000}
        rows={5}
        autoFocus
        placeholder={o.commentPlaceholder}
        onChange={(e) => setText(e.target.value)}
        className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3"
      />
      <DialogFooter className="gap-2 sm:justify-between">
        <Button variant="ghost" onClick={onDelete} disabled={saving || initial === ''}>
          {o.deleteComment}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            {o.cancel}
          </Button>
          <Button loading={saving} onClick={() => onSave(text.trim())}>
            {o.saveComment}
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
