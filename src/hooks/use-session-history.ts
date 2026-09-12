import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchAllSessions, fetchSessionDetail } from '@/lib/session-history'
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

export function useSessionProgress(session: TrainingSession | null | undefined) {
  return useQuery({
    queryKey: ['session-progress', session?.id, session?.current_round],
    queryFn: () => getSessionProgress(session!),
    enabled: !!session,
  })
}
