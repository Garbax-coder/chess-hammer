import type { ReactNode } from 'react'
import { PracticeSettingsMenu } from '@/components/practice-settings-menu'

/**
 * Colonna laterale delle schermate di risoluzione (allenamento, dettaglio di
 * una sessione, ripasso di una categoria): un'intestazione compatta con il
 * menu delle preferenze e, sotto, la lista dei puzzle, che prende tutta
 * l'altezza rimasta. Le azioni sul puzzle in corso stanno accanto alla
 * scacchiera (PuzzleBoard, prop actions), i filtri nell'intestazione della
 * lista (SessionPuzzleList, prop filters).
 */
export function PuzzleSidebar({
  title,
  subtitle,
  children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
}) {
  return (
    // 117px = header (53px) + padding sopra/sotto del <main> (py-8, 32px
    // ciascuno): senza sottrarli, la colonna sticky puo' sporgere oltre il
    // fondo della finestra e costringere a scorrere la pagina intera.
    <aside className="order-2 flex min-h-0 w-full flex-col gap-3 lg:sticky lg:top-14 lg:order-1 lg:max-h-[calc(100vh-117px)] lg:w-64 lg:shrink-0 lg:self-start">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-foreground text-base font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <div className="text-muted-foreground flex flex-col text-xs">{subtitle}</div>
          )}
        </div>
        <PracticeSettingsMenu />
      </div>
      {children}
    </aside>
  )
}
