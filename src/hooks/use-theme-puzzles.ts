import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchThemePuzzles, type ThemePuzzleSource } from '@/lib/theme-puzzles'

export function themePuzzlesKey(userId: string | undefined) {
  return ['theme-puzzles', userId]
}

export function useThemePuzzles(theme: string | undefined, source: ThemePuzzleSource) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...themePuzzlesKey(user?.id), theme, source],
    queryFn: () => fetchThemePuzzles(theme!, source),
    enabled: !!user && !!theme,
  })
}
