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
