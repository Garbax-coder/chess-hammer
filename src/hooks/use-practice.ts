import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchPuzzleById } from '@/lib/puzzle-engine'
import { fetchPracticeAttempts, recordPracticeAttempt } from '@/lib/practice'
import type { AttemptResult, PracticeAttempt } from '@/types/training'

export function usePuzzleById(puzzleId: string | undefined) {
  return useQuery({
    queryKey: ['puzzle', puzzleId],
    queryFn: () => fetchPuzzleById(puzzleId!),
    enabled: !!puzzleId,
  })
}

export function usePracticeAttempts(puzzleIds: string[]) {
  const { user } = useAuth()
  const key = [...puzzleIds].sort().join(',')

  return useQuery({
    queryKey: ['practice-attempts', user?.id, key],
    queryFn: () => fetchPracticeAttempts(user!.id, puzzleIds),
    enabled: !!user && puzzleIds.length > 0,
    // Si aggiorna a mano dopo ogni tentativo (useRecordPracticeAttempt): non
    // serve rileggerli tutti a ogni ritorno sulla finestra.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useRecordPracticeAttempt() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { puzzleId: string; result: AttemptResult; timeSeconds: number }) =>
      recordPracticeAttempt({ userId: user!.id, ...params }),
    onSuccess: (attempt) => {
      // Aggiunge la riga appena inserita a tutte le mappe in cache (una per
      // ogni insieme di puzzle gia' interrogato) invece di invalidarle e
      // rileggere ogni tentativo di pratica: la ricerca per puzzle_id in
      // ogni mappa e' per chiave, quindi una voce in piu' dove il puzzle
      // non e' tra quelli richiesti e' innocua.
      queryClient.setQueriesData<Map<string, PracticeAttempt[]>>(
        { queryKey: ['practice-attempts', user?.id] },
        (current) => {
          if (!current) return current
          const next = new Map(current)
          next.set(attempt.puzzle_id, [...(current.get(attempt.puzzle_id) ?? []), attempt])
          return next
        },
      )
    },
  })
}
