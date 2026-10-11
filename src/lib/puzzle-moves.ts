import type { Chess, Move, Square } from 'chess.js'

// Serve scegliere il pezzo di promozione solo se la mossa e' davvero una
// promozione legale: un pedone trascinato sull'ultima traversa da una casa
// da cui non puo' arrivarci deve tornare indietro subito, senza selettore.
export function needsPromotion(game: Chess, source: string, target: string): boolean {
  return game
    .moves({ square: source as Square, verbose: true })
    .some((move) => move.to === target && !!move.promotion)
}

// Come su Lichess: vale la mossa della soluzione oppure qualunque mossa che
// dia scacco matto (finisce la partita, quindi non puo' essere sbagliata),
// per i puzzle in cui il matto si puo' dare con piu' di un pezzo.
export function isAcceptedMove(move: Move, expectedUci: string | undefined): boolean {
  return move.lan === expectedUci || move.san.endsWith('#')
}
