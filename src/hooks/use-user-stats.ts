import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface UserStats {
  current_elo: number
  puzzles_solved: number
  puzzles_failed: number
}

export function useUserStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await supabase
        .from('user_stats')
        .select('current_elo, puzzles_solved, puzzles_failed')
        .eq('user_id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}
