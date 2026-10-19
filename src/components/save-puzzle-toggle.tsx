import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSavedPuzzles, useToggleSavedPuzzle } from '@/hooks/use-saved-puzzles'
import { useTranslations } from '@/lib/language-context'

/** Salva il puzzle sulla scacchiera tra i "problematici", o lo toglie. */
export function SavePuzzleToggle({ puzzleId }: { puzzleId: string }) {
  const t = useTranslations()
  const { data: saved } = useSavedPuzzles()
  const toggle = useToggleSavedPuzzle()
  const isSaved = saved?.has(puzzleId) ?? false

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-fit"
      aria-pressed={isSaved}
      disabled={!saved}
      onClick={() => toggle.mutate({ puzzleId, saved: !isSaved })}
    >
      {isSaved ? (
        <BookmarkCheck className="text-primary size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {isSaved ? t.savedPuzzle.saved : t.savedPuzzle.save}
    </Button>
  )
}
