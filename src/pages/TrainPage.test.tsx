import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { NextPuzzleOutcome } from '@/lib/puzzle-engine'
import { makeLichessPuzzle, makePuzzleResult, makeSession } from '@/test/fixtures'
import type { PracticeAttempt, SessionPuzzleResult } from '@/types/training'
import TrainPage from './TrainPage'

// Stato letto dagli hook simulati qui sotto, impostato da ogni test.
let outcome: NextPuzzleOutcome
let sessionPuzzles: SessionPuzzleResult[]
let practiceAttempts: Map<string, PracticeAttempt[]>
const session = makeSession({ created_at: '2026-09-01T00:00:00Z' })
const recordAttempt = vi.fn(async (_params: unknown): Promise<NextPuzzleOutcome> => ({
  status: 'session_complete',
}))
const recordPracticeAttempt = vi.fn(async (_params: unknown) => {})
// Errore di Supabase quando la rete cade (Safari: "Load failed").
const networkError = {
  code: '',
  details: '',
  hint: '',
  message: 'TypeError: Load failed',
}

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
  useRecordAttempt: () => ({ mutateAsync: recordAttempt, isPending: false }),
}))
vi.mock('@/hooks/use-practice', () => ({
  usePuzzleById: (puzzleId: string | undefined) => ({
    data: puzzleId ? makeLichessPuzzle({ puzzle_id: puzzleId }) : undefined,
  }),
  useRecordPracticeAttempt: () => ({
    mutateAsync: recordPracticeAttempt,
    isPending: false,
  }),
  usePracticeAttempts: () => ({ data: practiceAttempts }),
}))
vi.mock('@/hooks/use-session-history', () => ({
  useSessionPuzzles: () => ({ data: sessionPuzzles, isLoading: false }),
}))
vi.mock('@/hooks/use-sound-enabled', () => ({
  useSoundEnabled: () => ({ enabled: false, setEnabled: () => {} }),
}))
vi.mock('@/hooks/use-user-stats', () => ({
  useUserStats: () => ({
    data: {
      auto_advance: true,
      practice_only_failed: false,
      practice_failed_scope: 'all',
    },
  }),
  useUpdateAutoAdvance: () => ({ mutate: () => {} }),
  useUpdatePracticeFilter: () => ({ mutate: () => {} }),
}))
vi.mock(import('@/components/puzzle-board'), async (importOriginal) => ({
  ...(await importOriginal()),
  // Pulsanti al posto della scacchiera: concludere il puzzle e passare al successivo.
  PuzzleBoard: ({ puzzle, onComplete, onAdvance }) => (
    <div data-testid="puzzle-board">
      {puzzle.puzzle_id}
      <button type="button" onClick={() => onComplete('solved', 12)}>
        concludi
      </button>
      <button type="button" onClick={() => onAdvance()}>
        avanti
      </button>
    </div>
  ),
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
    practiceAttempts = new Map()
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

  it('resumes after the last puzzle concluded in free practice', () => {
    outcome = { status: 'quota_reached', round: 1 }
    sessionPuzzles = [
      makePuzzleResult({ puzzleId: 'first', orderIndex: 1 }),
      makePuzzleResult({ puzzleId: 'second', orderIndex: 2 }),
    ]
    practiceAttempts = new Map([
      [
        'first',
        [
          {
            id: 'pa-1',
            user_id: 'user-1',
            puzzle_id: 'first',
            result: 'solved',
            time_seconds: 10,
            attempted_at: '2026-09-05T00:00:00Z',
          },
        ],
      ],
    ])
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: startLabel }))

    expect(screen.getByTestId('puzzle-board')).toHaveTextContent('second')
  })

  it('disables the button while the session has no puzzles to practice', () => {
    outcome = { status: 'quota_reached', round: 1 }
    practiceAttempts = new Map()
    sessionPuzzles = []
    renderPage()

    expect(screen.getByRole('button', { name: startLabel })).toBeDisabled()
  })
})

describe('TrainPage when the network drops while saving', () => {
  beforeEach(() => {
    recordAttempt.mockReset()
    recordPracticeAttempt.mockReset()
    practiceAttempts = new Map()
    sessionPuzzles = [makePuzzleResult({ puzzleId: 'first', orderIndex: 1 })]
  })

  it('keeps a failed session save handled and retries it when moving on', async () => {
    outcome = {
      status: 'next',
      data: {
        sessionPuzzleId: 'sp-1',
        round: 1,
        puzzle: makeLichessPuzzle({ puzzle_id: 'p1' }),
      },
    }
    recordAttempt
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue({ status: 'session_complete' })
    renderPage()

    // Il salvataggio fallisce prima del passaggio al puzzle successivo: senza
    // gestione, Vitest segnalerebbe un rifiuto non gestito e il test fallirebbe.
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'concludi' })),
    )
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'avanti' })))

    expect(recordAttempt).toHaveBeenCalledTimes(2)
    expect(recordAttempt.mock.calls[1][0]).toEqual(recordAttempt.mock.calls[0][0])
  })

  it('retries a failed free-practice save once, then gives up quietly', async () => {
    vi.useFakeTimers()
    outcome = { status: 'quota_reached', round: 1 }
    recordPracticeAttempt.mockRejectedValue(networkError)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: startLabel }))

    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'concludi' })),
    )
    await act(async () => vi.advanceTimersByTime(2000))

    expect(recordPracticeAttempt).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    vi.useRealTimers()
  })
})
