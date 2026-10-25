import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  OpeningColorToggle,
  OpeningImportPreview,
} from '@/components/opening-import-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useEcoLines, useImportRepertoire } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import type { OpeningColor } from '@/lib/opening-catalog'
import {
  ecoChoiceLines,
  ecoChoices,
  searchEcoChoices,
  type EcoChoice,
} from '@/lib/opening-eco'
import { canCreateFrom, previewLines } from '@/lib/opening-import'

// Un repertorio personale da un codice ECO o dal nome di un'apertura: si
// cerca, si sceglie, l'anteprima dice cosa diventera' e la creazione porta
// alla consultazione, dove le linee si modificano.
export default function OpeningEcoPage() {
  const o = useOpeningsTranslations()
  const navigate = useNavigate()
  const { data: ecoLines, isLoading } = useEcoLines()
  const importRepertoire = useImportRepertoire()
  const [query, setQuery] = useState('')
  const [choice, setChoice] = useState<EcoChoice | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<OpeningColor>('w')
  const [branches, setBranches] = useState(true)
  const [keepOpponentEnds, setKeepOpponentEnds] = useState(false)

  const choices = useMemo(() => (ecoLines ? ecoChoices(ecoLines) : []), [ecoLines])
  const results = useMemo(() => searchEcoChoices(choices, query), [choices, query])
  const preview = useMemo(
    () =>
      choice && ecoLines
        ? previewLines(ecoChoiceLines(ecoLines, choice), color, {
            branches,
            keepOpponentEnds,
          })
        : null,
    [choice, ecoLines, color, branches, keepOpponentEnds],
  )
  const suggestedName = choice
    ? choice.kind === 'eco'
      ? `${choice.key} · ${choice.detail}`
      : choice.key
    : ''

  function submit() {
    if (!preview || !canCreateFrom(preview)) return
    importRepertoire.mutate(
      {
        name: (name.trim() || suggestedName).slice(0, 100),
        color,
        nodes: preview.report!.nodes,
      },
      { onSuccess: ({ slug }) => navigate(`/openings/${slug}/lines`) },
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {o.ecoTitle}
        </h1>
        <p className="text-muted-foreground text-sm">{o.ecoIntro}</p>
        <Link
          to="/openings"
          className="text-primary w-fit text-sm underline-offset-4 hover:underline"
        >
          {o.back}
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {choice ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <ChoiceText choice={choice} />
            <Button variant="outline" size="sm" onClick={() => setChoice(null)}>
              {o.ecoChange}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eco-search">{o.ecoSearchLabel}</Label>
            <Input
              id="eco-search"
              value={query}
              autoFocus
              placeholder={o.ecoSearchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading ? (
              <p className="text-muted-foreground text-sm">{o.ecoLoading}</p>
            ) : (
              query.trim() !== '' &&
              (results.length === 0 ? (
                <p className="text-muted-foreground text-sm">{o.ecoNoResults}</p>
              ) : (
                <ul className="flex flex-col">
                  {results.map((result) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setChoice(result)
                          setName('')
                        }}
                        className="hover:bg-muted focus-visible:ring-ring/50 w-full rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-3"
                      >
                        <ChoiceText choice={result} />
                      </button>
                    </li>
                  ))}
                </ul>
              ))
            )}
          </div>
        )}

        {choice && preview && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="repertoire-name">{o.nameLabel}</Label>
                <Input
                  id="repertoire-name"
                  value={name}
                  maxLength={100}
                  placeholder={suggestedName}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <OpeningColorToggle color={color} onChange={setColor} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="eco-branches"
                  checked={branches}
                  onCheckedChange={setBranches}
                />
                <Label htmlFor="eco-branches">{o.ecoBranches}</Label>
              </div>
              <p className="text-muted-foreground text-xs">{o.ecoBranchesHint}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="eco-opponent-ends"
                  checked={keepOpponentEnds}
                  onCheckedChange={setKeepOpponentEnds}
                />
                <Label htmlFor="eco-opponent-ends">{o.ecoOpponentEnds}</Label>
              </div>
              <p className="text-muted-foreground text-xs">{o.ecoOpponentEndsHint}</p>
            </div>
            <OpeningImportPreview preview={preview} />
            {importRepertoire.isError && (
              <p className="text-destructive text-sm">
                {o.importError}: {importRepertoire.error.message}
              </p>
            )}
            <Button
              className="w-fit"
              disabled={!canCreateFrom(preview)}
              loading={importRepertoire.isPending}
              onClick={submit}
            >
              {o.ecoCreate}
            </Button>
          </>
        )}
        <p className="text-muted-foreground text-xs">{o.ecoCredit}</p>
      </div>
    </main>
  )
}

/** Una scelta: codice o nome, poi il dettaglio e quante varianti. */
function ChoiceText({ choice }: { choice: EcoChoice }) {
  const o = useOpeningsTranslations()
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
      <span className="text-foreground font-medium">{choice.key}</span>
      <span className="text-muted-foreground text-xs">{choice.detail}</span>
      <span className="text-muted-foreground text-xs">· {o.ecoLines(choice.lines)}</span>
    </span>
  )
}
