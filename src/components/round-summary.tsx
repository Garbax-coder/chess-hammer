import { StatsComparison } from '@/components/stats-comparison'
import { useSessionRoundStats } from '@/hooks/use-session-stats'
import { useTranslations } from '@/lib/language-context'
import { compareRound, formatAverage, formatDuration } from '@/lib/session-stats'
import type { TrainingSession } from '@/types/training'

/**
 * Riepilogo di un giro concluso: risolti, sbagliati, tempo totale e medio,
 * e confronto con lo stesso giro delle sessioni precedenti.
 */
export function RoundSummary({
  session,
  round,
}: {
  session: Pick<TrainingSession, 'id' | 'created_at'>
  round: 1 | 2 | 3
}) {
  const t = useTranslations()
  const { data: rows } = useSessionRoundStats()
  const comparison = rows ? compareRound(rows, session, round) : null

  if (!comparison) return null
  const { current } = comparison

  return (
    <div className="flex flex-col gap-3">
      <p className="text-foreground text-sm">
        {t.summary.roundLine(
          current.solved,
          current.failed,
          formatDuration(current.totalSeconds),
          formatAverage(current.averageSeconds),
        )}
      </p>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-muted-foreground text-xs font-medium">
          {t.summary.compareTitle}
        </h3>
        <StatsComparison comparison={comparison} />
      </div>
    </div>
  )
}
