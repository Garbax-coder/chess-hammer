// Le frecce che l'utente disegna su una posizione (migrazione 0110): colori
// come nelle annotazioni [%cal] dei PGN di Lichess (G verde, R rosso, B blu,
// Y giallo). Si disegnano col tasto destro trascinando; Shift, Alt e Ctrl
// cambiano colore.

export type ArrowColor = 'G' | 'R' | 'B' | 'Y'

export interface MoveArrow {
  from: string
  to: string
  color: ArrowColor
}

export const ARROW_COLORS: Record<ArrowColor, string> = {
  G: 'rgb(21, 128, 61)',
  R: 'rgb(185, 28, 28)',
  B: 'rgb(29, 78, 216)',
  Y: 'rgb(202, 138, 4)',
}

/** Il colore di una freccia disegnata, dal colore che usa la scacchiera. */
export function arrowColorOf(cssColor: string): ArrowColor {
  const found = (Object.entries(ARROW_COLORS) as [ArrowColor, string][]).find(
    ([, css]) => css === cssColor,
  )
  return found?.[0] ?? 'G'
}

/**
 * Una freccia disegnata di nuovo si toglie (come su Lichess); altrimenti si
 * aggiunge, anche se c'era con un altro colore (che cambia).
 */
export function toggleArrow(arrows: MoveArrow[], arrow: MoveArrow): MoveArrow[] {
  const same = arrows.find((a) => a.from === arrow.from && a.to === arrow.to)
  const rest = arrows.filter((a) => a !== same)
  return same && same.color === arrow.color ? rest : [...rest, arrow]
}

/** Le frecce nel formato dei commenti PGN: [%cal Ge2e4,Rd1h5]. */
export function arrowsToPgn(arrows: MoveArrow[]): string {
  return arrows.length > 0
    ? `[%cal ${arrows.map((a) => `${a.color}${a.from}${a.to}`).join(',')}]`
    : ''
}
