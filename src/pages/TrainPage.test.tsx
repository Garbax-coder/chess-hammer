import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { NextPuzzleOutcome } from '@/lib/puzzle-engine'
import { makeLichessPuzzle, makePuzzleResult, makeSession } from '@/test/fixtures'
import type { SessionPuzzleResult } from '@/types/training'
import TrainPage from './TrainPage'

// Stato letto dagli hook simulati qui sotto, impostato da ogni test.
let outcome: NextPuzzleOutcome
let sessionPuzzles: SessionPuzzleResult[]
const session = makeSession()

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-active-session', () => ({
  useActiveSession: () => ({ data: session, isLoading: false }),
  useRenameTrainingSession: () => ({ mutate: () => {}, isPending: false }),
}))
vi.mock('@/hooks/use-puzzle-session', () => ({
  nextPuzzleQueryKey: (id: string) => ['next-puzzle', id],
  useNextPuzzle: () => ({ data: outcome, isLoading: false }),
  useRecordAttempt: () => ({ mutateAsync: async () => {}, isPending: false }),
}))
vi.mock('@/hooks/use-practice', () => ({
  usePuzzleById: (puzzleId: string | undefined) => ({
    data: puzzleId ? makeLichessPuzzle({ puzzle_id: puzzleId }) : undefined,
  }),
  useRecordPracticeAttempt: () => ({ mutateAsync: async () => {}, isPending: false }),
  usePracticeAttempts: () => ({ data: new Map() }),
}))
vi.mock('@/hooks/use-session-history', () => ({
  useSessionPuzzles: () => ({ data: sessionPuzzles, isLoading: false }),
}))
vi.mock('@/hooks/use-sound-enabled', () => ({
  useSoundEnabled: () => ({ enabled: false, setEnabled: () => {} }),
}))
vi.mock('@/hooks/use-user-stats', () => ({
  useUserStats: () => ({ data: undefined }),
  useUpdateAutoAdvance: () => ({ mutate: () => {} }),
}))
vi.mock(import('@/components/puzzle-board'), async (importOriginal) => ({
  ...(await importOriginal()),
  PuzzleBoard: ({ puzzle }) => <div data-testid="puzzle-board">{puzzle.puzzle_id}</div>,
}))
vi.mock('@/components/dev-tools-panel', () => ({ DevToolsPanel: () => null }))

function renderPage() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <TrainPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const startLabel = itTranslations.train.startPractice

describe('TrainPage summary screens', () => {
  it.each<[string, NextPuzzleOutcome]>([
    ['quota reached', { status: 'quota_reached', round: 1 }],
    ['resting', { status: 'resting', round: 1, restingUntil: '2026-10-10T00:00:00Z' }],
    ['session complete', { status: 'session_complete' }],
  ])('%s: "continue in free practice" opens the first puzzle of the session', (_, o) => {
    outcome = o
    sessionPuzzles = [
      makePuzzleResult({ puzzleId: 'first', orderIndex: 1 }),
      makePuzzleResult({ puzzleId: 'second', orderIndex: 2 }),
    ]
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: startLabel }))

    expect(screen.getByTestId('puzzle-board')).toHaveTextContent('first')
    expect(
      screen.getByRole('heading', { name: itTranslations.train.practiceTitle }),
    ).toBeInTheDocument()
  })

  it('disables the button while the session has no puzzles to practice', () => {
    outcome = { status: 'quota_reached', round: 1 }
    sessionPuzzles = []
    renderPage()

    expect(screen.getByRole('button', { name: startLabel })).toBeDisabled()
  })
})
