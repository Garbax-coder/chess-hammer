import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

const { LanguageProvider } = await import('./language-context')

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
