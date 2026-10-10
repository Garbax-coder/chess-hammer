import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { AppShell } from './app-shell'

vi.mock('@/lib/language-context', () => ({
  useLanguage: () => ({ t: itTranslations }),
  useTranslations: () => itTranslations,
}))
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('@/hooks/use-app-style', () => ({ useAppStyle: () => 'sage' }))

// Lo sforamento in larghezza su telefono non e' verificabile in jsdom (nessun
// layout): qui si controlla il menu che sostituisce le voci sotto sm:.
describe('AppShell mobile menu', () => {
  it('lists the navigation links and closes when one is chosen', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p>contenuto</p>
        </AppShell>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: itTranslations.nav.menu }))
    const menu = screen.getByRole('dialog')
    const links = within(menu)
      .getAllByRole('link')
      .map((a) => a.textContent)
    expect(links).toEqual([
      itTranslations.nav.dashboard,
      itTranslations.nav.train,
      itTranslations.nav.history,
      itTranslations.nav.faq,
    ])

    fireEvent.click(within(menu).getByRole('link', { name: itTranslations.nav.history }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
