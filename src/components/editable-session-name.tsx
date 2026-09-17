import { Pencil } from 'lucide-react'
import { useRef, useState } from 'react'
import { useRenameTrainingSession } from '@/hooks/use-active-session'
import { useTranslations } from '@/lib/language-context'
import type { TrainingSession } from '@/types/training'

/**
 * Nome sessione mostrato/modificabile ovunque un titolo di sessione compare
 * (dashboard, storico, dettaglio, allenamento in corso): un solo componente
 * cosi' il comportamento di modifica resta identico in tutti i punti.
 * Va dentro un contenitore non interattivo (mai un altro <button>/<a>): il
 * bottone matita qui dentro spezzerebbe le regole HTML se annidato in un
 * elemento gia' cliccabile.
 */
export function EditableSessionName({
  session,
  fallback,
}: {
  session: TrainingSession
  fallback: string
}) {
  const t = useTranslations()
  const rename = useRenameTrainingSession()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(session.name ?? '')
  // Evita che l'Escape (che chiude senza salvare) faccia comunque scattare
  // il salvataggio via onBlur quando l'input, chiudendosi, perde il focus.
  const cancellingRef = useRef(false)

  function startEditing() {
    setDraft(session.name ?? '')
    setEditing(true)
  }

  async function save() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed !== (session.name ?? '')) {
      await rename.mutateAsync({ sessionId: session.id, name: trimmed })
    }
  }

  function handleBlur() {
    if (cancellingRef.current) {
      cancellingRef.current = false
      return
    }
    void save()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void save()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancellingRef.current = true
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        aria-label={t.common.sessionNameLabel}
        value={draft}
        maxLength={80}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="border-input bg-background text-foreground w-full max-w-56 rounded-md border px-1.5 py-0.5 text-sm"
      />
    )
  }

  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1.5">
      <span className="truncate">{session.name || fallback}</span>
      {/* Sempre visibile (non solo all'hover): su touch non esiste hover,
          e questo pulsante deve restare individuabile anche li'. */}
      <button
        type="button"
        onClick={startEditing}
        aria-label={t.common.rename}
        title={t.common.rename}
        className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
      >
        <Pencil className="size-3.5" />
      </button>
    </span>
  )
}
