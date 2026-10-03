import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { makePuzzleResult, withAttempt } from '@/test/fixtures'
import { it as itTranslations } from '@/lib/i18n/translations'
import { SessionPuzzleList } from './session-puzzle-list'

// I componenti leggono le stringhe con useTranslations(), che normalmente
// viene da LanguageProvider (a sua volta dentro AuthProvider + react-query).
// Mockare qui il solo hook isola il test della UI dalla catena di provider,
// senza bisogno di un client Supabase o di QueryClientProvider finti.
vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))

describe('SessionPuzzleList', () => {
  it('shows the "last session" badge only on puzzles from the most recent training day, in practice mode', () => {
    const today = withAttempt(
      makePuzzleResult({ sessionPuzzleId: 'today', orderIndex: 2, rating: 1200 }),
      1,
      'solved',
      '2026-09-20T10:00:00Z',
    )
    const older = withAttempt(
      makePuzzleResult({ sessionPuzzleId: 'older', orderIndex: 1, rating: 1100 }),
      1,
      'failed',
      '2026-09-10T10:00:00Z',
    )

    render(
      <SessionPuzzleList
        puzzles={[older, today]}
        activeSessionPuzzleId={null}
        currentRound={1}
        practiceAttemptsByPuzzle={new Map()}
        canPractice
        onSelectPuzzle={() => {}}
      />,
    )

    const badges = screen.getAllByText(itTranslations.sessionPuzzleList.lastSessionBadge)
    expect(badges).toHaveLength(1)
  })

  it('does not show the badge while training the current round (not practice mode)', () => {
    const today = withAttempt(
      makePuzzleResult({ sessionPuzzleId: 'today', orderIndex: 1 }),
      1,
      'solved',
      '2026-09-20T10:00:00Z',
    )

    render(
      <SessionPuzzleList
        puzzles={[today]}
        activeSessionPuzzleId={null}
        currentRound={1}
        practiceAttemptsByPuzzle={new Map()}
        canPractice={false}
        onSelectPuzzle={() => {}}
      />,
    )

    expect(
      screen.queryByText(itTranslations.sessionPuzzleList.lastSessionBadge),
    ).not.toBeInTheDocument()
  })

  it('never reorders the list: puzzles always render most recent order_index first', () => {
    const p1 = makePuzzleResult({ sessionPuzzleId: 'p1', orderIndex: 1 })
    const p2 = makePuzzleResult({ sessionPuzzleId: 'p2', orderIndex: 2 })
    const p3 = makePuzzleResult({ sessionPuzzleId: 'p3', orderIndex: 3 })

    // L'attivo e' p1 (in fondo all'ordine normale): non deve saltare in
    // cima alla lista, solo lo scroll porta il suo riquadro in vista (non
    // verificabile in jsdom, che non ha un vero layout — vedi il test
    // dedicato nel browser).
    const { container } = render(
      <SessionPuzzleList
        puzzles={[p1, p2, p3]}
        activeSessionPuzzleId="p1"
        currentRound={1}
        practiceAttemptsByPuzzle={new Map()}
        canPractice
        onSelectPuzzle={() => {}}
      />,
    )

    const ids = [...container.querySelectorAll('[data-session-puzzle-id]')].map((el) =>
      el.getAttribute('data-session-puzzle-id'),
    )
    expect(ids).toEqual(['p3', 'p2', 'p1'])
  })

  it('shows the empty-state message when there are no puzzles', () => {
    render(
      <SessionPuzzleList
        puzzles={[]}
        activeSessionPuzzleId={null}
        currentRound={1}
        practiceAttemptsByPuzzle={new Map()}
        canPractice={false}
        onSelectPuzzle={() => {}}
      />,
    )

    expect(screen.getByText(itTranslations.sessionPuzzleList.empty)).toBeInTheDocument()
  })
})
