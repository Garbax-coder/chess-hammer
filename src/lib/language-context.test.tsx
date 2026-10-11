import { fireEvent, render, waitFor } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const saveEmailLanguage = vi.fn(() => Promise.resolve({ error: null }))
let user: { id: string; user_metadata: Record<string, unknown> } | null = null
let stats: { language: string | null } | undefined

vi.mock('@/lib/auth', () => ({ saveEmailLanguage }))
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user }) }))
vi.mock('@/hooks/use-user-stats', () => ({
  useUserStats: () => ({ data: stats }),
  useUpdateLanguage: () => ({ mutate: vi.fn() }),
}))

const { LanguageProvider, useLanguage } = await import('./language-context')

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <LanguageProvider>
        <p>app</p>
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('LanguageProvider email language', () => {
  beforeEach(() => {
    localStorage.clear()
    saveEmailLanguage.mockClear()
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
  })

  it('saves the preferred language on the account for auth emails', async () => {
    user = { id: 'u1', user_metadata: {} }
    stats = { language: 'de' }
    renderProvider()
    await waitFor(() => expect(saveEmailLanguage).toHaveBeenCalledWith('de'))
    expect(saveEmailLanguage).not.toHaveBeenCalledWith('en')
  })

  it('falls back to the language in use when none was chosen', async () => {
    user = { id: 'u1', user_metadata: {} }
    stats = { language: null }
    renderProvider()
    await waitFor(() => expect(saveEmailLanguage).toHaveBeenCalledWith('en'))
  })

  it('does nothing when the account already has it, or before stats load', async () => {
    user = { id: 'u1', user_metadata: { language: 'it' } }
    stats = { language: 'it' }
    renderProvider()
    user = { id: 'u2', user_metadata: {} }
    stats = undefined
    renderProvider()
    await new Promise((r) => setTimeout(r, 20))
    expect(saveEmailLanguage).not.toHaveBeenCalled()
  })

  it('does nothing when signed out', async () => {
    user = null
    stats = undefined
    renderProvider()
    await new Promise((r) => setTimeout(r, 20))
    expect(saveEmailLanguage).not.toHaveBeenCalled()
  })
})

function ShowLanguage() {
  const { language, t } = useLanguage()
  return (
    <>
      <p data-testid="lang">{language}</p>
      <p>{t.login.title}</p>
      <Link to="/login">login</Link>
    </>
  )
}

describe('LanguageProvider language of public pages', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
  })

  function visit(path: string) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <LanguageProvider>
          <ShowLanguage />
        </LanguageProvider>
      </MemoryRouter>,
    )
  }

  it('keeps the language of the public page when moving on to login', async () => {
    user = null
    stats = undefined
    const view = visit('/fr')
    await waitFor(() => expect(view.getByTestId('lang').textContent).toBe('fr'))
    fireEvent.click(view.getByText('login'))
    await waitFor(() => expect(view.getByText('Connexion')).toBeInTheDocument())
    expect(view.getByTestId('lang').textContent).toBe('fr')
  })

  it('remembers it for the next visit straight to login', async () => {
    user = null
    stats = undefined
    const first = visit('/de')
    await waitFor(() => expect(first.getByTestId('lang').textContent).toBe('de'))
    first.unmount()
    const second = visit('/login')
    await waitFor(() => expect(second.getByTestId('lang').textContent).toBe('de'))
  })

  it('lets the language saved in the account win inside the app', async () => {
    user = { id: 'u1', user_metadata: { language: 'it' } }
    stats = { language: 'it' }
    const view = visit('/es')
    await waitFor(() => expect(view.getByTestId('lang').textContent).toBe('es'))
    fireEvent.click(view.getByText('login'))
    await waitFor(() => expect(view.getByTestId('lang').textContent).toBe('it'))
  })
})
