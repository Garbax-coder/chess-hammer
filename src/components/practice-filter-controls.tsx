import { Bookmark, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { useUpdatePracticeFilter } from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'
import type { PracticeFilter } from '@/lib/session-progress'

/**
 * Su quali puzzle si esercita la pratica libera: i falliti (in qualunque giro
 * o solo nell'ultimo), i problematici salvati, entrambi, o (nessuno dei due)
 * tutti. Pulsanti compatti nell'intestazione della lista dei puzzle, che e'
 * cio' che filtrano; stesso controllo in tutte le schermate di risoluzione.
 */
export function PracticeFilterControls({
  filter,
  update,
  showNoSavedHint = false,
}: {
  filter: PracticeFilter
  update: ReturnType<typeof useUpdatePracticeFilter>['mutate']
  // Solo "problematici" attivo ma nessuno salvato in questa lista.
  showNoSavedHint?: boolean
}) {
  const t = useTranslations()
  const onlySaved = filter.onlySaved ?? false

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs">{t.train.practiceOnlyTitle}</span>
      <div className="flex flex-wrap gap-1">
        <FilterToggle
          pressed={filter.onlyFailed}
          onClick={() => update({ practice_only_failed: !filter.onlyFailed })}
          icon={<X className="size-3" />}
        >
          {t.train.failedPuzzles}
        </FilterToggle>
        <FilterToggle
          pressed={onlySaved}
          onClick={() => update({ practice_only_saved: !onlySaved })}
          icon={<Bookmark className="size-3" />}
        >
          {t.train.savedPuzzles}
        </FilterToggle>
      </div>

      {filter.onlyFailed && (
        <div className="bg-muted/60 flex w-fit gap-0.5 rounded-md p-0.5">
          {(['all', 'lastRound'] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => update({ practice_failed_scope: scope })}
              aria-pressed={filter.scope === scope}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                filter.scope === scope
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {scope === 'all' ? t.train.failedScopeAll : t.train.failedScopeLastRound}
            </button>
          ))}
        </div>
      )}

      {showNoSavedHint && (
        <p className="text-muted-foreground text-xs">{t.train.noSavedPuzzles}</p>
      )}
    </div>
  )
}

function FilterToggle({
  pressed,
  onClick,
  icon,
  children,
}: {
  pressed: boolean
  onClick: () => void
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors ${
        pressed
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
