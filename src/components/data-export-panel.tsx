import { Download } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { downloadUserData, type ExportFormat } from '@/lib/data-export'
import type { EloRange } from '@/lib/elo-history'
import { useAuth } from '@/lib/auth-context'
import { useTranslations } from '@/lib/language-context'

const RANGES: EloRange[] = ['week', 'month', 'year', 'all']

export function DataExportPanel() {
  const { user } = useAuth()
  const t = useTranslations()
  const [range, setRange] = useState<EloRange>('all')
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [error, setError] = useState(false)

  async function handleDownload(format: ExportFormat) {
    if (!user) return
    setBusy(format)
    setError(false)
    try {
      await downloadUserData(user.id, range, format)
    } catch (e) {
      console.error('Export dati fallito', e)
      setError(true)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">{t.profile.exportDescription}</p>

      <div className="flex flex-wrap gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              range === r ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t.profile.exportRange[r]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          loading={busy === 'json'}
          onClick={() => handleDownload('json')}
        >
          {busy === 'json' ? t.profile.exporting : <><Download className="size-4" />{t.profile.exportJson}</>}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          loading={busy === 'xlsx'}
          onClick={() => handleDownload('xlsx')}
        >
          {busy === 'xlsx' ? t.profile.exporting : <><Download className="size-4" />{t.profile.exportExcel}</>}
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{t.profile.exportError}</p>}
    </div>
  )
}
