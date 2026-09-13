import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { SessionPerformanceChart } from '@/components/session-performance-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionDetail, useSessionsList } from '@/hooks/use-session-history'
import { useTranslations } from '@/lib/language-context'
import { sessionStatusVariant } from '@/lib/session-status'
import type { TrainingSession } from '@/types/training'

// Il dettaglio (puzzle + tentativi) di una sessione passata viene richiesto
// solo quando la riga si espande (enabled: !!sessionId in useSessionDetail),
// non per tutte le sessioni dello storico al caricamento della dashboard.
function SessionRow({
  session,
  defaultExpanded,
}: {
  session: TrainingSession
  defaultExpanded: boolean
}) {
  const t = useTranslations()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { data, isLoading } = useSessionDetail(expanded ? session.id : undefined)

  return (
    <div className="border-border/60 overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors"
      >
        <div className="flex min-w-0 items-center gap-2">
          {expanded ? (
            <ChevronDown className="text-muted-foreground size-4 shrink-0" />
          ) : (
            <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">
              {t.sessionsHistory.puzzlesRound(
                session.total_puzzles,
                session.current_round,
              )}
            </p>
            <p className="text-muted-foreground text-xs">
              {t.sessionsHistory.createdOn(
                new Date(session.created_at).toLocaleDateString(t.meta.locale),
              )}
            </p>
          </div>
        </div>
        <Badge variant={sessionStatusVariant[session.status]} className="shrink-0">
          {t.sessionStatus[session.status]}
        </Badge>
      </button>

      {expanded && (
        <div className="border-border/60 border-t px-3 py-3">
          {isLoading || !data ? (
            <p className="text-muted-foreground text-sm">{t.common.loading}</p>
          ) : (
            <SessionPerformanceChart puzzles={data.puzzles} />
          )}
        </div>
      )}
    </div>
  )
}

export function SessionPerformanceCard() {
  const t = useTranslations()
  const { data: sessions, isLoading } = useSessionsList()

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
          />
        ))}
      </CardContent>
    </Card>
  )
}
