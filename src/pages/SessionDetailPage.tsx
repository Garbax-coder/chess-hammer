import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSessionDetail } from '@/hooks/use-session-history'
import { useTranslations } from '@/lib/language-context'
import type { PuzzleAttempt } from '@/types/training'
import type { Translations } from '@/lib/i18n/translations'

function AttemptCell({
  attempt,
  t,
}: {
  attempt: PuzzleAttempt | undefined
  t: Translations
}) {
  if (!attempt) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={attempt.result === 'solved' ? 'secondary' : 'destructive'}>
        {attempt.result === 'solved' ? t.sessionDetail.solved : t.sessionDetail.failed}
      </Badge>
      <span className="text-muted-foreground text-xs">{attempt.time_seconds}s</span>
    </div>
  )
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations()
  const { data, isLoading } = useSessionDetail(id)

  if (isLoading || !data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }

  const { session, puzzles } = data

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
      <div>
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.sessionDetail.title(new Date(session.created_at).toLocaleDateString(t.meta.locale))}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t.sessionDetail.subtitle(
            session.total_puzzles,
            session.current_round,
            t.sessionStatus[session.status],
          )}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">{t.sessionDetail.columnNumber}</TableHead>
              <TableHead>{t.sessionDetail.columnRating}</TableHead>
              <TableHead>{t.sessionDetail.columnRound(1)}</TableHead>
              <TableHead>{t.sessionDetail.columnRound(2)}</TableHead>
              <TableHead>{t.sessionDetail.columnRound(3)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {puzzles.map((p) => (
              <TableRow key={p.puzzleId}>
                <TableCell className="text-muted-foreground">{p.orderIndex}</TableCell>
                <TableCell>{p.rating}</TableCell>
                <TableCell>
                  <AttemptCell attempt={p.attempts[1]} t={t} />
                </TableCell>
                <TableCell>
                  <AttemptCell attempt={p.attempts[2]} t={t} />
                </TableCell>
                <TableCell>
                  <AttemptCell attempt={p.attempts[3]} t={t} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {puzzles.length === 0 && (
        <p className="text-muted-foreground text-sm">{t.sessionDetail.empty}</p>
      )}
    </main>
  )
}
