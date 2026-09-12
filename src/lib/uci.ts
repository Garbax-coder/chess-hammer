/** Le mosse del dataset Lichess sono in UCI (es. "e2e4", "e7e8q" per la promozione). */
export interface UciMove {
  from: string
  to: string
  promotion?: string
}

export function parseUci(move: string): UciMove {
  return {
    from: move.slice(0, 2),
    to: move.slice(2, 4),
    promotion: move.length > 4 ? move.slice(4, 5) : undefined,
  }
}
