import { Chess } from 'chess.js'
import { parseUci } from '@/lib/uci'

/**
 * Genera il PGN completo di un puzzle: chess.js aggiunge da solo gli header
 * [FEN]/[SetUp] quando la partita non parte dalla posizione iniziale, quindi
 * basta rigiocare le mosse della soluzione (UCI) sopra il FEN di partenza.
 */
export function puzzlePgn(fen: string, movesUci: string[]): string {
  const game = new Chess(fen)
  for (const uci of movesUci) {
    try {
      game.move(parseUci(uci))
    } catch {
      break
    }
  }
  return game.pgn()
}

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

/**
 * Converte il punteggio motore (relativo al lato da muovere) nella
 * percentuale di "vantaggio" del Bianco da 0 a 100, per una barra di
 * valutazione. Usa una sigmoide sul valore in centipedoni.
 */
export function evalToWhitePercent(
  scoreCp: number | null,
  scoreMate: number | null,
  sideToMove: 'w' | 'b',
): number {
  const sign = sideToMove === 'w' ? 1 : -1
  if (scoreMate !== null) {
    const mate = scoreMate * sign
    return mate > 0 ? 100 : 0
  }
  if (scoreCp === null) return 50
  const whiteCp = scoreCp * sign
  const percent = 50 + 50 * (2 / (1 + Math.exp(-whiteCp / 300)) - 1)
  return Math.min(100, Math.max(0, percent))
}
