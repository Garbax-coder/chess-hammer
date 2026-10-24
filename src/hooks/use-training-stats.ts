import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchTrainingStats } from '@/lib/training-stats'

export function trainingStatsKey(userId: string | undefined) {
  return ['training-stats', userId]
}

// Si legge una volta e si tiene: cambia solo quando l'utente gioca un puzzle
// dell'allenamento, e in quel caso useRecordAttempt la segna da rileggere
// (alla prossima apertura della pagina, non subito). Cosi' aprire e chiudere
// le statistiche non interroga il database ogni volta.
export function useTrainingStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: trainingStatsKey(user?.id),
    queryFn: fetchTrainingStats,
    enabled: !!user,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  })
}
