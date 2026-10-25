import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import type { OpeningRepertoire } from '@/lib/openings'

export type OpeningMode = 'learn' | 'train' | 'lines' | 'cycles'

/**
 * Titolo di una pagina di un repertorio e link alle altre modalita' (studio,
 * allenamento, consultazione, cicli), senza quella in cui si e'.
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
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className="text-foreground text-base font-semibold tracking-tight">
        {title ? `${name} · ${title}` : name}
      </h1>
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
