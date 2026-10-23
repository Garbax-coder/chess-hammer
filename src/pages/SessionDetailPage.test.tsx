import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { makeLichessPuzzle, makePuzzleResult, makeSession } from '@/test/fixtures'
import type { PracticeAttempt } from '@/types/training'
import SessionDetailPage from './SessionDetailPage'

const t = itTranslations
const session = makeSession({ id: 's1', status: 'completed', current_round: 3 })
const puzzles = ['p1', 'p2', 'p3'].map((puzzleId, i) =>
  makePuzzleResult({ sessionPuzzleId: `sp-${i + 1}`, puzzleId, orderIndex: i + 1 }),
)
let practiceAttempts = new Map<string, PracticeAttempt[]>()
let onlySaved = false

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-session-history', () => ({
  useSessionDetail: () => ({ data: { session, puzzles }, isLoading: false }),
}))
vi.mock('@/hooks/use-practice', () => ({
  usePracticeAttempts: () => ({ data: practiceAttempts }),
  usePuzzleById: (puzzleId: string | undefined) => ({
    data: puzzleId ? makeLichessPuzzle({ puzzle_id: puzzleId }) : undefined,
  }),
  useRecordPracticeAttempt: () => ({ mutateAsync: async () => {}, isPending: false }),
}))
vi.mock('@/hooks/use-saved-puzzles', () => ({
  useSavedPuzzles: () => ({ data: new Set<string>() }),
  useToggleSavedPuzzle: () => ({ mutate: () => {} }),
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
      practice_only_saved: onlySaved,
    },
  }),
  useUpdateAutoAdvance: () => ({ mutate: () => {} }),
  useUpdatePracticeFilter: () => ({ mutate: () => {} }),
}))
vi.mock('@/components/editable-session-name', () => ({
  EditableSessionName: ({ fallback }: { fallback: string }) => <>{fallback}</>,
}))
vi.mock(import('@/components/puzzle-board'), async (importOriginal) => ({
  ...(await importOriginal()),
  PuzzleBoard: ({ puzzle }) => <div data-testid="puzzle-board">{puzzle.puzzle_id}</div>,
}))

function renderDetail() {
  render(
    <MemoryRouter initialEntries={['/sessions/s1']}>
      <Routes>
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function practice(puzzleId: string, sessionId: string, at: string): PracticeAttempt {
  return {
    id: `${puzzleId}-${at}`,
    user_id: 'user-1',
    puzzle_id: puzzleId,
    result: 'solved',
    time_seconds: 10,
    attempted_at: at,
    session_id: sessionId,
  }
}

describe('SessionDetailPage free practice', () => {
  beforeEach(() => {
    practiceAttempts = new Map()
    onlySaved = false
  })

  it('continues after the last puzzle practiced in this session', () => {
    practiceAttempts = new Map([['p2', [practice('p2', 's1', '2026-10-20T10:00:00Z')]]])
    renderDetail()

    fireEvent.click(screen.getByRole('button', { name: t.train.startPractice }))

    expect(screen.getByTestId('puzzle-board')).toHaveTextContent('p3')
  })

  it('starts from the first puzzle when nothing was practiced yet', () => {
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: t.train.startPractice }))
    expect(screen.getByTestId('puzzle-board')).toHaveTextContent('p1')
  })

  it('shows the practice filter before a puzzle is picked', () => {
    renderDetail()
    expect(
      screen.getByRole('switch', { name: t.train.failedPuzzles }),
    ).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: t.train.savedPuzzles })).toBeInTheDocument()
  })

  it('cannot start when the filter leaves no puzzle to practice', () => {
    onlySaved = true
    renderDetail()
    expect(screen.getByRole('button', { name: t.train.startPractice })).toBeDisabled()
    expect(screen.getByText(t.train.noSavedPuzzles)).toBeInTheDocument()
  })
})
