import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import type { OpeningColor } from '@/lib/opening-catalog'
import { MAX_IMPORT_MOVES, type Preview } from '@/lib/opening-import'

/** Bianco o Nero, per un repertorio da importare o creare. */
export function OpeningColorToggle({
  color,
  onChange,
}: {
  color: OpeningColor
  onChange: (color: OpeningColor) => void
}) {
  const o = useOpeningsTranslations()
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{o.colorLabel}</span>
      <div className="bg-muted flex w-fit gap-1 rounded-lg p-1">
        {(['w', 'b'] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={color === c}
            onClick={() => onChange(c)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              color === c
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {o.color[c]}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Cosa diventera' il repertorio: linee e mosse, oppure l'errore che ne
 * impedisce la creazione, e gli aggiustamenti fatti.
 */
export function OpeningImportPreview({ preview }: { preview: Preview }) {
  const o = useOpeningsTranslations()
  const nodes = preview.report?.nodes.length ?? 0
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm">{o.previewTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm">
        {preview.illegal ? (
          <p className="text-destructive">
            {o.illegalMove(preview.illegal.line, preview.illegal.move)}
          </p>
        ) : preview.error ? (
          <p className="text-destructive">{preview.error}</p>
        ) : preview.lines === 0 ? (
          <p className="text-muted-foreground">{o.previewEmpty}</p>
        ) : (
          <p className="text-foreground">{o.previewLines(preview.lines, nodes)}</p>
        )}
        {nodes > MAX_IMPORT_MOVES && (
          <p className="text-destructive">{o.previewTooBig(MAX_IMPORT_MOVES)}</p>
        )}
        {!!preview.report?.alternatives && (
          <p className="text-muted-foreground text-xs">
            {o.previewAlternatives(preview.report.alternatives)}
          </p>
        )}
        {!!preview.openEnds && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {o.previewOpenEnds(preview.openEnds)}
          </p>
        )}
        {!!preview.report?.mistakes && (
          <p className="text-muted-foreground text-xs">
            {o.previewMistakes(preview.report.mistakes)}
          </p>
        )}
        {!!preview.report?.trimmed && (
          <p className="text-muted-foreground text-xs">
            {o.previewTrimmed(preview.report.trimmed)}
          </p>
        )}
        {preview.skipped > 0 && (
          <p className="text-muted-foreground text-xs">
            {o.previewSkipped(preview.skipped)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
