import type { SessionStatus } from '@/types/training'

export const sessionStatusVariant: Record<
  SessionStatus,
  'default' | 'secondary' | 'outline'
> = {
  in_progress: 'default',
  completed: 'secondary',
  abandoned: 'outline',
}
