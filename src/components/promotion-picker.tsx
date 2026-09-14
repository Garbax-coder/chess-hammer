import type { PieceRenderObject } from 'react-chessboard'
import { squareToBoardPosition } from '@/components/puzzle-board'
import { useTranslations } from '@/lib/language-context'

const PROMOTION_ORDER = ['q', 'r', 'b', 'n'] as const
export type PromotionPieceType = (typeof PROMOTION_ORDER)[number]

export function PromotionPicker({
  square,
  color,
  orientation,
  pieces,
  onSelect,
  onCancel,
}: {
  square: string
  color: 'w' | 'b'
  orientation: 'white' | 'black'
  pieces: PieceRenderObject
  onSelect: (piece: PromotionPieceType) => void
  onCancel: () => void
}) {
  const t = useTranslations()
  const { row, col } = squareToBoardPosition(square, orientation)
  // Le 4 scelte si impilano dalla casa di promozione verso il centro della
  // scacchiera (come nelle UI di scacchi piu' comuni): se la promozione e'
  // in cima (row 0) si scende, altrimenti (row 7) si sale.
  const stackDown = row === 0

  return (
    <>
      {/* Backdrop a tutta scacchiera: un click fuori dalle scelte annulla la
          promozione invece di lasciare la scacchiera bloccata in attesa. */}
      <button
        type="button"
        aria-label={t.puzzleBoard.choosePromotion}
        onClick={onCancel}
        className="absolute inset-0 z-10 cursor-default bg-black/20"
      />
      <div
        className="absolute z-20 flex flex-col overflow-hidden rounded-md shadow-lg"
        style={{
          left: `${col * 12.5}%`,
          top: `${(stackDown ? row : row - 3) * 12.5}%`,
          width: '12.5%',
        }}
      >
        {PROMOTION_ORDER.map((piece) => {
          const Piece =
            pieces[`${color}${piece.toUpperCase()}` as keyof PieceRenderObject]
          return (
            <button
              key={piece}
              type="button"
              aria-label={t.puzzleBoard.promotionPieces[piece]}
              title={t.puzzleBoard.promotionPieces[piece]}
              onClick={() => onSelect(piece)}
              className="bg-background hover:bg-muted aspect-square w-full p-1 transition-colors"
              style={{ aspectRatio: '1 / 1' }}
            >
              {Piece ? <Piece /> : null}
            </button>
          )
        })}
      </div>
    </>
  )
}
