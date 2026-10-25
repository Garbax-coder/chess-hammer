import { Pencil } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRenameRepertoire } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import type { OpeningRepertoire } from '@/lib/openings'

export type OpeningMode = 'learn' | 'train' | 'lines' | 'cycles'

/**
 * Titolo di una pagina di un repertorio e link alle altre modalita' (studio,
 * allenamento, consultazione, cicli), senza quella in cui si e'. Un
 * repertorio personale si rinomina dalla matita accanto al nome.
 */
export function OpeningPageHeader({
  repertoire,
  mode,
  title,
  subtitle,
}: {
  repertoire: OpeningRepertoire
  mode: OpeningMode
  /** Accanto al nome del repertorio (es. "Studio"). */
  title?: string
  subtitle?: ReactNode
}) {
  const o = useOpeningsTranslations()
  const base = `/openings/${repertoire.slug}`
  const links: { mode: OpeningMode; to: string; label: string }[] = [
    { mode: 'learn', to: `${base}/learn`, label: o.learn },
    { mode: 'train', to: base, label: o.train },
    { mode: 'lines', to: `${base}/lines`, label: o.browse },
    { mode: 'cycles', to: `${base}/cycles`, label: o.cycles },
  ]
  const name = o.names[repertoire.slug] ?? repertoire.name
  const rename = useRenameRepertoire()
  const [draft, setDraft] = useState<string | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const next = draft?.trim()
    if (!next || next === repertoire.name) {
      setDraft(null)
      return
    }
    rename.mutate(
      { repertoireId: repertoire.id, name: next },
      { onSuccess: () => setDraft(null) },
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {draft !== null ? (
        <form onSubmit={submit} className="flex items-center gap-1.5">
          <Input
            aria-label={o.rename}
            value={draft}
            maxLength={100}
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setDraft(null)}
            className="h-8"
          />
          <Button type="submit" size="sm" loading={rename.isPending}>
            {o.renameSave}
          </Button>
        </form>
      ) : (
        <h1 className="text-foreground flex items-center gap-1.5 text-base font-semibold tracking-tight">
          {title ? `${name} · ${title}` : name}
          {repertoire.owner_id && (
            <button
              type="button"
              aria-label={o.rename}
              title={o.rename}
              onClick={() => setDraft(repertoire.name)}
              className="text-muted-foreground hover:text-foreground rounded p-0.5"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </h1>
      )}
      {rename.isError && <p className="text-destructive text-xs">{o.editError}</p>}
      {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
        <Link to="/openings" className="text-primary underline-offset-4 hover:underline">
          {o.back}
        </Link>
        {links
          .filter((link) => link.mode !== mode)
          .map((link) => (
            <Link
              key={link.mode}
              to={link.to}
              className="text-primary underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
      </div>
    </div>
  )
}
