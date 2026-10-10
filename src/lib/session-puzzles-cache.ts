import type { QueryClient } from '@tanstack/react-query'
import {
  countSessionRows,
  fetchSessionAttemptsSince,
  fetchSessionPuzzleAttempts,
  fetchSessionPuzzlesAfter,
  fetchSessionPuzzlesDetail,
} from '@/lib/session-history'
import {
  countAttempts,
  latestAttemptAt,
  maxOrderIndex,
  mergeChangedAttempts,
  mergeSessionPuzzlesDelta,
} from '@/lib/session-puzzles-merge'
import { readSnapshot, writeSnapshot } from '@/lib/session-puzzles-snapshot'
import type { SessionPuzzleResult } from '@/types/training'

export function sessionPuzzlesKey(sessionId: string | undefined) {
  return ['session-puzzles', sessionId]
}

// Carica la lista puzzle all'apertura di /train. Con una copia locale scarica
// solo i puzzle aggiunti e i tentativi registrati dopo l'ultimo gia' noto
// (anche da un altro dispositivo), invece di fen/mosse/temi di 200 puzzle a
// ogni visita: era la voce piu' pesante del traffico dati per utente. Se i
// conteggi del database non coincidono con la lista ricostruita (righe
// cancellate, copia di una versione precedente) o una richiesta fallisce, si
// riscarica tutto: mai una lista incoerente.
export async function loadSessionPuzzles(
  sessionId: string,
): Promise<SessionPuzzleResult[]> {
  const cached = readSnapshot(sessionId)
  if (cached) {
    try {
      const [newPuzzles, changedAttempts, counts] = await Promise.all([
        fetchSessionPuzzlesAfter(sessionId, maxOrderIndex(cached)),
        fetchSessionAttemptsSince(sessionId, latestAttemptAt(cached)),
        countSessionRows(sessionId),
      ])
      const merged = mergeSessionPuzzlesDelta(
        mergeChangedAttempts(cached, changedAttempts),
        {
          newPuzzles,
        },
      )
      if (merged.length === counts.puzzles && countAttempts(merged) === counts.attempts) {
        writeSnapshot(sessionId, merged)
        return merged
      }
    } catch (error) {
      console.error('Aggiornamento della copia locale fallito, rilettura completa', error)
    }
  }
  const full = await fetchSessionPuzzlesDetail(sessionId)
  writeSnapshot(sessionId, full)
  return full
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
      queryFn: () => loadSessionPuzzles(sessionId),
      staleTime: Infinity,
    })
    const [newPuzzles, changedAttempts] = await Promise.all([
      fetchSessionPuzzlesAfter(sessionId, maxOrderIndex(current)),
      changedSessionPuzzleId
        ? fetchSessionPuzzleAttempts(changedSessionPuzzleId)
        : Promise.resolve(null),
    ])
    const updated = queryClient.setQueryData<SessionPuzzleResult[]>(key, (latest) =>
      latest
        ? mergeSessionPuzzlesDelta(latest, {
            newPuzzles,
            changedSessionPuzzleId,
            changedAttempts,
          })
        : latest,
    )
    if (updated) writeSnapshot(sessionId, updated)
  } catch (error) {
    console.error('Sincronizzazione incrementale fallita, rilettura completa', error)
    void queryClient.invalidateQueries({ queryKey: key })
  }
}
