import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSessionsList } from '@/hooks/use-session-history'
import type { SessionStatus } from '@/types/training'

const statusLabel: Record<SessionStatus, string> = {
  in_progress: 'In corso',
  completed: 'Completata',
  abandoned: 'Abbandonata',
}

const statusVariant: Record<SessionStatus, 'default' | 'secondary' | 'outline'> = {
  in_progress: 'default',
  completed: 'secondary',
  abandoned: 'outline',
}

export default function SessionsHistoryPage() {
  const { data: sessions, isLoading } = useSessionsList()

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          Storico sessioni
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">Torna alla dashboard</Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Caricamento…</p>}

      {sessions?.length === 0 && (
        <p className="text-muted-foreground text-sm">Nessuna sessione ancora creata.</p>
      )}

      <div className="flex flex-col gap-3">
        {sessions?.map((s) => (
          <Link key={s.id} to={`/sessions/${s.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {s.total_puzzles} puzzle — giro {s.current_round}/3
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Creata il {new Date(s.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <Badge variant={statusVariant[s.status]}>{statusLabel[s.status]}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
