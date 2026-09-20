import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import {
  fetchAllSessions,
  fetchSessionDetail,
  fetchSessionPuzzlesDetail,
} from '@/lib/session-history'
import { getSessionProgress } from '@/lib/session-progress'
import { sessionPuzzlesKey } from '@/lib/session-puzzles-cache'
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
    queryKey: sessionPuzzlesKey(session?.id),
    queryFn: () => fetchSessionPuzzlesDetail(session!.id),
    enabled: !!session,
    // Dopo il primo caricamento la lista si aggiorna a mano (vedi
    // syncSessionPuzzles: solo il delta dopo ogni tentativo). Con
    // staleTime 0 (default) React Query la riscaricherebbe INTERA (~200 KB)
    // a ogni ritorno sulla finestra e a ogni rimontaggio: su mobile, dove si
    // cambia app di continuo, era una fonte di traffico dati quanto i
    // tentativi stessi. L'unico compromesso: un tentativo registrato da un
    // altro dispositivo compare al prossimo caricamento dopo 5 minuti, non
    // subito.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useSessionProgress(session: TrainingSession | null | undefined) {
  return useQuery({
    queryKey: ['session-progress', session?.id, session?.current_round],
    queryFn: () => getSessionProgress(session!),
    enabled: !!session,
  })
}
