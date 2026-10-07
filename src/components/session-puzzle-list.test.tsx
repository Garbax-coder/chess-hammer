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

  it('scrolls the active puzzle into view even while training the current round (not practice mode)', () => {
    // Regressione: lo scroll era gated da canPractice, quindi durante un
    // giro attivo (canPractice=false) il puzzle corrente non veniva mai
    // portato in vista nei giri 2/3, dove non c'e' l'inserimento di un
    // nuovo puzzle in cima a "salvare" la situazione come nel giro 1.
    // jsdom non ha un vero layout: si simula un riquadro con la riga
    // attiva fuori vista (top 500) per far calcolare al componente un
    // nuovo scrollTop diverso da zero.
    const p1 = makePuzzleResult({ sessionPuzzleId: 'p1', orderIndex: 1 })
    const p2 = makePuzzleResult({ sessionPuzzleId: 'p2', orderIndex: 2 })

    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = vi.fn(function (this: HTMLElement) {
      const top = this.hasAttribute('data-session-puzzle-id') ? 500 : 0
      return { top, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} }
    })

    try {
      const { container } = render(
        <SessionPuzzleList
          puzzles={[p1, p2]}
          activeSessionPuzzleId="p1"
          currentRound={2}
          practiceAttemptsByPuzzle={new Map()}
          canPractice={false}
          onSelectPuzzle={() => {}}
        />,
      )

      const scrollContainer = container.querySelector('.overflow-y-auto') as HTMLElement
      expect(scrollContainer.scrollTop).toBe(500)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect
    }
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
