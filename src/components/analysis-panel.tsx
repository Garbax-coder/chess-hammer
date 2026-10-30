import { Settings } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { formatScore, pvToSan } from '@/lib/chess-format'
import type { EngineSettings } from '@/lib/engine-settings'
import { useTranslations } from '@/lib/language-context'
import type { EngineLine } from '@/lib/stockfish-engine'

const LINE_COUNT_OPTIONS = [1, 2, 3, 4, 5]
const DEPTH_OPTIONS = [10, 12, 14, 16, 18, 20, 22]

interface AnalysisPanelProps {
  fen: string
  lines: EngineLine[]
  analyzing: boolean
  settings: EngineSettings
  onUpdateSettings: (patch: Partial<EngineSettings>) => void
  /** Sostituisce la larghezza predefinita (w-full lg:w-72). */
  className?: string
  /**
   * Con onEnabledChange l'interruttore di Stockfish sta nell'intestazione,
   * sempre visibile: spento, il pannello mostra solo l'intestazione.
   */
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
}

export function AnalysisPanel({
  fen,
  lines,
  analyzing,
  settings,
  onUpdateSettings,
  className = 'w-full lg:w-72',
  enabled = true,
  onEnabledChange,
}: AnalysisPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w'
  const t = useTranslations()

  return (
    <Card size="sm" className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{t.analysisPanel.title}</CardTitle>
        <div className="flex items-center gap-1">
          {onEnabledChange && (
            <Switch
              aria-label="Stockfish"
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setDialogOpen(true)}
            aria-label={t.analysisPanel.settingsAria}
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </CardHeader>
      {enabled && (
        // Altezza fissa: una riga per ogni linea impostata e quella della
        // profondita', anche vuote, cosi' il pannello non cambia altezza
        // mentre arrivano le valutazioni.
        <CardContent className="flex flex-col gap-1.5 pt-0">
          {Array.from({ length: settings.multiPv }, (_, i) => {
            const line = lines[i]
            return (
              <div
                key={i}
                data-slot="engine-line"
                className="flex h-4 items-baseline gap-2 text-xs"
              >
                {line ? (
                  <>
                    <span className="text-foreground w-12 shrink-0 font-mono font-semibold">
                      {formatScore(line.scoreCp, line.scoreMate, sideToMove)}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {pvToSan(fen, line.pvUci)}
                    </span>
                  </>
                ) : (
                  i === 0 &&
                  lines.length === 0 && (
                    <span className="text-muted-foreground">
                      {analyzing ? t.analysisPanel.analyzing : t.analysisPanel.noAnalysis}
                    </span>
                  )
                )}
              </div>
            )
          })}
          <p className="text-muted-foreground h-4 text-[0.65rem]">
            {analyzing &&
              lines.length > 0 &&
              t.analysisPanel.depth(lines[0]?.depth ?? '…', settings.depth)}
          </p>
        </CardContent>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.analysisPanel.settingsTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="multi-pv">{t.analysisPanel.numberOfLines}</Label>
              <Select
                value={String(settings.multiPv)}
                onValueChange={(v) => onUpdateSettings({ multiPv: Number(v) })}
              >
                <SelectTrigger id="multi-pv" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINE_COUNT_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="depth">{t.analysisPanel.engineDepth}</Label>
              <Select
                value={String(settings.depth)}
                onValueChange={(v) => onUpdateSettings({ depth: Number(v) })}
              >
                <SelectTrigger id="depth" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPTH_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="best-move-arrow">{t.analysisPanel.bestMoveArrow}</Label>
              <Switch
                id="best-move-arrow"
                checked={settings.showBestMoveArrow}
                onCheckedChange={(checked) =>
                  onUpdateSettings({ showBestMoveArrow: checked })
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
