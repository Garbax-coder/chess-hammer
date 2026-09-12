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
import type { EngineLine } from '@/lib/stockfish-engine'

const LINE_COUNT_OPTIONS = [1, 2, 3, 4, 5]
const DEPTH_OPTIONS = [10, 12, 14, 16, 18, 20, 22]

interface AnalysisPanelProps {
  fen: string
  lines: EngineLine[]
  analyzing: boolean
  settings: EngineSettings
  onUpdateSettings: (patch: Partial<EngineSettings>) => void
}

export function AnalysisPanel({
  fen,
  lines,
  analyzing,
  settings,
  onUpdateSettings,
}: AnalysisPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w'

  return (
    <Card className="w-full lg:w-72">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
        <CardTitle className="text-sm">Analisi motore</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setDialogOpen(true)}
          aria-label="Impostazioni analisi"
        >
          <Settings className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 pt-0">
        {lines.length === 0 && (
          <p className="text-muted-foreground text-xs">
            {analyzing ? 'Analisi in corso…' : 'Nessuna analisi disponibile.'}
          </p>
        )}
        {lines.map((line) => (
          <div key={line.multiPv} className="flex items-baseline gap-2 text-xs">
            <span className="text-foreground w-12 shrink-0 font-mono font-semibold">
              {formatScore(line.scoreCp, line.scoreMate, sideToMove)}
            </span>
            <span className="text-muted-foreground truncate">
              {pvToSan(fen, line.pvUci)}
            </span>
          </div>
        ))}
        {analyzing && lines.length > 0 && (
          <p className="text-muted-foreground text-[0.65rem]">
            Profondita' {lines[0]?.depth ?? '…'}/{settings.depth}
          </p>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Impostazioni analisi</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="multi-pv">Numero di linee</Label>
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
              <Label htmlFor="depth">Profondita' motore</Label>
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
              <Label htmlFor="best-move-arrow">Freccia mossa migliore</Label>
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
