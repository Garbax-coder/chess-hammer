import type {
  AttemptResult,
  LichessPuzzle,
  PuzzleAttempt,
  SessionPuzzleResult,
  TrainingSession,
} from '@/types/training'

let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export function makeSession(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: nextId('session'),
    user_id: 'user-1',
    total_puzzles: 200,
    daily_target_round1: 10,
    daily_target_round2: 20,
    daily_target_round3: 40,
    current_round: 1,
    status: 'in_progress',
    created_at: '2026-09-01T00:00:00.000Z',
    completed_at: null,
    rest_days: 2,
    resting_until: null,
    puzzle_themes: null,
    name: null,
    ...overrides,
  }
}

export function makeAttempt(overrides: Partial<PuzzleAttempt> = {}): PuzzleAttempt {
  return {
    id: nextId('attempt'),
    session_puzzle_id: 'sp-1',
    round_number: 1,
    result: 'solved',
    time_seconds: 10,
    elo_before: 1000,
    elo_after: 1005,
    attempted_at: '2026-09-10T10:00:00.000Z',
    ...overrides,
  }
}

// Posizione iniziale: sempre una FEN valida (entrambi i re presenti), a
// differenza di una FEN "vuota" inventata — serve perche' i componenti che
// la usano (PuzzleMiniBoard) costruiscono una vera Chess() da essa.
const VALID_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function makePuzzleResult(
  overrides: Partial<SessionPuzzleResult> = {},
): SessionPuzzleResult {
  return {
    sessionPuzzleId: nextId('sp'),
    orderIndex: 1,
    puzzleId: nextId('puzzle'),
    rating: 1000,
    fen: VALID_FEN,
    moves: ['e2e4'],
    themes: [],
    attempts: {},
    ...overrides,
  }
}

export function makeLichessPuzzle(overrides: Partial<LichessPuzzle> = {}): LichessPuzzle {
  return {
    puzzle_id: nextId('puzzle'),
    fen: VALID_FEN,
    moves: ['e2e4'],
    rating: 1000,
    rating_deviation: 80,
    popularity: 90,
    nb_plays: 1000,
    themes: [],
    game_url: null,
    opening_tags: [],
    ...overrides,
  }
}

/** Puzzle con un tentativo in un giro, scorciatoia per i test del grafico/lista. */
export function withAttempt(
  puzzle: SessionPuzzleResult,
  round: 1 | 2 | 3,
  result: AttemptResult,
  attemptedAt: string,
  timeSeconds = 10,
): SessionPuzzleResult {
  return {
    ...puzzle,
    attempts: {
      ...puzzle.attempts,
      [round]: makeAttempt({
        session_puzzle_id: puzzle.sessionPuzzleId,
        round_number: round,
        result,
        attempted_at: attemptedAt,
        time_seconds: timeSeconds,
      }),
    },
  }
}
