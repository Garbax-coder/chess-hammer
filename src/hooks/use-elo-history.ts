import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchEloHistory, type EloRange } from '@/lib/elo-history'

export function useEloHistory(range: EloRange) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['elo-history', user?.id, range],
    queryFn: () => fetchEloHistory(range),
    enabled: !!user,
  })
}
