import type { PieceRenderObject } from 'react-chessboard'
import { chessnutPieces } from '@/lib/piece-sets/chessnut'
import { fantasyPieces } from '@/lib/piece-sets/fantasy'
import { spatialPieces } from '@/lib/piece-sets/spatial'

export type PieceSetId = 'chessnut' | 'fantasy' | 'spatial'

export interface PieceSetOption {
  id: PieceSetId
  label: string
  pieces: PieceRenderObject
}

// Provenienza e licenza di ciascun set: src/lib/piece-sets/LICENSES.md.
// cburnett e merida (GPLv2+) sono stati tolti per restare liberi sulla
// licenza dei set di pezzi (supabase/migrations/0020_remove_gpl_piece_sets.sql
// migra anche i dati di chi li aveva scelti).
export const PIECE_SETS: PieceSetOption[] = [
  { id: 'chessnut', label: 'Chessnut', pieces: chessnutPieces },
  { id: 'fantasy', label: 'Fantasy', pieces: fantasyPieces },
  { id: 'spatial', label: 'Spatial', pieces: spatialPieces },
]

export const DEFAULT_PIECE_SET: PieceSetId = 'chessnut'

export function pieceSetById(id: string | null | undefined): PieceSetOption {
  return PIECE_SETS.find((set) => set.id === id) ?? PIECE_SETS[0]
}
