import { supabase } from '@/lib/supabase'

async function sessionPuzzleIds(sessionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('session_puzzles')
    .select('id')
    .eq('session_id', sessionId)
  if (error) throw error
  return data.map((p) => p.id)
}

/** Elimina i tentativi di oggi per il giro corrente, per riaprire la quota giornaliera. */
export async function resetTodayQuota(sessionId: string, round: 1 | 2 | 3) {
  const ids = await sessionPuzzleIds(sessionId)
  if (ids.length === 0) return

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const { error } = await supabase
    .from('puzzle_attempts')
    .delete()
    .eq('round_number', round)
    .in('session_puzzle_id', ids)
    .gte('attempted_at', startOfToday.toISOString())
  if (error) throw error
}

/** Azzera completamente la sessione attiva (pool, tentativi, giro, ELO) per ripartire da zero. */
export async function resetSession(sessionId: string, userId: string) {
  const ids = await sessionPuzzleIds(sessionId)

  if (ids.length > 0) {
    const { error: attemptsError } = await supabase
      .from('puzzle_attempts')
      .delete()
      .in('session_puzzle_id', ids)
    if (attemptsError) throw attemptsError
  }

  const { error: puzzlesError } = await supabase
    .from('session_puzzles')
    .delete()
    .eq('session_id', sessionId)
  if (puzzlesError) throw puzzlesError

  const { error: sessionError } = await supabase
    .from('training_sessions')
    .update({ current_round: 1, resting_until: null })
    .eq('id', sessionId)
  if (sessionError) throw sessionError

  const { error: statsError } = await supabase
    .from('user_stats')
    .update({
      current_elo: 1500,
      rating_deviation: 350,
      puzzles_solved: 0,
      puzzles_failed: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (statsError) throw statsError
}

/**
 * Elimina del tutto la sessione attiva (session_puzzles e puzzle_attempts
 * seguono a cascata) per liberare subito lo slot di "sessione attiva" e
 * poter testare la creazione di una nuova sessione, senza dover completare
 * i 3 giri o resettarla in place. Non tocca user_stats (ELO/contatori
 * restano quelli reali).
 */
export async function deleteActiveSession(sessionId: string) {
  const { error } = await supabase.from('training_sessions').delete().eq('id', sessionId)
  if (error) throw error
}

/** Annulla subito l'eventuale pausa tra i giri in corso, per testare senza aspettare i giorni impostati. */
export async function skipRest(sessionId: string) {
  const { error } = await supabase
    .from('training_sessions')
    .update({ resting_until: null })
    .eq('id', sessionId)
  if (error) throw error
}

// Puzzle Lichess reale: prima mossa del risolutore e' b7b8n (sottopromozione
// a cavallo, tema "underPromotion"), utile per testare il selettore di
// promozione senza dover cercare a mano un puzzle adatto.
const KNIGHT_PROMOTION_PUZZLE_ID = 'FEaBa'

/**
 * Inserisce il puzzle di test sopra nel pool della sessione attiva, in cima
 * (order_index piu' basso di tutti) cosi' diventa subito il prossimo da
 * risolvere invece di dover prima finire quelli gia' in coda. Pensato per
 * il giro 1: in giro 2/3 il pool e' un replay fisso, quindi aggiungerne uno
 * a meta' rompe l'invariante "stesso pool del giro 1" (accettabile per uno
 * strumento di debug, non per l'uso normale).
 */
export async function addKnightPromotionDebugPuzzle(sessionId: string) {
  const { data: existing, error: fetchError } = await supabase
    .from('session_puzzles')
    .select('order_index, puzzle_id')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })
  if (fetchError) throw fetchError

  if (existing.some((p) => p.puzzle_id === KNIGHT_PROMOTION_PUZZLE_ID)) return

  const minOrderIndex = existing[0]?.order_index ?? 1
  const { error } = await supabase.from('session_puzzles').insert({
    session_id: sessionId,
    puzzle_id: KNIGHT_PROMOTION_PUZZLE_ID,
    order_index: minOrderIndex - 1,
  })
  if (error) throw error
}
