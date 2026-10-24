import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrainingStats } from '@/hooks/use-training-stats'
import { useTranslations } from '@/lib/language-context'
import { formatAverage } from '@/lib/session-stats'
import { sessionStatusVariant } from '@/lib/session-status'
import {
  MIN_THEME_ATTEMPTS,
  rankThemes,
  summarizePractice,
  summarizeTraining,
  type Kpi,
  type ThemeKpi,
  type TrainingStatsData,
} from '@/lib/training-stats'

const percent = (value: number) => `${Math.round(value)}%`

type StatsTab = 'training' | 'practice'
const TABS: StatsTab[] = ['training', 'practice']

// Statistiche dell'utente in due schede: allenamento ufficiale (totali, per
// giro, per sessione, categorie) e pratica libera (totali, per sessione,
// categorie). Tutto viene da una sola richiesta gia' aggregata
// (useTrainingStats); la scheda scelta resta nell'indirizzo (?tab=practice).
export default function StatsPage() {
  const t = useTranslations()
  const { data, isLoading } = useTrainingStats()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: StatsTab = searchParams.get('tab') === 'practice' ? 'practice' : 'training'

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.stats.title}
        </h1>
        <div
          role="tablist"
          aria-label={t.stats.title}
          className="bg-muted flex w-fit gap-1 rounded-lg p-1"
        >
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`stats-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`stats-panel-${id}`}
              onClick={() =>
                setSearchParams(id === 'training' ? {} : { tab: id }, { replace: true })
              }
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.stats.tabs[id]}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      ) : (
        <div
          role="tabpanel"
          id={`stats-panel-${tab}`}
          aria-labelledby={`stats-tab-${tab}`}
          className="flex flex-col gap-6"
        >
          {tab === 'training' ? (
            <TrainingStats data={data} />
          ) : (
            <PracticeStats data={data} />
          )}
        </div>
      )}
    </main>
  )
}

function TrainingStats({ data }: { data: TrainingStatsData }) {
  const t = useTranslations()
  const summary = summarizeTraining(data)
  const { best, worst } = rankThemes(data.themes)

  return (
    <>
      <p className="text-muted-foreground -mt-3 text-sm">{t.stats.subtitle}</p>
      {summary.overall.attempts === 0 ? (
        <p className="text-muted-foreground text-sm">{t.stats.empty}</p>
      ) : (
        <>
          <OverviewCard kpi={summary.overall} />
          <Card>
            <CardHeader>
              <CardTitle>{t.stats.byRoundTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <KpiTable
                firstColumn={t.stats.columns.round}
                rows={summary.byRound.map(({ round, kpi }) => ({
                  key: String(round),
                  label: t.dashboard.puzzlePerformance.roundLabel(round),
                  kpi,
                }))}
              />
            </CardContent>
          </Card>
          <SessionsCard rows={summary.bySession} />
          <ThemeCards best={best} worst={worst} />
        </>
      )}
    </>
  )
}

function PracticeStats({ data }: { data: TrainingStatsData }) {
  const t = useTranslations()
  const summary = summarizePractice(data)
  const { best, worst } = rankThemes(data.practice.themes)

  return (
    <>
      <p className="text-muted-foreground -mt-3 text-sm">{t.stats.practiceSubtitle}</p>
      {summary.overall.attempts === 0 ? (
        <p className="text-muted-foreground text-sm">{t.stats.practiceEmpty}</p>
      ) : (
        <>
          <OverviewCard kpi={summary.overall} />
          <SessionsCard rows={summary.bySession} />
          <ThemeCards best={best} worst={worst} />
        </>
      )}
    </>
  )
}

function OverviewCard({ kpi }: { kpi: Kpi }) {
  const t = useTranslations()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.stats.overviewTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <OverviewTiles kpi={kpi} />
      </CardContent>
    </Card>
  )
}

function SessionsCard({
  rows,
}: {
  rows: { session: TrainingStatsData['sessions'][number] | null; kpi: Kpi }[]
}) {
  const t = useTranslations()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.stats.bySessionTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <KpiTable
          firstColumn={t.stats.columns.session}
          rows={rows.map(({ session, kpi }) => ({
            key: session?.id ?? 'none',
            label: session ? (
              <div className="flex flex-col gap-0.5">
                <Link
                  to={`/sessions/${session.id}/summary`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {session.name ||
                    t.stats.sessionFallback(
                      new Date(session.created_at).toLocaleDateString(t.meta.locale),
                    )}
                </Link>
                <Badge variant={sessionStatusVariant[session.status]}>
                  {t.sessionStatus[session.status]}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">{t.stats.unassignedSession}</span>
            ),
            kpi,
          }))}
        />
      </CardContent>
    </Card>
  )
}

function ThemeCards({ best, worst }: { best: ThemeKpi[]; worst: ThemeKpi[] }) {
  const t = useTranslations()
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ThemeCard title={t.stats.bestTitle} themes={best} tone="good" />
        <ThemeCard title={t.stats.worstTitle} themes={worst} tone="bad" />
      </div>
      <p className="text-muted-foreground -mt-3 text-xs">
        {t.stats.themesNote(MIN_THEME_ATTEMPTS)}
      </p>
    </>
  )
}

function OverviewTiles({ kpi }: { kpi: Kpi }) {
  const t = useTranslations()
  const tiles: { label: string; value: string; detail?: string }[] = [
    { label: t.stats.tiles.attempts, value: String(kpi.attempts) },
    {
      label: t.stats.tiles.solved,
      value: percent(kpi.solvedRate),
      detail: String(kpi.solved),
    },
    {
      label: t.stats.tiles.failed,
      value: percent(kpi.failedRate),
      detail: String(kpi.failed),
    },
    { label: t.stats.tiles.average, value: formatAverage(kpi.averageSeconds) },
    {
      label: t.stats.tiles.averageSolved,
      value: formatAverage(kpi.averageSolvedSeconds),
    },
    {
      label: t.stats.tiles.averageFailed,
      value: formatAverage(kpi.averageFailedSeconds),
    },
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-muted/50 flex flex-col gap-0.5 rounded-md px-3 py-2"
        >
          <dt className="text-muted-foreground text-xs">{tile.label}</dt>
          <dd className="text-foreground flex items-baseline gap-1.5 text-lg font-semibold tabular-nums">
            {tile.value}
            {tile.detail && (
              <span className="text-muted-foreground text-xs font-normal">
                {tile.detail}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function KpiTable({
  firstColumn,
  rows,
}: {
  firstColumn: string
  rows: { key: string; label: React.ReactNode; kpi: Kpi }[]
}) {
  const t = useTranslations()
  const c = t.stats.columns
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="text-muted-foreground text-xs">
          <tr className="border-b">
            <th className="px-1 py-1.5 font-medium">{firstColumn}</th>
            <th className="px-1 py-1.5 text-right font-medium">{c.puzzles}</th>
            <th className="px-1 py-1.5 text-right font-medium">{c.solved}</th>
            <th className="px-1 py-1.5 text-right font-medium">{c.failed}</th>
            <th className="px-1 py-1.5 text-right font-medium">{c.average}</th>
            <th className="px-1 py-1.5 text-right font-medium">{c.averageSolved}</th>
            <th className="px-1 py-1.5 text-right font-medium">{c.averageFailed}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map(({ key, label, kpi }) => (
            <tr key={key} className="border-b align-top last:border-0">
              <th scope="row" className="px-1 py-1.5 font-medium">
                {label}
              </th>
              <td className="px-1 py-1.5 text-right">{kpi.attempts}</td>
              <td className="px-1 py-1.5 text-right">
                {kpi.solved} ({percent(kpi.solvedRate)})
              </td>
              <td className="px-1 py-1.5 text-right">
                {kpi.failed} ({percent(kpi.failedRate)})
              </td>
              <td className="px-1 py-1.5 text-right">
                {formatAverage(kpi.averageSeconds)}
              </td>
              <td className="px-1 py-1.5 text-right">
                {kpi.solved > 0 ? formatAverage(kpi.averageSolvedSeconds) : '—'}
              </td>
              <td className="px-1 py-1.5 text-right">
                {kpi.failed > 0 ? formatAverage(kpi.averageFailedSeconds) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ThemeCard({
  title,
  themes,
  tone,
}: {
  title: string
  themes: ThemeKpi[]
  tone: 'good' | 'bad'
}) {
  const t = useTranslations()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {themes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t.stats.themesEmpty(MIN_THEME_ATTEMPTS)}
          </p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {themes.map((theme) => (
              <li key={theme.theme} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-foreground">
                    {t.puzzleThemes.labels[theme.theme] ?? theme.theme}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {t.stats.themeLine(Math.round(theme.solvedRate), theme.attempts)}
                  </span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      tone === 'good' ? 'bg-emerald-500' : 'bg-destructive'
                    }`}
                    style={{ width: `${theme.solvedRate}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
