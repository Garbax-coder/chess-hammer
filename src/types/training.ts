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
}

export interface NewTrainingSessionInput {
  total_puzzles: number
  daily_target_round1: number
  daily_target_round2: number
  daily_target_round3: number
}

export const DEFAULT_SESSION_CONFIG: NewTrainingSessionInput = {
  total_puzzles: 200,
  daily_target_round1: 10,
  daily_target_round2: 20,
  daily_target_round3: 40,
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
