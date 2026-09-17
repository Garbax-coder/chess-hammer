import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTrainingSession,
  fetchActiveSession,
  renameTrainingSession,
} from '@/lib/training-sessions'
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

// Usata da EditableSessionName in tutti i punti dove un nome di sessione e'
// mostrato (dashboard, storico, dettaglio, allenamento in corso): invalida
// le stesse query lette da quei componenti, qualunque sia quello che ha
// avviato la modifica.
export function useRenameTrainingSession() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, name }: { sessionId: string; name: string }) =>
      renameTrainingSession(sessionId, name),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['active-session', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['sessions-list', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] })
    },
  })
}
