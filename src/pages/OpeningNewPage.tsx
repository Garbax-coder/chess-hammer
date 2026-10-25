import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OpeningColorToggle } from '@/components/opening-import-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateRepertoire } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import type { OpeningColor } from '@/lib/opening-catalog'

// Un repertorio personale vuoto: nome e colore, poi si apre la consultazione
// in modifica, dove si costruisce mossa per mossa.
export default function OpeningNewPage() {
  const o = useOpeningsTranslations()
  const navigate = useNavigate()
  const createRepertoire = useCreateRepertoire()
  const [name, setName] = useState('')
  const [color, setColor] = useState<OpeningColor>('w')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    createRepertoire.mutate(
      { name: name.trim(), color },
      { onSuccess: ({ slug }) => navigate(`/openings/${slug}/lines?edit=1`) },
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {o.scratchTitle}
        </h1>
        <p className="text-muted-foreground text-sm">{o.scratchIntro}</p>
        <Link
          to="/openings"
          className="text-primary w-fit text-sm underline-offset-4 hover:underline"
        >
          {o.back}
        </Link>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="repertoire-name">{o.nameLabel}</Label>
            <Input
              id="repertoire-name"
              value={name}
              maxLength={100}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <OpeningColorToggle color={color} onChange={setColor} />
        </div>
        {createRepertoire.isError && (
          <p className="text-destructive text-sm">
            {o.importError}: {createRepertoire.error.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-fit"
          disabled={!name.trim()}
          loading={createRepertoire.isPending}
        >
          {o.scratchCreate}
        </Button>
      </form>
    </main>
  )
}
