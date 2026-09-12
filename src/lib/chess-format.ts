import { Chess } from 'chess.js'
import { parseUci } from '@/lib/uci'

/** Converte una linea principale (mosse UCI) in notazione SAN leggibile, troncata a maxPly mezze-mosse. */
export function pvToSan(fen: string, pvUci: string[], maxPly = 8): string {
  const game = new Chess(fen)
  const sanMoves: string[] = []
  for (let i = 0; i < Math.min(pvUci.length, maxPly); i++) {
    try {
      const move = game.move(parseUci(pvUci[i]))
      const moveNumber =
        Math.floor(game.history().length / 2) + (game.turn() === 'w' ? 0 : 1)
      if (i === 0 || move.color === 'w') {
        sanMoves.push(`${moveNumber}.${move.color === 'b' ? '..' : ''}${move.san}`)
      } else {
        sanMoves.push(move.san)
      }
    } catch {
      break
    }
  }
  return sanMoves.join(' ') + (pvUci.length > maxPly ? ' …' : '')
}

/**
 * Formatta il punteggio motore (relativo al lato da muovere nella FEN, per
 * convenzione UCI) in una stringa dal punto di vista del Bianco, es. "+1.4"
 * o "M3" / "-M2".
 */
export function formatScore(
  scoreCp: number | null,
  scoreMate: number | null,
  sideToMove: 'w' | 'b',
): string {
  const sign = sideToMove === 'w' ? 1 : -1
  if (scoreMate !== null) {
    const mate = scoreMate * sign
    return mate > 0 ? `M${mate}` : `-M${Math.abs(mate)}`
  }
  if (scoreCp === null) return '–'
  const value = (scoreCp * sign) / 100
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}
