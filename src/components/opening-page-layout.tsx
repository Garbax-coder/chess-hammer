import type { CSSProperties, ReactNode } from 'react'

// Ingombri verticali: intestazione dell'app (53px) e padding del <main>
// (py-4 su desktop = 32px; py-6 + intestazione + respiro su mobile).
const DESKTOP_HEIGHT = 'calc(100svh - 85px)'
const MOBILE_SIZE = 'min(calc(100vw - 2rem), calc(100svh - 117px))'

// Larghezza occupata dalle due colonne laterali, dai gap e dal padding
// orizzontale, per variante e breakpoint (vedi le classi delle colonne):
// - play: sinistra w-56/w-64, destra w-60/w-72;
// - browse: sinistra w-56/w-64, destra w-96/w-[28rem] (albero e linee).
// Gap e padding: gap-4 + px-4 a lg (2x16 + 2x16 = 64px), gap-6 + px-6 a xl
// (2x24 + 2x24 = 96px).
const SIDES = {
  play: { lg: 224 + 240 + 64, xl: 256 + 288 + 96 },
  browse: { lg: 224 + 384 + 64, xl: 256 + 448 + 96 },
}

const RIGHT_WIDTH = {
  play: 'lg:w-60 xl:w-72',
  browse: 'lg:w-96 xl:w-[28rem]',
}

/**
 * Layout delle pagine con la scacchiera delle aperture (Learn, Drill,
 * Consulta, Cicli). Su desktop la pagina e' alta esattamente quanto lo
 * schermo sotto l'intestazione e non scorre: la scacchiera sta al centro,
 * grande quanto lo spazio disponibile, e non si sposta mai; le colonne ai
 * lati (informazioni a sinistra, stato e comandi a destra) scorrono per
 * conto loro se il contenuto e' lungo (i loro figli non si restringono,
 * altrimenti le card verrebbero tagliate). Il piè di pagina su desktop lo
 * nasconde AppShell (isOpeningBoardPath, in lib/opening-routes). Su
 * mobile: scacchiera, comandi, informazioni, uno sotto l'altro.
 */
export function OpeningPageLayout({
  left,
  board,
  right,
  variant = 'play',
}: {
  left: ReactNode
  board: ReactNode
  right: ReactNode
  variant?: 'play' | 'browse'
}) {
  const sides = SIDES[variant]
  const style = {
    '--board-sm': MOBILE_SIZE,
    '--board-lg': `min(calc(100vw - ${sides.lg}px), ${DESKTOP_HEIGHT})`,
    '--board-xl': `min(calc(100vw - ${sides.xl}px), ${DESKTOP_HEIGHT})`,
  } as CSSProperties

  return (
    <main
      style={style}
      className="flex w-full flex-1 flex-col items-center gap-4 px-4 py-6 lg:h-[calc(100svh-53px)] lg:flex-none lg:flex-row lg:items-stretch lg:justify-center lg:overflow-hidden lg:py-4 xl:gap-6 xl:px-6"
    >
      <aside className="order-3 flex w-full flex-col gap-4 lg:order-1 lg:min-h-0 lg:w-56 lg:shrink-0 lg:overflow-y-auto xl:w-64 [&>*]:shrink-0">
        {left}
      </aside>
      <div className="order-1 size-[var(--board-sm)] shrink-0 lg:order-2 lg:size-[var(--board-lg)] xl:size-[var(--board-xl)]">
        {board}
      </div>
      <aside
        className={`order-2 flex w-full flex-col gap-3 lg:order-3 lg:min-h-0 lg:shrink-0 lg:overflow-y-auto [&>*]:shrink-0 ${RIGHT_WIDTH[variant]}`}
      >
        {right}
      </aside>
    </main>
  )
}
