import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import {
  fetchAllSessions,
  fetchSessionDetail,
  fetchSessionPuzzlesDetail,
} from '@/lib/session-history'
import { getSessionProgress } from '@/lib/session-progress'
import type { TrainingSession } from '@/types/training'

export function useSessionsList() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['sessions-list', user?.id],
    queryFn: () => fetchAllSessions(user!.id),
    enabled: !!user,
  })
}

export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: !!sessionId,
  })
}

// Per chi ha gia' l'oggetto sessione (es. TrainPage, via useActiveSession):
// solo i puzzle, senza rileggere anche la riga training_sessions che il
// chiamante ha gia' in mano.
export function useSessionPuzzles(session: TrainingSession | null | undefined) {
  return useQuery({
    queryKey: ['session-puzzles', session?.id],
    queryFn: () => fetchSessionPuzzlesDetail(session!.id),
    enabled: !!session,
  })
}

export function useSessionProgress(session: TrainingSession | null | undefined) {
  return useQuery({
    queryKey: ['session-progress', session?.id, session?.current_round],
    queryFn: () => getSessionProgress(session!),
    enabled: !!session,
  })
}
