import { attemptsByRound } from '@/lib/session-puzzles-merge'
import { supabase } from '@/lib/supabase'
import type { PuzzleAttempt, SessionPuzzleResult } from '@/types/training'

// I puzzle di una categoria che l'utente ha tentato, aperti dalle
// classifiche delle statistiche per ripassarli in pratica libera
// (funzione my_theme_puzzles, migrazione 0036). Le stesse due fonti delle
// schede della pagina /stats.

export type ThemePuzzleSource = 'training' | 'practice'

/** Una riga della lista: come quella di una sessione, piu' la sessione a cui
 *  attribuire i tentativi di pratica (null se non ne esiste piu' una). */
export interface ThemePuzzle extends SessionPuzzleResult {
  sessionId: string | null
}

interface RawThemePuzzle {
  puzzle_id: string
  session_id: string | null
  session_puzzle_id: string | null
  rating: number
  fen: string
  moves: string[]
  themes: string[]
  attempts: PuzzleAttempt[]
}

export function toThemePuzzles(rows: RawThemePuzzle[]): ThemePuzzle[] {
  return rows.map((row, index) => ({
    // Senza sessione (cancellata) il puzzle resta in lista: la chiave si
    // ricava dal puzzle, che compare una volta sola.
    sessionPuzzleId: row.session_puzzle_id ?? `puzzle-${row.puzzle_id}`,
    sessionId: row.session_id,
    // La posizione nella lista, dal primo tentato.
    orderIndex: index + 1,
    puzzleId: row.puzzle_id,
    rating: row.rating,
    fen: row.fen,
    moves: row.moves,
    themes: row.themes,
    attempts: attemptsByRound(row.attempts),
  }))
}

export async function fetchThemePuzzles(
  theme: string,
  source: ThemePuzzleSource,
): Promise<ThemePuzzle[]> {
  const { data, error } = await supabase.rpc('my_theme_puzzles', {
    p_theme: theme,
    p_source: source,
  })
  if (error) throw error
  return toThemePuzzles(data as RawThemePuzzle[])
}

export function themePracticePath(theme: string, source: ThemePuzzleSource): string {
  const path = `/stats/themes/${encodeURIComponent(theme)}`
  return source === 'practice' ? `${path}?source=practice` : path
}
