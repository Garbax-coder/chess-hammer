import { BOARD_SIZE } from '@/components/puzzle-board'
import { Skeleton } from '@/components/ui/skeleton'

// Ricalca l'ingombro di PuzzleBoard (stessa BOARD_SIZE, stesse colonne
// riservate) cosi' la scacchiera vera non fa "scattare" il layout quando
// sostituisce lo skeleton al primo caricamento.
export function PuzzleBoardSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: BOARD_SIZE }} className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>

        <div className="flex items-stretch gap-2" style={{ width: BOARD_SIZE }}>
          <div className="hidden w-5 shrink-0 lg:block" />
          <Skeleton className="min-w-0 flex-1 rounded-lg" style={{ aspectRatio: '1 / 1' }} />
          <div className="hidden w-5 shrink-0 lg:block" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="size-7 rounded-[0.75rem]" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="size-7 rounded-[0.75rem]" />
        </div>
      </div>

      <div className="w-full lg:w-72 lg:shrink-0" />
    </div>
  )
}
