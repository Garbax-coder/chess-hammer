import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import type { OpeningProgress } from '@/lib/opening-tree'
import { fetchOpeningProgress, fetchRepertoires, recordOpeningMove } from '@/lib/openings'

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

export function useRecordOpeningMove() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordOpeningMove,
    onSuccess: (progress) => {
      queryClient.setQueryData<OpeningProgress[]>(openingProgressKey(user?.id), (rows) =>
        rows
          ? [...rows.filter((row) => row.node_id !== progress.node_id), progress]
          : [progress],
      )
    },
  })
}
