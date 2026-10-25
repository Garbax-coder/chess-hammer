import type { CSSProperties, ReactNode } from 'react'

// Ingombri verticali: intestazione dell'app (53px) e padding del <main>
// (py-4 su desktop = 32px).
const DESKTOP_HEIGHT = 'calc(100svh - 85px)'
// Su mobile la scacchiera resta ferma in alto mentre sotto scorrono comandi
// e informazioni: al massimo il 62% dell'altezza, perche' ne resti per loro
// (conta in orizzontale, dove l'altezza e' poca).
const MOBILE_SIZE = 'min(calc(100vw - 2rem), 62svh)'

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

// La barra di valutazione accanto alla scacchiera su desktop: larghezza e
// gap (w-5 + gap-2).
const EVAL_BAR_WIDTH = 20 + 8

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
 * mobile: scacchiera ferma in alto, sotto comandi e informazioni che
 * scorrono.
 */
export function OpeningPageLayout({
  left,
  board,
  right,
  variant = 'play',
  evalBar,
}: {
  left: ReactNode
  board: ReactNode
  right: ReactNode
  variant?: 'play' | 'browse'
  /**
   * La barra di valutazione (es. con Stockfish acceso): su desktop in
   * verticale accanto alla scacchiera, su mobile in orizzontale sotto.
   */
  evalBar?: (orientation: 'vertical' | 'horizontal') => ReactNode
}) {
  const sides = SIDES[variant]
  const bar = evalBar ? EVAL_BAR_WIDTH : 0
  const style = {
    '--board-sm': MOBILE_SIZE,
    '--board-lg': `min(calc(100vw - ${sides.lg + bar}px), ${DESKTOP_HEIGHT})`,
    '--board-xl': `min(calc(100vw - ${sides.xl + bar}px), ${DESKTOP_HEIGHT})`,
  } as CSSProperties

  return (
    <main
      style={style}
      className="flex w-full flex-1 flex-col items-center gap-4 px-4 pb-6 lg:h-[calc(100svh-53px)] lg:flex-none lg:flex-row lg:items-stretch lg:justify-center lg:overflow-hidden lg:py-4 xl:gap-6 xl:px-6"
    >
      <aside className="order-3 flex w-full flex-col gap-4 lg:order-1 lg:min-h-0 lg:w-56 lg:shrink-0 lg:overflow-y-auto xl:w-64 [&>*]:shrink-0">
        {left}
      </aside>
      {/* Su mobile ferma sotto l'intestazione (53px), con lo sfondo della
          pagina attorno: quello che scorre sotto non si vede. Su desktop la
          pagina non scorre e basta la sua posizione. */}
      <div className="bg-background sticky top-[53px] z-[5] order-1 -mx-4 flex shrink-0 flex-col gap-2 px-4 py-2 lg:static lg:order-2 lg:mx-0 lg:flex-row lg:bg-transparent lg:p-0">
        {evalBar && (
          <div className="hidden w-5 shrink-0 lg:block lg:h-[var(--board-lg)] xl:h-[var(--board-xl)]">
            {evalBar('vertical')}
          </div>
        )}
        <div className="size-[var(--board-sm)] lg:size-[var(--board-lg)] xl:size-[var(--board-xl)]">
          {board}
        </div>
        {evalBar && (
          <div className="w-[var(--board-sm)] lg:hidden">{evalBar('horizontal')}</div>
        )}
      </div>
      <aside
        className={`order-2 flex w-full flex-col gap-3 lg:order-3 lg:min-h-0 lg:shrink-0 lg:overflow-y-auto [&>*]:shrink-0 ${RIGHT_WIDTH[variant]}`}
      >
        {right}
      </aside>
    </main>
  )
}
