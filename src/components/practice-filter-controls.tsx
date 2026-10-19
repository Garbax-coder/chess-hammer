import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { useUpdatePracticeFilter } from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'
import type { PracticeFilter } from '@/lib/session-progress'

/**
 * Su quali puzzle si esercita la pratica libera: i falliti (in qualunque giro
 * o solo nell'ultimo), i problematici salvati, entrambi, o (nessuno dei due)
 * tutti. Stesso controllo in allenamento e nel dettaglio di una sessione.
 */
export function PracticeFilterControls({
  filter,
  update,
  showNoSavedHint = false,
}: {
  filter: PracticeFilter
  update: ReturnType<typeof useUpdatePracticeFilter>['mutate']
  // Solo "problematici" attivo ma nessuno salvato in questa sessione.
  showNoSavedHint?: boolean
}) {
  const t = useTranslations()

  return (
    <div className="flex flex-col gap-2 pl-1">
      <span className="text-muted-foreground text-xs">{t.train.practiceOnlyTitle}</span>
      <div className="flex items-center gap-2">
        <Switch
          id="only-failed-practice"
          checked={filter.onlyFailed}
          onCheckedChange={(checked) => update({ practice_only_failed: checked })}
        />
        <Label htmlFor="only-failed-practice" className="text-muted-foreground text-sm">
          {t.train.failedPuzzles}
        </Label>
      </div>

      {filter.onlyFailed && (
        <div className="flex gap-1 pl-9">
          {(['all', 'lastRound'] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => update({ practice_failed_scope: scope })}
              aria-pressed={filter.scope === scope}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filter.scope === scope
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {scope === 'all' ? t.train.failedScopeAll : t.train.failedScopeLastRound}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="only-saved-practice"
          checked={filter.onlySaved ?? false}
          onCheckedChange={(checked) => update({ practice_only_saved: checked })}
        />
        <Label htmlFor="only-saved-practice" className="text-muted-foreground text-sm">
          {t.train.savedPuzzles}
        </Label>
      </div>
      {showNoSavedHint && (
        <p className="text-muted-foreground pl-9 text-xs">{t.train.noSavedPuzzles}</p>
      )}
    </div>
  )
}
