import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchSavedPuzzleIds, setPuzzleSaved } from '@/lib/saved-puzzles'

function savedPuzzlesKey(userId: string | undefined) {
  return ['saved-puzzles', userId]
}

/** Gli id (Lichess) dei puzzle salvati tra i "problematici". */
export function useSavedPuzzles() {
  const { user } = useAuth()
  return useQuery({
    queryKey: savedPuzzlesKey(user?.id),
    queryFn: fetchSavedPuzzleIds,
    enabled: !!user,
  })
}

// Ottimistico: il segnalibro cambia subito; se il salvataggio fallisce torna
// com'era alla rilettura.
export function useToggleSavedPuzzle() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = savedPuzzlesKey(user?.id)

  return useMutation({
    mutationFn: ({ puzzleId, saved }: { puzzleId: string; saved: boolean }) =>
      setPuzzleSaved(user!.id, puzzleId, saved),
    onMutate: ({ puzzleId, saved }) => {
      queryClient.setQueryData<Set<string>>(queryKey, (current) => {
        const next = new Set(current)
        if (saved) next.add(puzzleId)
        else next.delete(puzzleId)
        return next
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
