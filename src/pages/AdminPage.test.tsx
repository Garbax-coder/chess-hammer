import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminRoute } from '@/components/admin/admin-route'
import type { AdminBucket, AdminStats, AdminUserRow } from '@/lib/admin'
import { adminTranslations } from '@/lib/i18n/admin'
import { it as itTranslations } from '@/lib/i18n/translations'
import AdminPage from './AdminPage'

const a = adminTranslations.it
let authUser: { id: string; app_metadata: Record<string, unknown> } | null

vi.mock('@/lib/language-context', () => ({
  useLanguage: () => ({ t: itTranslations, language: 'it' }),
  useTranslations: () => itTranslations,
}))
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: authUser, session: authUser ? {} : null, loading: false }),
}))
// AdminRoute avvolge la pagina in ProtectedRoute: qui conta solo il controllo admin.
vi.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function bucket(start: string, values: Partial<AdminBucket> = {}): AdminBucket {
  return {
    start,
    signups: 0,
    session_attempts: 0,
    practice_attempts: 0,
    rounds_completed: 0,
    sessions_completed: 0,
    ...values,
  }
}

const stats: AdminStats = {
  generated_at: '2026-10-18T12:00:00Z',
  total_signups: 57,
  // Una registrazione nell'ultima ora.
  hourly: Array.from({ length: 24 }, (_, i) =>
    bucket(new Date(Date.UTC(2026, 9, 17, 13 + i)).toISOString(), {
      signups: i === 23 ? 1 : 0,
    }),
  ),
  // Ogni giorno 1 registrazione e 10 tentativi: 7 / 70 in settimana, 30 / 300 nel mese.
  daily: Array.from({ length: 30 }, (_, i) =>
    bucket(new Date(Date.UTC(2026, 8, 19 + i)).toISOString(), {
      signups: 1,
      session_attempts: 10,
    }),
  ),
}

const users: AdminUserRow[] = [
  {
    id: 'u-1',
    email: 'anna@example.com',
    providers: ['google'],
    created_at: '2026-10-01T10:00:00Z',
    email_confirmed_at: '2026-10-01T10:00:00Z',
    last_sign_in_at: '2026-10-17T09:30:00Z',
    last_activity_at: '2026-10-18T08:00:00Z',
    is_admin: true,
    language: 'it',
    current_elo: 1620,
    sessions_count: 2,
    active_session_round: 2,
  },
  {
    id: 'u-2',
    email: 'bruno@example.com',
    providers: ['email'],
    created_at: '2026-10-12T10:00:00Z',
    email_confirmed_at: null,
    last_sign_in_at: null,
    last_activity_at: '2026-10-12T10:00:00Z',
    is_admin: false,
    language: null,
    current_elo: 1500,
    sessions_count: 0,
    active_session_round: null,
  },
]

vi.mock('@/hooks/use-admin', () => ({
  useAdminStats: () => ({ data: stats, isLoading: false, isError: false }),
  useAdminUsers: () => ({ data: users, isLoading: false, isError: false }),
}))

function renderAdmin() {
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="/dashboard" element={<p>dashboard utente</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function metricCard(metric: keyof typeof a.metrics) {
  return screen.getByText(a.metrics[metric]).closest('[data-slot="card"]') as HTMLElement
}

function periodValue(card: HTMLElement, label: string) {
  return within(card).getByText(label).nextElementSibling?.textContent
}

describe('AdminPage', () => {
  beforeEach(() => {
    authUser = { id: 'u-1', app_metadata: { admin: true } }
  })

  it('sends non-administrators back to their dashboard', () => {
    authUser = { id: 'u-2', app_metadata: {} }
    renderAdmin()
    expect(screen.getByText('dashboard utente')).toBeInTheDocument()
    expect(screen.queryByText(a.title)).not.toBeInTheDocument()
  })

  it('shows every metric with its totals for day, week and month', () => {
    renderAdmin()

    for (const metric of Object.keys(a.metrics) as (keyof typeof a.metrics)[]) {
      expect(screen.getByText(a.metrics[metric])).toBeInTheDocument()
    }
    const signups = metricCard('signups')
    expect(periodValue(signups, a.period.day)).toBe('1')
    expect(periodValue(signups, a.period.week)).toBe('7')
    expect(periodValue(signups, a.period.month)).toBe('30')
    expect(periodValue(signups, a.totalLabel)).toBe('57')

    const attempts = metricCard('session_attempts')
    expect(periodValue(attempts, a.period.week)).toBe('70')
    expect(within(attempts).queryByText(a.totalLabel)).not.toBeInTheDocument()
  })

  it('redraws the charts for the selected period', () => {
    renderAdmin()
    const attempts = metricCard('session_attempts')
    // Settimana di default: 7 barre.
    expect(within(attempts).getAllByTestId('admin-bar')).toHaveLength(7)

    fireEvent.click(screen.getByRole('button', { name: a.period.month }))
    expect(within(attempts).getAllByTestId('admin-bar')).toHaveLength(30)

    fireEvent.click(screen.getByRole('button', { name: a.period.day }))
    expect(within(attempts).queryAllByTestId('admin-bar')).toHaveLength(0)
    expect(within(metricCard('signups')).getAllByTestId('admin-bar')).toHaveLength(1)
  })

  it('lists users with last login and a link to their read-only profile', () => {
    renderAdmin()
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row').slice(1)

    // Dal piu' recente: bruno si e' registrato dopo anna.
    expect(within(rows[0]).getByText('bruno@example.com')).toBeInTheDocument()
    expect(within(rows[0]).getByText(a.users.never)).toBeInTheDocument()
    expect(within(rows[0]).getByText(a.users.unconfirmed)).toBeInTheDocument()
    expect(within(rows[1]).getByText(a.users.admin)).toBeInTheDocument()
    expect(
      within(rows[1]).getByRole('link', { name: `${a.users.open}: anna@example.com` }),
    ).toHaveAttribute('href', '/admin/users/u-1')
  })

  it('filters the list by email and sorts it by last login', () => {
    renderAdmin()

    fireEvent.click(screen.getByRole('button', { name: a.users.sort.last_sign_in }))
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('anna@example.com')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox', { name: a.users.search }), {
      target: { value: 'bru' },
    })
    expect(screen.queryByText('anna@example.com')).not.toBeInTheDocument()
    expect(screen.getByText('bruno@example.com')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox', { name: a.users.search }), {
      target: { value: 'nessuno' },
    })
    expect(screen.getByText(a.users.empty)).toBeInTheDocument()
  })
})
