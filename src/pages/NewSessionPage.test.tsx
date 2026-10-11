import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'

let activeSession: { id: string } | null = null
const createTrainingSession = vi.fn(async () => {
  activeSession = { id: 'new-session' }
  return activeSession
})

vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('@/lib/language-context', () => ({ useTranslations: () => itTranslations }))
vi.mock('@/lib/training-sessions', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/training-sessions')>()),
  fetchActiveSession: vi.fn(async () => activeSession),
  createTrainingSession,
}))

const { default: NewSessionPage } = await import('./NewSessionPage')

describe('NewSessionPage', () => {
  it('starts training right after creating the session, without passing by the dashboard', async () => {
    const dashboardRendered = vi.fn()
    function Dashboard() {
      dashboardRendered()
      return <p>dashboard</p>
    }
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/sessions/new']}>
          <Routes>
            <Route path="/sessions/new" element={<NewSessionPage />} />
            <Route path="/train" element={<p>allenamento</p>} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    fireEvent.click(
      await screen.findByRole('button', { name: itTranslations.newSession.start }),
    )

    await waitFor(() => expect(screen.getByText('allenamento')).toBeInTheDocument())
    expect(createTrainingSession).toHaveBeenCalledTimes(1)
    expect(dashboardRendered).not.toHaveBeenCalled()
  })
})
