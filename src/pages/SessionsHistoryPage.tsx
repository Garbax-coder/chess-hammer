import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
          <Link key={s.id} to={`/sessions/${s.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {s.name ||
                      t.sessionsHistory.puzzlesRound(s.total_puzzles, s.current_round)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {s.name &&
                      `${t.sessionsHistory.puzzlesRound(s.total_puzzles, s.current_round)} · `}
                    {t.sessionsHistory.createdOn(
                      new Date(s.created_at).toLocaleDateString(t.meta.locale),
                    )}
                  </p>
                </div>
                <Badge variant={sessionStatusVariant[s.status]}>
                  {t.sessionStatus[s.status]}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
