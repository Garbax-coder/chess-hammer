import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { useSoundEnabled } from '@/hooks/use-sound-enabled'
import { useUpdateAutoAdvance, useUserStats } from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'

/**
 * Preferenze della risoluzione (avanzamento automatico, suoni) in un piccolo
 * menu: si impostano una volta e poi non si toccano, quindi non occupano
 * spazio fisso nella colonna della lista dei puzzle.
 */
export function PracticeSettingsMenu() {
  const t = useTranslations()
  const { data: stats } = useUserStats()
  const updateAutoAdvance = useUpdateAutoAdvance()
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundEnabled()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t.train.settings}
        >
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-56 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-advance"
            checked={stats?.auto_advance ?? true}
            onCheckedChange={(checked) => updateAutoAdvance.mutate(checked)}
          />
          <Label htmlFor="auto-advance" className="text-sm">
            {t.train.autoAdvance}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
          <Label htmlFor="sound-enabled" className="text-sm">
            {t.train.soundEnabled}
          </Label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
