import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOpeningProgress, useRepertoires } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import { buildOpeningTree, openingCoverage } from '@/lib/opening-tree'

// Elenco dei repertori di apertura, con la copertura di ognuno: quante mosse
// dell'utente sono consolidate, quante da ripassare e quante linee sono
// padroneggiate per intero.
export default function OpeningsPage() {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: repertoires, isLoading } = useRepertoires()
  const { data: progress } = useOpeningProgress()
  const now = new Date()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight">
          {o.title}
          <Badge variant="outline">{o.draftBadge}</Badge>
        </h1>
        <p className="text-muted-foreground text-sm">{o.subtitle}</p>
      </div>

      {isLoading || !repertoires ? (
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      ) : repertoires.length === 0 ? (
        <p className="text-muted-foreground text-sm">{o.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {repertoires.map((repertoire) => {
            const coverage = openingCoverage(
              buildOpeningTree(repertoire.nodes),
              progress ?? new Map(),
              repertoire.color,
              now,
            )
            const percent =
              coverage.userMoves > 0 ? (coverage.mastered / coverage.userMoves) * 100 : 0
            return (
              <Card key={repertoire.id}>
                <CardHeader>
                  <CardTitle className="flex items-baseline justify-between gap-2">
                    <span>{o.names[repertoire.slug] ?? repertoire.name}</span>
                    {repertoire.eco && (
                      <span className="text-muted-foreground text-xs font-normal">
                        {repertoire.eco}
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {o.color[repertoire.color]} · {o.runs(coverage.runs)}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {o.mastered(coverage.mastered, coverage.userMoves)} ·{' '}
                      {o.runsMastered(coverage.runsMastered, coverage.runs)}
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {o.due(coverage.due)} ·{' '}
                      {o.newMoves(coverage.userMoves - coverage.seen)}
                    </p>
                  </div>
                  <Button asChild className="w-fit">
                    <Link to={`/openings/${repertoire.slug}`}>{o.train}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
