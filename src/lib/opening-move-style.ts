import type { MoveState } from '@/lib/opening-tree'

// Colori della padronanza sulle mosse dell'utente (heatmap); le mosse
// dell'avversario restano neutre.
export const MOVE_STATE_CLASSES: Record<MoveState, string> = {
  new: 'bg-muted text-muted-foreground',
  learning: 'bg-amber-500/20 text-amber-800 dark:text-amber-200',
  due: 'bg-red-500/20 text-red-800 dark:text-red-200',
  mastered: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200',
}
