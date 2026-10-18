import { ArrowLeft, Eye } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EloLineChart } from '@/components/elo-history-chart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminSessionPuzzles, useAdminUserDetail } from '@/hooks/use-admin'
import type { AdminSession, AdminUserDetail } from '@/lib/admin'
import { useAdminTranslations } from '@/lib/i18n/admin'
import { useTranslations } from '@/lib/language-context'
import { sessionStatusVariant } from '@/lib/session-status'

// Scheda di un utente in sola lettura: gli stessi dati che vede lui
// (statistiche, sessioni coi loro puzzle, pratica libera, preferenze), senza
// nessun comando che li modifichi.
export default function AdminUserPage() {
  const { id } = useParams<{ id: string }>()
  const a = useAdminTranslations()
  const { data, isLoading, isError } = useAdminUserDetail(id)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        to="/admin"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        {a.user.back}
      </Link>

      {isLoading && <div className="h-64" />}
      {isError && <p className="text-destructive text-sm">{a.user.notFound}</p>}
      {data && <UserDetail detail={data} />}
    </main>
  )
}

function useFormatters() {
  const t = useTranslations()
  const a = useAdminTranslations()
  return {
    dateTime: (iso: string | null) =>
      iso
        ? new Date(iso).toLocaleString(t.meta.locale, {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : a.users.never,
    date: (iso: string) => new Date(iso).toLocaleDateString(t.meta.locale),
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground text-sm break-words">{children}</dd>
    </div>
  )
}

function UserDetail({ detail }: { detail: AdminUserDetail }) {
  const a = useAdminTranslations()
  const f = useFormatters()
  const { account, stats, sessions, elo_history, practice } = detail
  const yesNo = (v: boolean) => (v ? a.user.yes : a.user.no)

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-lg font-semibold tracking-tight break-all">
          {account.email}
        </h1>
        <p className="bg-muted/60 text-muted-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm">
          <Eye className="size-4 shrink-0" />
          {a.user.readOnly(account.email)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{a.user.account}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={a.user.providers}>
              {account.providers.join(', ') || a.user.none}
            </Field>
            <Field label={a.users.registered}>{f.dateTime(account.created_at)}</Field>
            <Field label={a.user.confirmed}>
              {account.email_confirmed_at
                ? f.dateTime(account.email_confirmed_at)
                : a.users.unconfirmed}
            </Field>
            <Field label={a.users.lastLogin}>{f.dateTime(account.last_sign_in_at)}</Field>
            <Field label={a.users.lastActivity}>
              {f.dateTime(account.last_activity_at)}
            </Field>
            <Field label={a.users.admin}>{yesNo(account.is_admin)}</Field>
          </dl>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>{a.user.stats}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={a.users.elo}>
                {a.user.rating(stats.current_elo, stats.rating_deviation)}
              </Field>
              <Field label={a.user.puzzle}>
                {a.user.solvedFailed(stats.puzzles_solved, stats.puzzles_failed)}
              </Field>
            </dl>
            <div className="flex flex-col gap-2">
              <h3 className="text-muted-foreground text-xs">{a.user.eloHistory}</h3>
              {elo_history.length === 0 ? (
                <p className="text-muted-foreground text-sm">{a.user.eloEmpty}</p>
              ) : (
                <EloLineChart data={elo_history} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{a.user.sessions}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sessions.length === 0 && (
            <p className="text-muted-foreground text-sm">{a.user.sessionsEmpty}</p>
          )}
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{a.user.practice}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {practice.attempted === 0 ? (
            <p className="text-muted-foreground text-sm">{a.user.practiceEmpty}</p>
          ) : (
            <>
              <p className="text-foreground text-sm">
                {a.user.practiceSummary(practice.attempted, practice.solved)}
              </p>
              <h3 className="text-muted-foreground text-xs">{a.user.recentPractice}</h3>
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground text-xs">
                    <tr className="border-b">
                      <th className="px-2 py-1.5 font-medium">{a.user.when}</th>
                      <th className="px-2 py-1.5 font-medium">{a.user.puzzle}</th>
                      <th className="px-2 py-1.5 font-medium">{a.user.result}</th>
                      <th className="px-2 py-1.5 text-right font-medium">
                        {a.user.time}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {practice.recent.map((p, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="text-muted-foreground px-2 py-1.5 whitespace-nowrap tabular-nums">
                          {f.dateTime(p.attempted_at)}
                        </td>
                        <td className="px-2 py-1.5">
                          <PuzzleLink puzzleId={p.puzzle_id} />
                        </td>
                        <td className="px-2 py-1.5">
                          <ResultBadge result={p.result} />
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {a.user.seconds(p.time_seconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>{a.user.preferences}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={a.user.language}>{stats.language ?? a.user.none}</Field>
              <Field label={a.user.appStyle}>{stats.app_style}</Field>
              <Field label={a.user.boardTheme}>{stats.board_theme}</Field>
              <Field label={a.user.pieceSet}>{stats.piece_set}</Field>
              <Field label={a.user.autoAdvance}>{yesNo(stats.auto_advance)}</Field>
              <Field label={a.user.practiceFilter}>
                {stats.practice_only_failed
                  ? a.user.practiceOnlyFailed(stats.practice_failed_scope)
                  : a.user.practiceAll}
              </Field>
              <Field label={a.user.legalVersion}>
                {stats.legal_version
                  ? `${stats.legal_version}${stats.legal_accepted_at ? ` · ${f.date(stats.legal_accepted_at)}` : ''}`
                  : a.user.none}
              </Field>
              <Field label="ID">
                <span className="text-muted-foreground font-mono text-xs">
                  {account.id}
                </span>
              </Field>
            </dl>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function PuzzleLink({ puzzleId }: { puzzleId: string }) {
  return (
    <a
      href={`https://lichess.org/training/${puzzleId}`}
      target="_blank"
      rel="noreferrer"
      className="text-primary font-mono text-xs hover:underline"
    >
      {puzzleId}
    </a>
  )
}

function ResultBadge({ result }: { result: 'solved' | 'failed' }) {
  const a = useAdminTranslations()
  return result === 'solved' ? (
    <Badge variant="secondary">{a.user.solved}</Badge>
  ) : (
    <Badge variant="destructive">{a.user.failed}</Badge>
  )
}

function SessionRow({ session }: { session: AdminSession }) {
  const a = useAdminTranslations()
  const t = useTranslations()
  const f = useFormatters()
  const [open, setOpen] = useState(false)
  const [now] = useState(() => Date.now())
  const restingUntil =
    session.resting_until && Date.parse(session.resting_until) > now
      ? session.resting_until
      : null

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-foreground text-sm font-medium">
            {session.name || a.user.unnamedSession(session.total_puzzles)}
          </p>
          <p className="text-muted-foreground text-xs">
            {a.user.createdOn(f.date(session.created_at))}
            {session.completed_at &&
              ` · ${a.user.completedOn(f.date(session.completed_at))}`}
            {restingUntil && ` · ${a.user.restingUntil(f.date(restingUntil))}`}
          </p>
        </div>
        <Badge variant={sessionStatusVariant[session.status]}>
          {t.sessionStatus[session.status]}
        </Badge>
      </div>
      <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs tabular-nums">
        {session.rounds.map((r) => (
          <li key={r.round}>
            {a.user.roundProgress(
              r.round,
              r.attempted,
              r.round === 1 ? session.total_puzzles : session.pool_size,
              r.solved,
            )}
          </li>
        ))}
      </ul>
      {session.pool_size > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? a.user.hidePuzzles : a.user.showPuzzles}
        </Button>
      )}
      {open && <SessionPuzzlesTable sessionId={session.id} />}
    </div>
  )
}

function SessionPuzzlesTable({ sessionId }: { sessionId: string }) {
  const a = useAdminTranslations()
  const t = useTranslations()
  const { data, isLoading, isError } = useAdminSessionPuzzles(sessionId, true)

  if (isLoading)
    return <p className="text-muted-foreground text-sm">{t.common.loading}</p>
  if (isError || !data) return <p className="text-destructive text-sm">{a.error}</p>

  return (
    <div className="-mx-1 max-h-96 overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground bg-card sticky top-0 text-xs">
          <tr className="border-b">
            <th className="px-1 py-1.5 font-medium">#</th>
            <th className="px-1 py-1.5 font-medium">{a.user.puzzle}</th>
            <th className="px-1 py-1.5 text-right font-medium">{a.user.rating_}</th>
            {([1, 2, 3] as const).map((r) => (
              <th key={r} className="px-1 py-1.5 font-medium">
                {a.user.round(r)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.session_puzzle_id} className="border-b last:border-0">
              <td className="text-muted-foreground px-1 py-1.5 tabular-nums">
                {p.order_index}
              </td>
              <td className="px-1 py-1.5">
                <PuzzleLink puzzleId={p.puzzle_id} />
              </td>
              <td className="px-1 py-1.5 text-right tabular-nums">{p.rating ?? '—'}</td>
              {([1, 2, 3] as const).map((r) => {
                const attempt = p.attempts.find((x) => x.round_number === r)
                return (
                  <td key={r} className="px-1 py-1.5 whitespace-nowrap">
                    {attempt ? (
                      <span className="flex items-center gap-1">
                        <ResultBadge result={attempt.result} />
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {a.user.seconds(attempt.time_seconds)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
