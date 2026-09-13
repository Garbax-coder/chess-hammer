import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { getNextPuzzle, getUserElo, recordAttemptAndGetNextPuzzle } from '@/lib/puzzle-engine'
import type { AttemptResult, TrainingSession } from '@/types/training'

// Niente current_round nella key: dopo un tentativo scriviamo l'esito in
// cache direttamente (vedi useRecordAttempt), senza aspettare che
// 'active-session' si aggiorni. Se la key includesse current_round, un
// cambio di giro la farebbe puntare a una entry senza dati gia' pronti,
// forzando un refetch evitabile.
function nextPuzzleQueryKey(sessionId: string | undefined) {
  return ['next-puzzle', sessionId]
}

export function useNextPuzzle(session: TrainingSession | null | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: nextPuzzleQueryKey(session?.id),
    queryFn: async () => {
      const elo = await getUserElo(user!.id)
      return getNextPuzzle(session!, elo)
    },
    enabled: !!session && !!user,
    // Dopo il fetch iniziale, questa entry e' gestita a mano (vedi
    // useRecordAttempt: scrive il risultato della RPC direttamente in
    // cache). Senza staleTime un refetch automatico in background (rimessa
    // a fuoco della finestra, remount, ecc.) puo' partire proprio mentre
    // stiamo scrivendo l'esito appena arrivato dalla mutation e sovrascriverlo
    // in corsa con una risposta calcolata da query separate (la vecchia
    // catena multi-round-trip), riportando 'outcome' in uno stato
    // incoerente. staleTime: Infinity disattiva questi refetch impliciti;
    // l'unico modo per invalidare resta esplicito (es. i reset di sviluppo).
    staleTime: Infinity,
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
    }) => recordAttemptAndGetNextPuzzle({ sessionId: session!.id, ...params }),
    onSuccess: (outcome) => {
      // La RPC ha gia' deciso il prossimo puzzle nella stessa chiamata che
      // ha registrato il tentativo: si scrive subito in cache invece di
      // invalidare 'next-puzzle' e rifare da capo l'intera catena di query.
      queryClient.setQueryData(nextPuzzleQueryKey(session?.id), outcome)
      queryClient.invalidateQueries({ queryKey: ['active-session', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['session-progress', session?.id] })
      queryClient.invalidateQueries({ queryKey: ['session-detail', session?.id] })
    },
  })
}
