import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useDeleteRepertoire,
  useOpeningProgress,
  useRepertoires,
} from '@/hooks/use-openings'
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
  const deleteRepertoire = useDeleteRepertoire()
  // Il repertorio personale in attesa di conferma per la cancellazione.
  const [confirming, setConfirming] = useState<string | null>(null)
  const now = new Date()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight">
          {o.title}
          <Badge variant="outline">{o.draftBadge}</Badge>
        </h1>
        <p className="text-muted-foreground text-sm">{o.subtitle}</p>
        <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
          <Link to="/openings/import">{o.importPgn}</Link>
        </Button>
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
                    <span className="flex items-baseline gap-2">
                      {o.names[repertoire.slug] ?? repertoire.name}
                      {repertoire.owner_id && (
                        <Badge variant="secondary">{o.personal}</Badge>
                      )}
                    </span>
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
                  <div className="flex flex-wrap gap-2">
                    {/* Sempre disponibile; in evidenza finche' ci sono mosse mai viste. */}
                    <Button
                      asChild
                      variant={coverage.userMoves > coverage.seen ? 'default' : 'outline'}
                    >
                      <Link to={`/openings/${repertoire.slug}/learn`}>{o.learn}</Link>
                    </Button>
                    <Button
                      asChild
                      variant={coverage.userMoves > coverage.seen ? 'outline' : 'default'}
                    >
                      <Link to={`/openings/${repertoire.slug}`}>{o.train}</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={`/openings/${repertoire.slug}/lines`}>{o.browse}</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={`/openings/${repertoire.slug}/cycles`}>{o.cycles}</Link>
                    </Button>
                    {repertoire.owner_id &&
                      (confirming === repertoire.id ? (
                        <Button
                          variant="destructive"
                          loading={deleteRepertoire.isPending}
                          onClick={() => deleteRepertoire.mutate(repertoire.id)}
                        >
                          {o.confirmDelete}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => setConfirming(repertoire.id)}
                        >
                          {o.deleteRepertoire}
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
