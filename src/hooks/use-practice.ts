import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchPuzzleById } from '@/lib/puzzle-engine'
import { fetchPracticeAttempts, recordPracticeAttempt } from '@/lib/practice'
import type { AttemptResult } from '@/types/training'

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
  })
}

export function useRecordPracticeAttempt() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { puzzleId: string; result: AttemptResult; timeSeconds: number }) =>
      recordPracticeAttempt({ userId: user!.id, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-attempts', user?.id] })
    },
  })
}
