import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppStyleId } from '@/lib/app-styles'
import { useAuth } from '@/lib/auth-context'
import type { BoardThemeId } from '@/lib/board-themes'
import type { Language } from '@/lib/i18n/translations'
import type { PieceSetId } from '@/lib/piece-sets'
import type { FailedPuzzleScope } from '@/lib/session-progress'
import { supabase } from '@/lib/supabase'

interface UserStats {
  current_elo: number
  puzzles_solved: number
  puzzles_failed: number
  auto_advance: boolean
  language: Language | null
  board_theme: BoardThemeId
  piece_set: PieceSetId
  practice_only_failed: boolean
  practice_failed_scope: FailedPuzzleScope
  app_style: AppStyleId
}

export function useUserStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await supabase
        .from('user_stats')
        .select(
          'current_elo, puzzles_solved, puzzles_failed, auto_advance, language, board_theme, piece_set, practice_only_failed, practice_failed_scope, app_style',
        )
        .eq('user_id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useUpdateAutoAdvance() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (autoAdvance: boolean) => {
      const { error } = await supabase
        .from('user_stats')
        .update({ auto_advance: autoAdvance })
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })
}

type PracticeFilterPatch = Partial<
  Pick<UserStats, 'practice_only_failed' | 'practice_failed_scope'>
>

// Ottimistico (a differenza degli altri): il filtro decide subito il puzzle
// di "Continua in pratica libera", che non deve partire col valore vecchio
// se viene premuto prima che la rilettura di user_stats sia tornata.
export function useUpdatePracticeFilter() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['user-stats', user?.id]

  return useMutation({
    mutationFn: async (patch: PracticeFilterPatch) => {
      const { error } = await supabase
        .from('user_stats')
        .update(patch)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onMutate: (patch) => {
      queryClient.setQueryData<UserStats>(queryKey, (current) =>
        current ? { ...current, ...patch } : current,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

// Ottimistico: lo stile ricolora subito tutta l'interfaccia, senza aspettare
// la rilettura di user_stats.
export function useUpdateAppStyle() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['user-stats', user?.id]

  return useMutation({
    mutationFn: async (appStyle: AppStyleId) => {
      const { error } = await supabase
        .from('user_stats')
        .update({ app_style: appStyle })
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onMutate: (appStyle) => {
      queryClient.setQueryData<UserStats>(queryKey, (current) =>
        current ? { ...current, app_style: appStyle } : current,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useUpdateLanguage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (language: Language) => {
      const { error } = await supabase
        .from('user_stats')
        .update({ language })
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })
}

export function useUpdateBoardTheme() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (boardTheme: BoardThemeId) => {
      const { error } = await supabase
        .from('user_stats')
        .update({ board_theme: boardTheme })
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })
}

export function useUpdatePieceSet() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pieceSet: PieceSetId) => {
      const { error } = await supabase
        .from('user_stats')
        .update({ piece_set: pieceSet })
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })
}
