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
  if (outcome.status === 'quota_reached' || outcome.status === 'resting')
    return outcome.round
  return null
}

// Niente current_round nella key: quando l'utente e' pronto ad avanzare
// (vedi TrainPage.handleAdvance) l'esito gia' pronto viene scritto qui
// direttamente, senza aspettare che 'active-session' si aggiorni. Se la key
// includesse current_round, un cambio di giro la farebbe puntare a una
// entry senza dati gia' pronti, forzando un refetch evitabile.
export function nextPuzzleQueryKey(sessionId: string | undefined) {
  return ['next-puzzle', sessionId]
}

export function useNextPuzzle(session: TrainingSession | null | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: nextPuzzleQueryKey(session?.id),
    queryFn: async () => {
      const elo = await getUserElo(user!.id)
      const outcome = await getNextPuzzle(session!, elo)
      // getNextPuzzle puo', come effetto collaterale, inserire un nuovo
      // session_puzzle (nuova pesca al giro 1) o avanzare di giro: senza
      // invalidare, la sidebar (useSessionPuzzles, cache separata) resta
      // ferma alla lista di prima finche' non arriva il prossimo tentativo
      // registrato (vedi useRecordAttempt piu' sotto, che invalida
      // esplicitamente dopo OGNI tentativo) — qui serve lo stesso, dato che
      // questa query gira anche al primo caricamento di un giorno nuovo,
      // prima di qualunque tentativo.
      queryClient.invalidateQueries({ queryKey: ['session-puzzles', session?.id] })
      return outcome
    },
    enabled: !!session && !!user,
    // Dopo il fetch iniziale, questa entry e' gestita a mano (vedi
    // TrainPage.handleAdvance: scrive il risultato gia' pronto della
    // mutation direttamente in cache quando l'utente e' pronto ad
    // avanzare). Senza staleTime un refetch automatico in background
    // (rimessa a fuoco della finestra, remount, ecc.) potrebbe sovrascrivere
    // quell'esito in corsa con una risposta ricalcolata da capo, riportando
    // 'outcome' in uno stato incoerente. staleTime: Infinity disattiva
    // questi refetch impliciti; l'unico modo per invalidare resta esplicito
    // (es. i reset di sviluppo).
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
      // Il prossimo puzzle NON va scritto subito in cache 'next-puzzle':
      // questa mutation ora parte appena il puzzle finisce (vedi
      // TrainPage.handleComplete), non piu' al click su "Puzzle
      // successivo", quindi applicarlo qui farebbe cambiare la scacchiera
      // sotto l'utente mentre sta ancora rivedendo/analizzando il
      // tentativo appena concluso. E' TrainPage a scrivere il risultato in
      // cache (handleAdvance), solo quando l'utente e' davvero pronto ad
      // andare avanti.

      // 'active-session' cambia solo quando cambia giro o la sessione si
      // completa (raro: una volta ogni round, non ad ogni puzzle) — negli
      // altri casi rileggerla sarebbe un round trip sprecato, dato che
      // tornerebbe la stessa identica riga.
      const roundChanged =
        outcome.status === 'session_complete' ||
        outcomeRound(outcome) !== session?.current_round
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
