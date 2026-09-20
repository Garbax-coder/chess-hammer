import type { QueryClient } from '@tanstack/react-query'
import {
  fetchSessionPuzzleAttempts,
  fetchSessionPuzzlesAfter,
  fetchSessionPuzzlesDetail,
} from '@/lib/session-history'
import { maxOrderIndex, mergeSessionPuzzlesDelta } from '@/lib/session-puzzles-merge'
import type { SessionPuzzleResult } from '@/types/training'

export function sessionPuzzlesKey(sessionId: string | undefined) {
  return ['session-puzzles', sessionId]
}

// Aggiorna la lista puzzle in cache dopo un tentativo (o dopo che
// getNextPuzzle ha pescato un nuovo puzzle) scaricando SOLO il delta: i
// tentativi del puzzle appena giocato (<= 3 righe) e i puzzle aggiunti al
// pool. Prima si invalidava la query e si riscaricava l'intera lista dopo
// ogni tentativo: fen, mosse e temi di 200 puzzle, ~200 KB (41 KB
// compressi) ogni volta, il consumo di traffico dati che limitava il piano
// gratuito a poche centinaia di utenti attivi.
//
// fetchQuery con staleTime infinito e' la base: se la lista e' gia' in
// cache la restituisce senza rete; se e' in corso di caricamento (succede
// al primo render, quando getNextPuzzle finisce prima della lista) ne
// attende il risultato invece di avviarne un secondo download; solo se non
// esiste affatto la scarica. Poi si chiede il delta, che comprende anche un
// eventuale puzzle inserito mentre quel download era in volo.
//
// Se una richiesta fallisce si ripiega sul comportamento di prima
// (invalidazione = rilettura intera): mai una lista incoerente, al massimo
// un download in piu'.
export async function syncSessionPuzzles(
  queryClient: QueryClient,
  sessionId: string,
  changedSessionPuzzleId?: string,
): Promise<void> {
  const key = sessionPuzzlesKey(sessionId)

  try {
    const current = await queryClient.fetchQuery<SessionPuzzleResult[]>({
      queryKey: key,
      queryFn: () => fetchSessionPuzzlesDetail(sessionId),
      staleTime: Infinity,
    })
    const [newPuzzles, changedAttempts] = await Promise.all([
      fetchSessionPuzzlesAfter(sessionId, maxOrderIndex(current)),
      changedSessionPuzzleId
        ? fetchSessionPuzzleAttempts(changedSessionPuzzleId)
        : Promise.resolve(null),
    ])
    queryClient.setQueryData<SessionPuzzleResult[]>(key, (latest) =>
      latest
        ? mergeSessionPuzzlesDelta(latest, {
            newPuzzles,
            changedSessionPuzzleId,
            changedAttempts,
          })
        : latest,
    )
  } catch (error) {
    console.error('Sincronizzazione incrementale fallita, rilettura completa', error)
    void queryClient.invalidateQueries({ queryKey: key })
  }
}
