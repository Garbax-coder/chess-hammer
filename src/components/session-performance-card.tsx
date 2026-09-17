import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EditableSessionName } from '@/components/editable-session-name'
import { SessionPerformanceChart } from '@/components/session-performance-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionDetail, useSessionsList } from '@/hooks/use-session-history'
import { useUserStats } from '@/hooks/use-user-stats'
import { DEFAULT_BOARD_THEME, type BoardThemeId } from '@/lib/board-themes'
import { useTranslations } from '@/lib/language-context'
import { sessionStatusVariant } from '@/lib/session-status'
import type { TrainingSession } from '@/types/training'

// Il dettaglio (puzzle + tentativi) di una sessione passata viene richiesto
// solo quando la riga si espande (enabled: !!sessionId in useSessionDetail),
// non per tutte le sessioni dello storico al caricamento della dashboard.
function SessionRow({
  session,
  defaultExpanded,
  boardTheme,
}: {
  session: TrainingSession
  defaultExpanded: boolean
  boardTheme: BoardThemeId
}) {
  const t = useTranslations()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { data, isLoading } = useSessionDetail(expanded ? session.id : undefined)

  return (
    <div className="border-border/60 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={
              expanded
                ? t.dashboard.puzzlePerformance.collapseSession
                : t.dashboard.puzzlePerformance.expandSession
            }
            className="hover:bg-muted/50 -m-1 shrink-0 rounded-md p-1 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="text-muted-foreground size-4" />
            ) : (
              <ChevronRight className="text-muted-foreground size-4" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              <EditableSessionName
                session={session}
                fallback={t.sessionsHistory.puzzlesRound(
                  session.total_puzzles,
                  session.current_round,
                )}
              />
            </p>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              {t.sessionsHistory.createdOn(
                new Date(session.created_at).toLocaleDateString(t.meta.locale),
              )}
            </button>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={sessionStatusVariant[session.status]}>
            {t.sessionStatus[session.status]}
          </Badge>
          <Link
            to={`/sessions/${session.id}`}
            aria-label={t.dashboard.puzzlePerformance.openSession}
            title={t.dashboard.puzzlePerformance.openSession}
            className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md transition-colors"
          >
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>

      {expanded && (
        <div className="border-border/60 border-t px-3 py-3">
          {isLoading || !data ? (
            <p className="text-muted-foreground text-sm">{t.common.loading}</p>
          ) : (
            <SessionPerformanceChart
              puzzles={data.puzzles}
              boardTheme={boardTheme}
              onSelectPuzzle={(sessionPuzzleId) =>
                navigate(`/sessions/${session.id}?puzzle=${sessionPuzzleId}`)
              }
            />
          )}
        </div>
      )}
    </div>
  )
}

export function SessionPerformanceCard() {
  const t = useTranslations()
  const { data: sessions, isLoading } = useSessionsList()
  const { data: stats } = useUserStats()
  const boardTheme = stats?.board_theme ?? DEFAULT_BOARD_THEME

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.dashboard.puzzlePerformance.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading && <p className="text-muted-foreground text-sm">{t.common.loading}</p>}
        {sessions?.length === 0 && (
          <p className="text-muted-foreground text-sm">{t.sessionsHistory.empty}</p>
        )}
        {sessions?.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            defaultExpanded={session.status === 'in_progress'}
            boardTheme={boardTheme}
          />
        ))}
      </CardContent>
    </Card>
  )
}
