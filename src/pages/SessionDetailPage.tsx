import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSessionDetail } from '@/hooks/use-session-history'
import type { PuzzleAttempt } from '@/types/training'

function AttemptCell({ attempt }: { attempt: PuzzleAttempt | undefined }) {
  if (!attempt) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={attempt.result === 'solved' ? 'secondary' : 'outline'}>
        {attempt.result === 'solved' ? 'Risolto' : 'Fallito'}
      </Badge>
      <span className="text-muted-foreground text-xs">{attempt.time_seconds}s</span>
    </div>
  )
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useSessionDetail(id)

  if (isLoading || !data) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Caricamento…</p>
      </main>
    )
  }

  const { session, puzzles } = data

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            Sessione del {new Date(session.created_at).toLocaleDateString('it-IT')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {session.total_puzzles} puzzle · giro {session.current_round}/3 ·{' '}
            {session.status}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/sessions">Storico</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Giro 1</TableHead>
              <TableHead>Giro 2</TableHead>
              <TableHead>Giro 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {puzzles.map((p) => (
              <TableRow key={p.puzzleId}>
                <TableCell className="text-muted-foreground">{p.orderIndex}</TableCell>
                <TableCell>{p.rating}</TableCell>
                <TableCell>
                  <AttemptCell attempt={p.attempts[1]} />
                </TableCell>
                <TableCell>
                  <AttemptCell attempt={p.attempts[2]} />
                </TableCell>
                <TableCell>
                  <AttemptCell attempt={p.attempts[3]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {puzzles.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Nessun puzzle ancora nel pool di questa sessione.
        </p>
      )}
    </main>
  )
}
