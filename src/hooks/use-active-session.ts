import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTrainingSession, fetchActiveSession } from '@/lib/training-sessions'
import { useAuth } from '@/lib/auth-context'
import type { NewTrainingSessionInput } from '@/types/training'

export function useActiveSession() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['active-session', user?.id],
    queryFn: () => fetchActiveSession(user!.id),
    enabled: !!user,
  })
}

export function useCreateTrainingSession() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: NewTrainingSessionInput) =>
      createTrainingSession(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session', user?.id] })
    },
  })
}
