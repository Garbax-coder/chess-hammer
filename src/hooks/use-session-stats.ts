import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchSessionRoundStats } from '@/lib/session-stats'

export function sessionRoundStatsKey(userId: string | undefined) {
  return ['session-round-stats', userId]
}

// Statistiche per sessione e giro di tutte le sessioni dell'utente: servono
// solo ai riepiloghi (fine giro, fine sessione), quindi si leggono quando
// uno di questi compare e si invalidano a ogni cambio di giro.
export function useSessionRoundStats(enabled = true) {
  const { user } = useAuth()
  return useQuery({
    queryKey: sessionRoundStatsKey(user?.id),
    queryFn: fetchSessionRoundStats,
    enabled: enabled && !!user,
  })
}
