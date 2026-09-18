import type { CSSProperties } from 'react'
import { BOARD_SIZE, BOARD_SIZE_LG } from '@/components/puzzle-board'
import { Skeleton } from '@/components/ui/skeleton'

// Ricalca l'ingombro di PuzzleBoard (stessa BOARD_SIZE/BOARD_SIZE_LG, stesse
// colonne riservate) cosi' la scacchiera vera non fa "scattare" il layout
// quando sostituisce lo skeleton al primo caricamento.
export function PuzzleBoardSkeleton() {
  return (
    <div
      style={{ '--board-size': BOARD_SIZE, '--board-size-lg': BOARD_SIZE_LG } as CSSProperties}
      className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          style={{ width: BOARD_SIZE }}
          className="flex items-center justify-between lg:hidden"
        >
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>

        <div className="flex w-[var(--board-size)] items-stretch gap-2 lg:w-[var(--board-size-lg)]">
          <div className="hidden w-5 shrink-0 lg:block" />
          <Skeleton className="min-w-0 flex-1 rounded-lg" style={{ aspectRatio: '1 / 1' }} />
          <div className="hidden w-5 shrink-0 lg:block" />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <Skeleton className="size-7 rounded-[0.75rem]" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="size-7 rounded-[0.75rem]" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
        <div className="hidden w-full items-center justify-between lg:flex">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Skeleton className="size-7 rounded-[0.75rem]" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="size-7 rounded-[0.75rem]" />
        </div>
      </div>
    </div>
  )
}
