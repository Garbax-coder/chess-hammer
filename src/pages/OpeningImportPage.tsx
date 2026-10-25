import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useImportRepertoire } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import {
  buildRepertoire,
  IllegalMoveError,
  type BuildReport,
  type OpeningColor,
} from '@/lib/opening-catalog'
import { pgnLines } from '@/lib/pgn-lines'

/** Mosse al massimo in un repertorio importato (come import_opening_repertoire). */
export const MAX_IMPORT_MOVES = 3000

interface Preview {
  report?: BuildReport
  lines: number
  skipped: number
  suggestedName: string
  /** La prima mossa illegale trovata. */
  illegal?: { line: number; move: string }
  error?: string
}

/**
 * Il PGN letto e trasformato in repertorio, come verra' importato: errori
 * (mossa illegale) e aggiustamenti (mosse dell'avversario in fondo,
 * alternative) si vedono prima di importare.
 */
export function previewImport(pgn: string, color: OpeningColor): Preview {
  const parsed = pgnLines(pgn)
  const suggestedName = parsed.headers.Opening || parsed.headers.Event || ''
  const base = { lines: 0, skipped: parsed.skipped, suggestedName }
  if (parsed.lines.length === 0) return base
  try {
    const report = buildRepertoire(
      { slug: 'import', name: '', eco: null, color, source: null, lines: parsed.lines },
      { lenient: true },
    )
    const parents = new Set(report.nodes.map((n) => n.parentPath))
    const lines = report.nodes.filter((n) => n.isMain && !parents.has(n.path)).length
    return { ...base, report, lines }
  } catch (error) {
    if (error instanceof IllegalMoveError) {
      const number = Math.ceil(error.ply / 2)
      const move = `${number}${error.ply % 2 === 1 ? '.' : '...'}${error.san}`
      return { ...base, illegal: { line: error.line, move } }
    }
    return { ...base, error: error instanceof Error ? error.message : String(error) }
  }
}

// Import di un repertorio personale da PGN: si incolla il testo (o si carica
// un file), si sceglie il colore, l'anteprima dice cosa diventera' e
// l'import porta allo studio del repertorio nuovo.
export default function OpeningImportPage() {
  const o = useOpeningsTranslations()
  const navigate = useNavigate()
  const importRepertoire = useImportRepertoire()
  const [pgn, setPgn] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState<OpeningColor>('w')
  const preview = useMemo(() => previewImport(pgn, color), [pgn, color])
  const nodes = preview.report?.nodes ?? []
  const tooBig = nodes.length > MAX_IMPORT_MOVES
  const canImport = preview.lines > 0 && !preview.error && !preview.illegal && !tooBig

  async function loadFile(file: File | undefined) {
    if (file) setPgn(await file.text())
  }

  function submit() {
    if (!canImport) return
    importRepertoire.mutate(
      { name: name.trim() || preview.suggestedName || o.importTitle, color, nodes },
      { onSuccess: ({ slug }) => navigate(`/openings/${slug}/learn`) },
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {o.importTitle}
        </h1>
        <p className="text-muted-foreground text-sm">{o.importIntro}</p>
        <Link
          to="/openings"
          className="text-primary w-fit text-sm underline-offset-4 hover:underline"
        >
          {o.back}
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pgn">{o.pgnLabel}</Label>
          <textarea
            id="pgn"
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            placeholder={o.pgnPlaceholder}
            rows={10}
            spellCheck={false}
            className="border-input bg-background focus-visible:ring-ring/50 min-h-40 w-full rounded-md border px-3 py-2 font-mono text-xs outline-none focus-visible:ring-3"
          />
          <Label htmlFor="pgn-file" className="text-muted-foreground text-xs font-normal">
            {o.fileLabel}
          </Label>
          <input
            id="pgn-file"
            type="file"
            accept=".pgn,text/plain"
            onChange={(e) => loadFile(e.target.files?.[0])}
            className="text-muted-foreground text-xs"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="repertoire-name">{o.nameLabel}</Label>
            <Input
              id="repertoire-name"
              value={name}
              maxLength={100}
              placeholder={preview.suggestedName}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{o.colorLabel}</span>
            <div className="bg-muted flex w-fit gap-1 rounded-lg p-1">
              {(['w', 'b'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
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
        </div>

        {pgn.trim() !== '' && (
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
                <p className="text-foreground">
                  {o.previewLines(preview.lines, nodes.length)}
                </p>
              )}
              {tooBig && (
                <p className="text-destructive">{o.previewTooBig(MAX_IMPORT_MOVES)}</p>
              )}
              {!!preview.report?.alternatives && (
                <p className="text-muted-foreground text-xs">
                  {o.previewAlternatives(preview.report.alternatives)}
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
        )}

        {importRepertoire.isError && (
          <p className="text-destructive text-sm">
            {o.importError}: {importRepertoire.error.message}
          </p>
        )}
        <Button
          className="w-fit"
          disabled={!canImport}
          loading={importRepertoire.isPending}
          onClick={submit}
        >
          {o.importButton}
        </Button>
      </div>
    </main>
  )
}
