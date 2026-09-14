import { ALL_PUZZLE_THEME_IDS } from '@/lib/puzzle-themes'

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

export interface TrainingSession {
  id: string
  user_id: string
  total_puzzles: number
  daily_target_round1: number
  daily_target_round2: number
  daily_target_round3: number
  current_round: 1 | 2 | 3
  status: SessionStatus
  created_at: string
  completed_at: string | null
  /** Giorni di pausa consigliati tra un giro e il successivo (0 = nessuna pausa). */
  rest_days: number
  /** Se impostato e nel futuro, la sessione e' in pausa fino a questa data prima
   *  di poter proseguire col prossimo giro. */
  resting_until: string | null
  /** Temi puzzle (Lichess) a cui restringere la scelta del giro 1.
   *  Null/vuoto = nessuna restrizione (sessioni create prima di questa
   *  colonna, o utente che ha lasciato tutti i temi selezionati). */
  puzzle_themes: string[] | null
  /** Nome scelto dall'utente alla creazione, opzionale (null = nessun nome:
   *  l'interfaccia mostra un titolo generico in sua assenza). */
  name: string | null
}

export interface NewTrainingSessionInput {
  total_puzzles: number
  daily_target_round1: number
  daily_target_round2: number
  daily_target_round3: number
  rest_days: number
  puzzle_themes: string[]
  name: string
}

export const DEFAULT_SESSION_CONFIG: NewTrainingSessionInput = {
  total_puzzles: 200,
  daily_target_round1: 10,
  daily_target_round2: 20,
  daily_target_round3: 40,
  // Il metodo Woodpecker consiglia qualche giorno di pausa tra un giro e
  // l'altro, cosi' il giro successivo e' un vero richiamo dalla memoria
  // invece di una semplice ripetizione a breve termine.
  rest_days: 2,
  // Tutti i temi selezionati di default: l'utente restringe solo se vuole
  // allenarsi su motivi tattici specifici.
  puzzle_themes: [...ALL_PUZZLE_THEME_IDS],
  name: '',
}

export interface LichessPuzzle {
  puzzle_id: string
  fen: string
  moves: string[]
  rating: number
  rating_deviation: number
  popularity: number
  nb_plays: number
  themes: string[]
  game_url: string | null
  opening_tags: string[]
}

export interface SessionPuzzle {
  id: string
  session_id: string
  puzzle_id: string
  order_index: number
  created_at: string
}

export type AttemptResult = 'solved' | 'failed'

export interface PuzzleAttempt {
  id: string
  session_puzzle_id: string
  round_number: 1 | 2 | 3
  result: AttemptResult
  time_seconds: number
  elo_before: number
  elo_after: number
  attempted_at: string
}

/** Il prossimo puzzle da presentare all'utente in una sessione, con il contesto necessario. */
export interface NextPuzzle {
  sessionPuzzleId: string
  puzzle: LichessPuzzle
  round: 1 | 2 | 3
}

export interface SessionProgress {
  round: 1 | 2 | 3
  poolSize: number
  roundTargetSize: number
  attemptedThisRound: number
  dailyTarget: number
  attemptedToday: number
}

export interface SessionPuzzleResult {
  sessionPuzzleId: string
  orderIndex: number
  puzzleId: string
  rating: number
  fen: string
  moves: string[]
  themes: string[]
  attempts: Partial<Record<1 | 2 | 3, PuzzleAttempt>>
}

export interface SessionDetail {
  session: TrainingSession
  puzzles: SessionPuzzleResult[]
}

/** Tentativo di "pratica libera": non influisce su sessione/ELO ufficiali. */
export interface PracticeAttempt {
  id: string
  user_id: string
  puzzle_id: string
  result: AttemptResult
  time_seconds: number
  attempted_at: string
}
