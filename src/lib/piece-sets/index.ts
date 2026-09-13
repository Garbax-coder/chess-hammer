import type { PieceRenderObject } from 'react-chessboard'
import { cburnettPieces } from '@/lib/piece-sets/cburnett'
import { chessnutPieces } from '@/lib/piece-sets/chessnut'
import { fantasyPieces } from '@/lib/piece-sets/fantasy'
import { meridaPieces } from '@/lib/piece-sets/merida'
import { spatialPieces } from '@/lib/piece-sets/spatial'

export type PieceSetId = 'cburnett' | 'merida' | 'chessnut' | 'fantasy' | 'spatial'

export interface PieceSetOption {
  id: PieceSetId
  label: string
  pieces: PieceRenderObject
}

// Provenienza e licenza di ciascun set: src/lib/piece-sets/LICENSES.md.
// 'cburnett' e' esattamente il set di default di react-chessboard: chi non
// ha ancora scelto un set non vede alcun cambiamento visivo.
export const PIECE_SETS: PieceSetOption[] = [
  { id: 'cburnett', label: 'Cburnett', pieces: cburnettPieces },
  { id: 'merida', label: 'Merida', pieces: meridaPieces },
  { id: 'chessnut', label: 'Chessnut', pieces: chessnutPieces },
  { id: 'fantasy', label: 'Fantasy', pieces: fantasyPieces },
  { id: 'spatial', label: 'Spatial', pieces: spatialPieces },
]

export const DEFAULT_PIECE_SET: PieceSetId = 'cburnett'

export function pieceSetById(id: string | null | undefined): PieceSetOption {
  return PIECE_SETS.find((set) => set.id === id) ?? PIECE_SETS[0]
}
