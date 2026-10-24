import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { ThemePuzzle } from '@/lib/theme-puzzles'
import { makePuzzleResult } from '@/test/fixtures'
import type { PracticeAttempt } from '@/types/training'
import ThemePracticePage from './ThemePracticePage'

const t = itTranslations
let puzzles: ThemePuzzle[] = []
let practiceAttempts = new Map<string, PracticeAttempt[]>()
const recordPractice = vi.fn(async () => {})
const themePuzzlesCalls: [string | undefined, string][] = []

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-theme-puzzles', () => ({
  useThemePuzzles: (theme: string | undefined, source: string) => {
    themePuzzlesCalls.push([theme, source])
    return { data: puzzles, isLoading: false }
  },
}))
vi.mock('@/hooks/use-practice', () => ({
  usePracticeAttempts: () => ({ data: practiceAttempts }),
  useRecordPracticeAttempt: () => ({ mutateAsync: recordPractice, isPending: false }),
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
      practice_only_saved: false,
    },
  }),
  useUpdateAutoAdvance: () => ({ mutate: () => {} }),
  useUpdatePracticeFilter: () => ({ mutate: () => {} }),
}))
vi.mock(import('@/components/puzzle-board'), async (importOriginal) => ({
  ...(await importOriginal()),
  PuzzleBoard: ({
    puzzle,
    onComplete,
  }: {
    puzzle: { puzzle_id: string }
    onComplete: (result: 'solved' | 'failed', timeSeconds: number) => void
  }) => (
    <div data-testid="puzzle-board">
      {puzzle.puzzle_id}
      <button onClick={() => onComplete('failed', 7)}>finish</button>
    </div>
  ),
}))

function themePuzzle(
  puzzleId: string,
  index: number,
  sessionId: string | null,
): ThemePuzzle {
  return {
    ...makePuzzleResult({
      sessionPuzzleId: `sp-${puzzleId}`,
      puzzleId,
      orderIndex: index,
    }),
    sessionId,
  }
}

function renderPage(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/stats/themes/:theme" element={<ThemePracticePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ThemePracticePage', () => {
  beforeEach(() => {
    puzzles = [themePuzzle('p1', 1, 's1'), themePuzzle('p2', 2, 's2')]
    practiceAttempts = new Map()
    themePuzzlesCalls.length = 0
    recordPractice.mockClear()
  })

  it('lists the puzzles of the category from the chosen statistics tab', () => {
    renderPage('/stats/themes/fork?source=practice')

    expect(themePuzzlesCalls.at(-1)).toEqual(['fork', 'practice'])
    expect(
      screen.getByText(t.themePractice.title(t.puzzleThemes.labels.fork)),
    ).toBeInTheDocument()
    expect(screen.getByText(t.themePractice.subtitle(2, 'practice'))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.themePractice.back })).toHaveAttribute(
      'href',
      '/stats?tab=practice',
    )
    expect(screen.getByText(t.themePractice.listTitle)).toBeInTheDocument()
    expect(screen.getByText(t.themePractice.hint)).toBeInTheDocument()
  })

  it('practices in order and records each attempt in the session of its puzzle', async () => {
    renderPage('/stats/themes/fork')
    expect(themePuzzlesCalls.at(-1)).toEqual(['fork', 'training'])

    fireEvent.click(screen.getByRole('button', { name: t.train.startPractice }))
    expect(screen.getByTestId('puzzle-board')).toHaveTextContent('p1')

    fireEvent.click(screen.getByRole('button', { name: 'finish' }))
    expect(recordPractice).toHaveBeenCalledWith({
      puzzleId: 'p1',
      result: 'failed',
      timeSeconds: 7,
      sessionId: 's1',
    })
  })

  it('continues after the last puzzle practiced in the list', () => {
    practiceAttempts = new Map([
      [
        'p1',
        [
          {
            id: 'a1',
            user_id: 'u1',
            puzzle_id: 'p1',
            result: 'solved',
            time_seconds: 5,
            attempted_at: '2026-10-20T10:00:00Z',
            session_id: 'another-session',
          },
        ],
      ],
    ])
    renderPage('/stats/themes/fork')

    fireEvent.click(screen.getByRole('button', { name: t.train.startPractice }))
    expect(screen.getByTestId('puzzle-board')).toHaveTextContent('p2')
  })

  it('says when the category has no puzzles', () => {
    puzzles = []
    renderPage('/stats/themes/fork')
    expect(screen.getByText(t.themePractice.empty)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: t.train.startPractice }),
    ).not.toBeInTheDocument()
  })
})
