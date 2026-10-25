import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import type { OpeningProgress } from '@/lib/opening-tree'
import {
  fetchOpeningCycles,
  fetchOpeningNames,
  fetchOpeningProgress,
  fetchRepertoires,
  learnOpeningMove,
  recordOpeningMove,
  saveOpeningCycle,
  type OpeningCycle,
} from '@/lib/openings'

export function openingProgressKey(userId: string | undefined) {
  return ['opening-progress', userId]
}

// Il catalogo cambia solo con una migrazione: si legge una volta.
export function useRepertoires() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['opening-repertoires', user?.id],
    queryFn: fetchRepertoires,
    enabled: !!user,
    staleTime: Infinity,
  })
}

// I nomi delle aperture, per mossa: cambiano solo con una migrazione.
export function useOpeningNames() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['opening-names', user?.id],
    queryFn: fetchOpeningNames,
    enabled: !!user,
    staleTime: Infinity,
    select: (rows) =>
      new Map(rows.map(({ node_id, eco, name }) => [node_id, { eco, name }])),
  })
}

// I progressi cambiano solo con le mosse dell'utente, che aggiornano la
// cache una per una (useRecordOpeningMove): non serve rileggerli.
export function useOpeningProgress() {
  const { user } = useAuth()
  return useQuery({
    queryKey: openingProgressKey(user?.id),
    queryFn: fetchOpeningProgress,
    enabled: !!user,
    staleTime: Infinity,
    select: (rows) => new Map(rows.map((row) => [row.node_id, row])),
  })
}

// Il progresso restituito da una mossa (allenata o studiata) sostituisce
// quello in cache: niente rilettura di tutti i progressi.
function useUpdateProgressCache() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return (progress: OpeningProgress) =>
    queryClient.setQueryData<OpeningProgress[]>(openingProgressKey(user?.id), (rows) =>
      rows
        ? [...rows.filter((row) => row.node_id !== progress.node_id), progress]
        : [progress],
    )
}

export function useRecordOpeningMove() {
  const updateCache = useUpdateProgressCache()
  return useMutation({ mutationFn: recordOpeningMove, onSuccess: updateCache })
}

export function useLearnOpeningMove() {
  const updateCache = useUpdateProgressCache()
  return useMutation({ mutationFn: learnOpeningMove, onSuccess: updateCache })
}

function openingCyclesKey(userId: string | undefined, repertoireId: string) {
  return ['opening-cycles', userId, repertoireId]
}

export function useOpeningCycles(repertoireId: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: openingCyclesKey(user?.id, repertoireId),
    queryFn: () => fetchOpeningCycles(repertoireId),
    enabled: !!user,
  })
}

/** Salva un ciclo completato e lo aggiunge allo storico in cache. */
export function useSaveOpeningCycle() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Omit<Parameters<typeof saveOpeningCycle>[0], 'userId'>) =>
      saveOpeningCycle({ ...params, userId: user!.id }),
    onSuccess: (cycle) => {
      queryClient.setQueryData<OpeningCycle[]>(
        openingCyclesKey(user?.id, cycle.repertoire_id),
        (rows) => [...(rows ?? []), cycle],
      )
    },
  })
}
