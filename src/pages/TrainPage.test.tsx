import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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
  outcomeRound: (o: NextPuzzleOutcome) =>
    o.status === 'next' ? o.data.round : o.status === 'session_complete' ? null : o.round,
  useNextPuzzle: () => ({ data: outcome, isLoading: false }),
  useRecordAttempt: () => ({ mutateAsync: recordAttempt, isPending: false }),
}))
vi.mock('@/hooks/use-practice', () => ({
  useRecordPracticeAttempt: () => ({
    mutateAsync: recordPracticeAttempt,
    isPending: false,
  }),
  usePracticeAttempts: () => ({ data: practiceAttempts }),
}))
vi.mock('@/hooks/use-session-history', () => ({
  useSessionPuzzles: () => ({ data: sessionPuzzles, isLoading: false }),
}))
// Puzzle "problematici" salvati e filtro della pratica libera.
let savedPuzzleIds = new Set<string>()
let practiceOnlySaved = false
const toggleSaved = vi.fn()
vi.mock('@/hooks/use-saved-puzzles', () => ({
  useSavedPuzzles: () => ({ data: savedPuzzleIds }),
  useToggleSavedPuzzle: () => ({ mutate: toggleSaved }),
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
      practice_only_saved: practiceOnlySaved,
    },
  }),
  useUpdateAutoAdvance: () => ({ mutate: () => {} }),
  useUpdatePracticeFilter: () => ({ mutate: () => {} }),
}))
vi.mock(import('@/components/puzzle-board'), async (importOriginal) => ({
  ...(await importOriginal()),
  // Pulsanti al posto della scacchiera: concludere il puzzle e passare al successivo.
  PuzzleBoard: ({ puzzle, onComplete, onAdvance, onRetry }) => (
    <div data-testid="puzzle-board" data-can-retry={onRetry ? 'yes' : 'no'}>
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
// Statistiche del giro 1 appena concluso (riepilogo di fine giro).
vi.mock('@/hooks/use-session-stats', () => ({
  sessionRoundStatsKey: (userId: string) => ['session-round-stats', userId],
  useSessionRoundStats: () => ({
    data: [
      {
        session_id: session.id,
        session_name: null,
        status: 'in_progress',
        total_puzzles: 2,
        created_at: session.created_at,
        completed_at: null,
        pool_size: 2,
        round: 1,
        attempted: 2,
        solved: 1,
        total_seconds: 50,
        first_attempt_at: '2026-10-18T10:00:00Z',
        last_attempt_at: '2026-10-18T10:05:00Z',
        elo_start: 1500,
        elo_end: 1510,
      },
    ],
  }),
}))

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

describe('TrainPage at the end of a round or of the session', () => {
  const nextPuzzle = (round: 1 | 2 | 3, id: string): NextPuzzleOutcome => ({
    status: 'next',
    data: {
      sessionPuzzleId: `sp-${id}`,
      round,
      puzzle: makeLichessPuzzle({ puzzle_id: id }),
    },
  })

  beforeEach(() => {
    recordAttempt.mockReset()
    practiceAttempts = new Map()
    sessionPuzzles = [makePuzzleResult({ puzzleId: 'first', orderIndex: 1 })]
  })

  function renderWithSummaryRoute() {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/train']}>
          <Routes>
            <Route path="/train" element={<TrainPage />} />
            <Route path="/sessions/:id/summary" element={<p>riepilogo sessione</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('shows the round summary before the next round when there is no rest', async () => {
    outcome = nextPuzzle(1, 'last-of-round-1')
    recordAttempt.mockResolvedValue(nextPuzzle(2, 'first-of-round-2'))
    renderWithSummaryRoute()

    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'concludi' })),
    )
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'avanti' })))

    expect(
      screen.getByText(itTranslations.summary.roundCompleteTitle(1)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(itTranslations.summary.roundLine(1, 1, '0:50', '25 s')),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('puzzle-board')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: itTranslations.summary.continue }))
    expect(screen.getByTestId('puzzle-board')).toBeInTheDocument()
  })

  it('opens the session summary after the last puzzle of the session', async () => {
    outcome = nextPuzzle(3, 'last-of-session')
    recordAttempt.mockResolvedValue({ status: 'session_complete' })
    renderWithSummaryRoute()

    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'concludi' })),
    )
    // Il puzzle appena risolto resta visibile fino al passaggio successivo.
    expect(screen.getByTestId('puzzle-board')).toBeInTheDocument()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'avanti' })))

    expect(screen.getByText('riepilogo sessione')).toBeInTheDocument()
  })
})

describe('TrainPage problem puzzles', () => {
  beforeEach(() => {
    outcome = { status: 'quota_reached', round: 1 }
    practiceAttempts = new Map()
    sessionPuzzles = [
      makePuzzleResult({ puzzleId: 'first', orderIndex: 1 }),
      makePuzzleResult({ puzzleId: 'second', orderIndex: 2 }),
    ]
    toggleSaved.mockReset()
  })

  it('starts free practice from the saved puzzles when only those are selected', () => {
    savedPuzzleIds = new Set(['second'])
    practiceOnlySaved = true
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: startLabel }))

    expect(screen.getByTestId('puzzle-board')).toHaveTextContent('second')
    // Il puzzle sulla scacchiera risulta gia' tra i problematici.
    expect(
      screen.getByRole('button', { name: itTranslations.savedPuzzle.saved }),
    ).toHaveAttribute('aria-pressed', 'true')
    savedPuzzleIds = new Set()
    practiceOnlySaved = false
  })

  it('saves the puzzle on the board with the bookmark button', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: startLabel }))

    fireEvent.click(screen.getByRole('button', { name: itTranslations.savedPuzzle.save }))
    expect(toggleSaved).toHaveBeenCalledWith({ puzzleId: 'first', saved: true })
  })
})

describe('TrainPage redo a puzzle', () => {
  beforeEach(() => {
    practiceAttempts = new Map()
    sessionPuzzles = [makePuzzleResult({ puzzleId: 'first', orderIndex: 1 })]
  })

  it('lets free practice redo a puzzle, but not the official session', () => {
    outcome = {
      status: 'next',
      data: {
        sessionPuzzleId: 'sp-1',
        round: 1,
        puzzle: makeLichessPuzzle({ puzzle_id: 'p1' }),
      },
    }
    const { unmount } = render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <TrainPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('puzzle-board')).toHaveAttribute('data-can-retry', 'no')
    unmount()

    outcome = { status: 'quota_reached', round: 1 }
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: startLabel }))
    expect(screen.getByTestId('puzzle-board')).toHaveAttribute('data-can-retry', 'yes')
  })
})
