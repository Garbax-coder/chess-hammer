import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminSessionPuzzles,
  fetchAdminStats,
  fetchAdminUserDetail,
  fetchAdminUsers,
} from '@/lib/admin'

// Gli intervalli giornalieri seguono il fuso orario di chi guarda.
function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function useAdminStats() {
  const timeZone = browserTimeZone()
  return useQuery({
    queryKey: ['admin', 'stats', timeZone],
    queryFn: () => fetchAdminStats(timeZone),
    retry: false,
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
    retry: false,
  })
}

export function useAdminUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => fetchAdminUserDetail(userId!),
    enabled: !!userId,
    retry: false,
  })
}

export function useAdminSessionPuzzles(sessionId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'session-puzzles', sessionId],
    queryFn: () => fetchAdminSessionPuzzles(sessionId),
    enabled,
    retry: false,
  })
}
