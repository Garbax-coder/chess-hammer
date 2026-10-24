import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { PracticeSettingsMenu } from './practice-settings-menu'

const t = itTranslations
const updateAutoAdvance = vi.fn()
const setSound = vi.fn()

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
}))
vi.mock('@/hooks/use-user-stats', () => ({
  useUserStats: () => ({ data: { auto_advance: true } }),
  useUpdateAutoAdvance: () => ({ mutate: updateAutoAdvance }),
}))
vi.mock('@/hooks/use-sound-enabled', () => ({
  useSoundEnabled: () => ({ enabled: false, setEnabled: setSound }),
}))

describe('PracticeSettingsMenu', () => {
  it('keeps auto-advance and sounds behind the settings button', () => {
    render(<PracticeSettingsMenu />)
    expect(
      screen.queryByRole('switch', { name: t.train.autoAdvance }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: t.train.settings }))

    const autoAdvance = screen.getByRole('switch', { name: t.train.autoAdvance })
    expect(autoAdvance).toBeChecked()
    fireEvent.click(autoAdvance)
    expect(updateAutoAdvance).toHaveBeenCalledWith(false)

    const sounds = screen.getByRole('switch', { name: t.train.soundEnabled })
    expect(sounds).not.toBeChecked()
    fireEvent.click(sounds)
    expect(setSound).toHaveBeenCalledWith(true)
  })
})
