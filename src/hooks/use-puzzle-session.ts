import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { getNextPuzzle, getUserElo, recordAttempt } from '@/lib/puzzle-engine'
import type { AttemptResult, TrainingSession } from '@/types/training'

export function useNextPuzzle(session: TrainingSession | null | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['next-puzzle', session?.id, session?.current_round],
    queryFn: async () => {
      const elo = await getUserElo(user!.id)
      return getNextPuzzle(session!, elo)
    },
    enabled: !!session && !!user,
  })
}

export function useRecordAttempt(session: TrainingSession | null | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      sessionPuzzleId: string
      round: 1 | 2 | 3
      result: AttemptResult
      timeSeconds: number
      puzzleRating: number
    }) => recordAttempt(params),
    // 'next-puzzle' non va invalidato qui: TrainPage chiama gia' refetch()
    // subito dopo mutateAsync, invalidarlo anche qui causerebbe una seconda
    // (ridondante) esecuzione dell'intera catena getNextPuzzle.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['session-progress', session?.id] })
      queryClient.invalidateQueries({ queryKey: ['session-detail', session?.id] })
    },
  })
}
