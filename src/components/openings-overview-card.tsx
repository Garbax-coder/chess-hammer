import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  useHiddenRepertoires,
  useOpeningProgress,
  useRepertoires,
} from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { buildOpeningTree, openingCoverage } from '@/lib/opening-tree'

/**
 * Le aperture in breve, per la dashboard: mosse consolidate, da ripassare e
 * nuove su tutta la libreria, e il repertorio da cui ripartire (quello con
 * piu' mosse da ripassare, altrimenti quello con piu' mosse nuove).
 */
export function OpeningsOverviewCard() {
  const o = useOpeningsTranslations()
  const { data: repertoires } = useRepertoires()
  const { data: progress } = useOpeningProgress()
  const { data: hidden } = useHiddenRepertoires()
  if (!repertoires || !progress) return null

  const now = new Date()
  const library = repertoires
    .filter((r) => !hidden?.has(r.id))
    .map((repertoire) => ({
      repertoire,
      coverage: openingCoverage(
        buildOpeningTree(repertoire.nodes),
        progress,
        repertoire.color,
        now,
      ),
    }))
  const total = library.reduce(
    (sum, { coverage }) => ({
      userMoves: sum.userMoves + coverage.userMoves,
      seen: sum.seen + coverage.seen,
      mastered: sum.mastered + coverage.mastered,
      due: sum.due + coverage.due,
      runs: sum.runs + coverage.runs,
    }),
    { userMoves: 0, seen: 0, mastered: 0, due: 0, runs: 0 },
  )
  const byDue = [...library].sort((a, b) => b.coverage.due - a.coverage.due)[0]
  const byNew = [...library].sort(
    (a, b) =>
      b.coverage.userMoves - b.coverage.seen - (a.coverage.userMoves - a.coverage.seen),
  )[0]
  const name = (r: { slug: string; name: string }) => o.names[r.slug] ?? r.name
  const next =
    byDue && byDue.coverage.due > 0
      ? {
          to: `/openings/${byDue.repertoire.slug}`,
          label: o.dashboardReview(name(byDue.repertoire)),
        }
      : byNew && byNew.coverage.userMoves > byNew.coverage.seen
        ? {
            to: `/openings/${byNew.repertoire.slug}/learn`,
            label: o.dashboardLearn(name(byNew.repertoire)),
          }
        : null

  return (
    <Card className="w-full max-w-md text-left">
      <CardHeader>
        <CardTitle>{o.dashboardTitle}</CardTitle>
        <CardDescription>
          {library.length === 0
            ? o.dashboardEmpty
            : o.dashboardSummary(library.length, total.runs)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {total.userMoves > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="text-muted-foreground flex flex-wrap justify-between gap-x-3 text-xs">
              <span>{o.mastered(total.mastered, total.userMoves)}</span>
              <span>
                {o.due(total.due)} · {o.newMoves(total.userMoves - total.seen)}
              </span>
            </div>
            <Progress value={(total.mastered / total.userMoves) * 100} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          {next && (
            <Button asChild className="w-full">
              <Link to={next.to}>{next.label}</Link>
            </Button>
          )}
          <Button asChild variant={next ? 'outline' : 'default'} className="w-full">
            <Link to="/openings">{o.dashboardOpen}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
