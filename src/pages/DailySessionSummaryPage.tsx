import { Link, useParams } from 'react-router-dom'
import { DailySessionSummary } from '@/components/daily-session-summary'
import { Button } from '@/components/ui/button'
import { useSessionDetail } from '@/hooks/use-session-history'
import { useUserStats } from '@/hooks/use-user-stats'
import { DEFAULT_BOARD_THEME } from '@/lib/board-themes'
import { useTranslations } from '@/lib/language-context'
import { entriesForDay } from '@/lib/session-days'

// Punto d'arrivo del click su un raggruppamento giornaliero della heatmap
// "Prestazioni puzzle" in dashboard (vedi SessionPerformanceChart).
export default function DailySessionSummaryPage() {
  const { id, date } = useParams<{ id: string; date: string }>()
  const t = useTranslations()
  const { data, isLoading } = useSessionDetail(id)
  const { data: stats } = useUserStats()
  const boardTheme = stats?.board_theme ?? DEFAULT_BOARD_THEME

  if (isLoading || !data || !date) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  const entries = entriesForDay(data.puzzles, date)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link to={`/sessions/${id}`}>{t.dailySummary.backToSession}</Link>
      </Button>

      <DailySessionSummary day={date} entries={entries} boardTheme={boardTheme} />
    </main>
  )
}
