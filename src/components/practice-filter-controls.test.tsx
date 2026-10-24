import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { PracticeFilterControls } from './practice-filter-controls'

const t = itTranslations

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))

describe('PracticeFilterControls', () => {
  it('turns the failed and the problem puzzles filters on independently', () => {
    const update = vi.fn()
    render(
      <PracticeFilterControls
        filter={{ onlyFailed: false, scope: 'all', onlySaved: false }}
        update={update}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: t.train.savedPuzzles }))
    expect(update).toHaveBeenLastCalledWith({ practice_only_saved: true })
    fireEvent.click(screen.getByRole('button', { name: t.train.failedPuzzles }))
    expect(update).toHaveBeenLastCalledWith({ practice_only_failed: true })
    expect(screen.getByRole('button', { name: t.train.failedPuzzles })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    // Lo scope dei falliti compare solo col filtro dei falliti attivo.
    expect(
      screen.queryByRole('button', { name: t.train.failedScopeLastRound }),
    ).not.toBeInTheDocument()
  })

  it('shows both filters as on and the failed scope choice', () => {
    render(
      <PracticeFilterControls
        filter={{ onlyFailed: true, scope: 'lastRound', onlySaved: true }}
        update={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: t.train.failedPuzzles })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: t.train.savedPuzzles })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('button', { name: t.train.failedScopeLastRound }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('explains how to save problem puzzles when there are none', () => {
    render(
      <PracticeFilterControls
        filter={{ onlyFailed: false, scope: 'all', onlySaved: true }}
        update={() => {}}
        showNoSavedHint
      />,
    )
    expect(screen.getByText(t.train.noSavedPuzzles)).toBeInTheDocument()
  })
})
