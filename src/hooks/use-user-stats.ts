import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface UserStats {
  current_elo: number
  puzzles_solved: number
  puzzles_failed: number
  auto_advance: boolean
}

export function useUserStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await supabase
        .from('user_stats')
        .select('current_elo, puzzles_solved, puzzles_failed, auto_advance')
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
