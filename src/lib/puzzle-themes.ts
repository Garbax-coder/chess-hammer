// Catalogo statico dei 73 temi Lichess presenti nel dump puzzle importato
// (vedi supabase/migrations/0001_lichess_puzzles.sql): essendo un import
// una tantum, l'elenco non cambia a runtime, quindi non serve interrogare
// il DB per popolare il picker.
export type PuzzleThemeCategoryId =
  | 'phase'
  | 'goal'
  | 'length'
  | 'level'
  | 'tactics'
  | 'mates'
  | 'endgameType'
  | 'specialMoves'

export interface PuzzleThemeCategory {
  id: PuzzleThemeCategoryId
  themes: readonly string[]
}

export const PUZZLE_THEME_CATEGORIES: readonly PuzzleThemeCategory[] = [
  { id: 'phase', themes: ['opening', 'middlegame', 'endgame'] },
  { id: 'goal', themes: ['crushing', 'advantage', 'equality'] },
  { id: 'length', themes: ['oneMove', 'short', 'long', 'veryLong'] },
  { id: 'level', themes: ['master', 'masterVsMaster', 'superGM'] },
  {
    id: 'tactics',
    themes: [
      'fork',
      'pin',
      'skewer',
      'discoveredAttack',
      'discoveredCheck',
      'doubleCheck',
      'deflection',
      'attraction',
      'clearance',
      'interference',
      'intermezzo',
      'xRayAttack',
      'zugzwang',
      'trappedPiece',
      'capturingDefender',
      'hangingPiece',
      'quietMove',
      'defensiveMove',
      'sacrifice',
      'advancedPawn',
      'exposedKing',
      'kingsideAttack',
      'queensideAttack',
      'attackingF2F7',
      'collinearMove',
    ],
  },
  {
    id: 'mates',
    themes: [
      'mate',
      'mateIn1',
      'mateIn2',
      'mateIn3',
      'mateIn4',
      'mateIn5',
      'backRankMate',
      'smotheredMate',
      'anastasiaMate',
      'arabianMate',
      'bodenMate',
      'hookMate',
      'dovetailMate',
      'doubleBishopMate',
      'cornerMate',
      'epauletteMate',
      'killBoxMate',
      'morphysMate',
      'operaMate',
      'pillsburysMate',
      'swallowstailMate',
      'triangleMate',
      'vukovicMate',
      'blindSwineMate',
      'balestraMate',
    ],
  },
  {
    id: 'endgameType',
    themes: [
      'pawnEndgame',
      'knightEndgame',
      'bishopEndgame',
      'rookEndgame',
      'queenEndgame',
      'queenRookEndgame',
    ],
  },
  {
    id: 'specialMoves',
    themes: ['promotion', 'enPassant', 'castling', 'underPromotion'],
  },
] as const

export const ALL_PUZZLE_THEME_IDS: readonly string[] = PUZZLE_THEME_CATEGORIES.flatMap(
  (c) => c.themes,
)
