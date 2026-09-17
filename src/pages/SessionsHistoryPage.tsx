import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EditableSessionName } from '@/components/editable-session-name'
import { useSessionsList } from '@/hooks/use-session-history'
import { useTranslations } from '@/lib/language-context'
import { sessionStatusVariant } from '@/lib/session-status'

export default function SessionsHistoryPage() {
  const t = useTranslations()
  const { data: sessions, isLoading } = useSessionsList()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-foreground text-lg font-semibold tracking-tight">
        {t.sessionsHistory.title}
      </h1>

      {isLoading && <p className="text-muted-foreground text-sm">{t.common.loading}</p>}

      {sessions?.length === 0 && (
        <p className="text-muted-foreground text-sm">{t.sessionsHistory.empty}</p>
      )}

      <div className="flex flex-col gap-3">
        {sessions?.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between gap-2 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">
                  <EditableSessionName
                    session={s}
                    fallback={t.sessionsHistory.puzzlesRound(
                      s.total_puzzles,
                      s.current_round,
                    )}
                  />
                </p>
                <p className="text-muted-foreground text-xs">
                  {s.name &&
                    `${t.sessionsHistory.puzzlesRound(s.total_puzzles, s.current_round)} · `}
                  {t.sessionsHistory.createdOn(
                    new Date(s.created_at).toLocaleDateString(t.meta.locale),
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={sessionStatusVariant[s.status]}>
                  {t.sessionStatus[s.status]}
                </Badge>
                <Link
                  to={`/sessions/${s.id}`}
                  aria-label={t.dashboard.puzzlePerformance.openSession}
                  title={t.dashboard.puzzlePerformance.openSession}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md transition-colors"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
