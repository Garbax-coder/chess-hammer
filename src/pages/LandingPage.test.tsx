import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { loadLanguage } from '@/lib/i18n/load-language'
import { marketingCopy } from '@/lib/i18n/marketing'
import { it as itTranslations } from '@/lib/i18n/translations'

let session: object | null = null
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ session, user: null }) }))
vi.mock('@/lib/language-context', () => ({ useTranslations: () => itTranslations }))
vi.mock('@/hooks/use-app-style', () => ({ useAppStyle: () => 'sage' }))

const { default: LandingPage } = await import('./LandingPage')

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<LandingPage lang="it" />} />
        <Route path="/fr" element={<LandingPage lang="fr" />} />
        <Route path="/dashboard" element={<p>dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  beforeAll(() => loadLanguage('fr'))

  it('shows the home page to visitors', () => {
    session = null
    renderAt('/')
    expect(
      screen.getByRole('heading', { level: 1, name: marketingCopy.it.landing.title }),
    ).toBeInTheDocument()
  })

  it('sends signed-in users straight to the dashboard, in every language', () => {
    session = { access_token: 'x' }
    for (const path of ['/', '/fr']) {
      const view = renderAt(path)
      expect(screen.getByText('dashboard')).toBeInTheDocument()
      view.unmount()
    }
  })

  it('stays on the home page right after an account deletion', () => {
    session = { access_token: 'x' }
    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: { signedOut: true } }]}>
        <Routes>
          <Route path="/" element={<LandingPage lang="it" />} />
          <Route path="/dashboard" element={<p>dashboard</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
  })
})
