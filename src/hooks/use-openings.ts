import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import type { MoveArrow } from '@/lib/opening-arrows'
import { loadEcoLines } from '@/lib/opening-eco'
import type { OpeningProgress } from '@/lib/opening-tree'
import {
  addOpeningMove,
  copyOpeningRepertoire,
  createOpeningRepertoire,
  deleteOpeningMove,
  deleteOpeningRepertoire,
  fetchHiddenRepertoires,
  fetchOpeningArrows,
  fetchOpeningCycles,
  fetchOpeningNames,
  fetchOpeningNotes,
  fetchOpeningProgress,
  fetchOpeningStats,
  fetchRepertoires,
  importOpeningRepertoire,
  learnOpeningMove,
  recordOpeningMove,
  renameOpeningRepertoire,
  saveOpeningCycle,
  saveOpeningArrows,
  saveOpeningNote,
  setOpeningMoveAlternative,
  setOpeningMoveMistake,
  setRepertoireHidden,
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

// Dopo un import o una cancellazione cambiano l'elenco dei repertori e i
// nomi delle loro mosse.
function useRefreshRepertoires() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['opening-repertoires', user?.id] }),
      queryClient.invalidateQueries({ queryKey: ['opening-names', user?.id] }),
    ])
}

export function useImportRepertoire() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: importOpeningRepertoire, onSuccess: refresh })
}

/** Le statistiche delle aperture (pagina Statistiche). */
export function useOpeningStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['opening-stats', user?.id],
    queryFn: fetchOpeningStats,
    enabled: !!user,
  })
}

export function useCreateRepertoire() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: createOpeningRepertoire, onSuccess: refresh })
}

function hiddenRepertoiresKey(userId: string | undefined) {
  return ['opening-hidden-repertoires', userId]
}

/** I repertori del catalogo che l'utente ha tolto dalla sua libreria. */
export function useHiddenRepertoires() {
  const { user } = useAuth()
  return useQuery({
    queryKey: hiddenRepertoiresKey(user?.id),
    queryFn: fetchHiddenRepertoires,
    enabled: !!user,
    staleTime: Infinity,
    select: (ids) => new Set(ids),
  })
}

export function useSetRepertoireHidden() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { repertoireId: string; hidden: boolean }) =>
      setRepertoireHidden({ ...params, userId: user!.id }),
    onSuccess: (_data, { repertoireId, hidden }) => {
      queryClient.setQueryData<string[]>(hiddenRepertoiresKey(user?.id), (ids) => [
        ...(ids ?? []).filter((id) => id !== repertoireId),
        ...(hidden ? [repertoireId] : []),
      ])
    },
  })
}

export function useDeleteRepertoire() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: deleteOpeningRepertoire, onSuccess: refresh })
}

function openingNotesKey(userId: string | undefined) {
  return ['opening-notes', userId]
}

// I commenti personali cambiano solo quando l'utente li scrive: la cache si
// aggiorna da sola (useSaveOpeningNote).
export function useOpeningNotes() {
  const { user } = useAuth()
  return useQuery({
    queryKey: openingNotesKey(user?.id),
    queryFn: fetchOpeningNotes,
    enabled: !!user,
    staleTime: Infinity,
    select: (rows) => new Map(rows.map((row) => [row.node_id, row.note])),
  })
}

export function useSaveOpeningNote() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { nodeId: number; note: string | null }) =>
      saveOpeningNote({ ...params, userId: user!.id }),
    onSuccess: (_data, { nodeId, note }) => {
      queryClient.setQueryData<{ node_id: number; note: string }[]>(
        openingNotesKey(user?.id),
        (rows) => [
          ...(rows ?? []).filter((row) => row.node_id !== nodeId),
          ...(note === null ? [] : [{ node_id: nodeId, note }]),
        ],
      )
    },
  })
}

// Modifica dei repertori personali: dopo ogni modifica si rilegge l'elenco
// (con le mosse) prima di proseguire, cosi' la mossa nuova e' gia' nell'albero
// quando la si seleziona.
export function useAddOpeningMove() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: addOpeningMove, onSuccess: refresh })
}

export function useDeleteOpeningMove() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: deleteOpeningMove, onSuccess: refresh })
}

export function useSetMoveMistake() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: setOpeningMoveMistake, onSuccess: refresh })
}

function openingArrowsKey(userId: string | undefined) {
  return ['opening-arrows', userId]
}

/** Le frecce dell'utente per mossa (la posizione dopo quella mossa). */
export function useOpeningArrows() {
  const { user } = useAuth()
  return useQuery({
    queryKey: openingArrowsKey(user?.id),
    queryFn: fetchOpeningArrows,
    enabled: !!user,
    staleTime: Infinity,
    select: (rows) => new Map(rows.map((row) => [row.node_id, row.arrows])),
  })
}

// Le frecce si aggiornano subito in cache (la scacchiera le mostra mentre si
// disegna); se il salvataggio fallisce si rileggono.
export function useSaveOpeningArrows() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const key = openingArrowsKey(user?.id)
  return useMutation({
    mutationFn: (params: { nodeId: number; arrows: MoveArrow[] }) =>
      saveOpeningArrows({ ...params, userId: user!.id }),
    onMutate: ({ nodeId, arrows }) => {
      queryClient.setQueryData<{ node_id: number; arrows: MoveArrow[] }[]>(
        key,
        (rows) => [
          ...(rows ?? []).filter((row) => row.node_id !== nodeId),
          ...(arrows.length > 0 ? [{ node_id: nodeId, arrows }] : []),
        ],
      )
    },
    onError: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useSetMoveAlternative() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: setOpeningMoveAlternative, onSuccess: refresh })
}

/** Il dataset delle aperture di Lichess, per creare un repertorio da ECO. */
export function useEcoLines() {
  return useQuery({ queryKey: ['eco-lines'], queryFn: loadEcoLines, staleTime: Infinity })
}

export function useCopyRepertoire() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: copyOpeningRepertoire, onSuccess: refresh })
}

export function useRenameRepertoire() {
  const refresh = useRefreshRepertoires()
  return useMutation({ mutationFn: renameOpeningRepertoire, onSuccess: refresh })
}
