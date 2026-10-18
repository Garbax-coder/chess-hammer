import { ExternalLink, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminMetricCard } from '@/components/admin/admin-metric-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAdminStats, useAdminUsers } from '@/hooks/use-admin'
import {
  ADMIN_METRICS,
  ADMIN_PERIODS,
  filterAndSortUsers,
  type AdminPeriod,
  type AdminUserSort,
} from '@/lib/admin'
import { useAdminTranslations } from '@/lib/i18n/admin'
import { useTranslations } from '@/lib/language-context'

const SORTS: AdminUserSort[] = ['created', 'last_sign_in']

export default function AdminPage() {
  const a = useAdminTranslations()
  const [period, setPeriod] = useState<AdminPeriod>('week')
  const stats = useAdminStats()

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {a.title}
        </h1>
        <p className="text-muted-foreground text-sm">{a.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">{a.periodLabel}</span>
        <div className="flex gap-1">
          {ADMIN_PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {a.period[p]}
            </button>
          ))}
        </div>
      </div>

      {stats.isError && <p className="text-destructive text-sm">{a.error}</p>}
      {stats.isLoading && <div className="h-64" />}
      {stats.data && (
        // Registrazioni a tutta larghezza, le altre quattro metriche due per riga.
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {ADMIN_METRICS.map((metric) => (
            <AdminMetricCard
              key={metric}
              className={metric === 'signups' ? 'lg:col-span-2' : undefined}
              stats={stats.data}
              metric={metric}
              period={period}
              total={metric === 'signups' ? stats.data.total_signups : undefined}
            />
          ))}
        </div>
      )}

      <UsersList />
    </main>
  )
}

function UsersList() {
  const t = useTranslations()
  const a = useAdminTranslations()
  const users = useAdminUsers()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<AdminUserSort>('created')
  const rows = useMemo(
    () => filterAndSortUsers(users.data ?? [], query, sort),
    [users.data, query, sort],
  )

  const formatDateTime = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(t.meta.locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : a.users.never

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex w-full items-baseline justify-between gap-2">
          <CardTitle>{a.users.title}</CardTitle>
          {users.data && (
            <span className="text-muted-foreground text-xs">
              {a.users.count(users.data.length)}
            </span>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="admin-user-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={a.users.search}
            aria-label={a.users.search}
            className="sm:max-w-xs"
          />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-xs">{a.users.sortLabel}</span>
            {SORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                aria-pressed={sort === s}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  sort === s
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {a.users.sort[s]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users.isError && <p className="text-destructive text-sm">{a.error}</p>}
        {users.isLoading && (
          <p className="text-muted-foreground text-sm">{t.common.loading}</p>
        )}
        {users.data && rows.length === 0 && (
          <p className="text-muted-foreground text-sm">{a.users.empty}</p>
        )}
        {rows.length > 0 && (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted-foreground text-xs">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">{a.users.email}</th>
                  <th className="px-2 py-2 font-medium">{a.users.registered}</th>
                  <th className="px-2 py-2 font-medium">{a.users.lastLogin}</th>
                  <th className="px-2 py-2 font-medium">{a.users.lastActivity}</th>
                  <th className="px-2 py-2 text-right font-medium">{a.users.elo}</th>
                  <th className="px-2 py-2 text-right font-medium">{a.users.sessions}</th>
                  <th className="px-2 py-2">
                    <span className="sr-only">{a.users.open}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-foreground [overflow-wrap:anywhere]">
                          {u.email}
                        </span>
                        {u.is_admin && (
                          <Badge variant="secondary">
                            <ShieldCheck />
                            {a.users.admin}
                          </Badge>
                        )}
                        {!u.email_confirmed_at && (
                          <Badge variant="outline">{a.users.unconfirmed}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {u.providers.join(', ')}
                        {u.active_session_round &&
                          ` · ${a.users.activeRound(u.active_session_round)}`}
                      </p>
                    </td>
                    <td className="text-muted-foreground px-2 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(u.created_at)}
                    </td>
                    <td className="text-foreground px-2 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(u.last_sign_in_at)}
                    </td>
                    <td className="text-muted-foreground px-2 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(u.last_activity_at)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {u.current_elo ?? '—'}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {u.sessions_count}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <Link
                        to={`/admin/users/${u.id}`}
                        aria-label={`${a.users.open}: ${u.email}`}
                        title={a.users.open}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-7 items-center justify-center rounded-md transition-colors"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
