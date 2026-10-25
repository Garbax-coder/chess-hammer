import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  OpeningColorToggle,
  OpeningImportPreview,
} from '@/components/opening-import-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useImportRepertoire } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import type { OpeningColor } from '@/lib/opening-catalog'
import { canCreateFrom, previewImport } from '@/lib/opening-import'

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
  const canImport = canCreateFrom(preview)

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
          <OpeningColorToggle color={color} onChange={setColor} />
        </div>

        {pgn.trim() !== '' && <OpeningImportPreview preview={preview} />}

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
