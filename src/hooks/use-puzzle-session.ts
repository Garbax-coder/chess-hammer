import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import {
  getNextPuzzle,
  getUserElo,
  recordAttemptAndGetNextPuzzle,
  type NextPuzzleOutcome,
} from '@/lib/puzzle-engine'
import type { AttemptResult, TrainingSession } from '@/types/training'

// Il giro a cui si riferisce un esito, o null per 'session_complete' (che
// implica sempre un cambio di status della sessione da segnalare).
function outcomeRound(outcome: NextPuzzleOutcome): 1 | 2 | 3 | null {
  if (outcome.status === 'next') return outcome.data.round
  if (outcome.status === 'quota_reached') return outcome.round
  return null
}

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

      // 'active-session' cambia solo quando cambia giro o la sessione si
      // completa (raro: una volta ogni round, non ad ogni puzzle) — negli
      // altri casi rileggerla sarebbe un round trip sprecato, dato che
      // tornerebbe la stessa identica riga.
      const roundChanged =
        outcome.status === 'session_complete' || outcomeRound(outcome) !== session?.current_round
      if (roundChanged) {
        queryClient.invalidateQueries({ queryKey: ['active-session', user?.id] })
      }

      // 'session-progress' non e' piu' una query separata in TrainPage (si
      // deriva da 'session-puzzles', vedi deriveSessionProgress): invalidare
      // solo quest'ultima basta a tenere aggiornati sia la sidebar sia la
      // barra di avanzamento.
      queryClient.invalidateQueries({ queryKey: ['session-puzzles', session?.id] })
    },
  })
}
