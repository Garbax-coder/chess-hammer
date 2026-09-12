import type { SessionStatus } from '@/types/training'

export const sessionStatusLabel: Record<SessionStatus, string> = {
  in_progress: 'In corso',
  completed: 'Completata',
  abandoned: 'Abbandonata',
}

export const sessionStatusVariant: Record<
  SessionStatus,
  'default' | 'secondary' | 'outline'
> = {
  in_progress: 'default',
  completed: 'secondary',
  abandoned: 'outline',
}
