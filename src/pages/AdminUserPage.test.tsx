import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AdminSessionPuzzle, AdminUserDetail } from '@/lib/admin'
import { adminTranslations } from '@/lib/i18n/admin'
import { it as itTranslations } from '@/lib/i18n/translations'
import AdminUserPage from './AdminUserPage'

const a = adminTranslations.it

vi.mock('@/lib/language-context', () => ({
  useLanguage: () => ({ t: itTranslations, language: 'it' }),
  useTranslations: () => itTranslations,
}))

const detail: AdminUserDetail = {
  account: {
    id: 'u-7',
    email: 'carla@example.com',
    providers: ['email', 'google'],
    created_at: '2026-09-01T10:00:00Z',
    email_confirmed_at: '2026-09-01T10:05:00Z',
    last_sign_in_at: '2026-10-17T09:30:00Z',
    last_activity_at: '2026-10-18T08:00:00Z',
    is_admin: false,
  },
  stats: {
    current_elo: 1712,
    rating_deviation: 61.4,
    puzzles_solved: 120,
    puzzles_failed: 30,
    auto_advance: true,
    language: 'it',
    board_theme: 'classic',
    piece_set: 'cburnett',
    app_style: 'sage',
    practice_only_failed: true,
    practice_failed_scope: 'last',
    legal_version: '2026-10-11',
    legal_accepted_at: '2026-10-12T08:00:00Z',
    updated_at: '2026-10-18T08:00:00Z',
  },
  sessions: [
    {
      id: 's-1',
      name: 'Tattiche autunno',
      status: 'in_progress',
      total_puzzles: 150,
      current_round: 2,
      daily_target_round1: 10,
      daily_target_round2: 20,
      daily_target_round3: 40,
      rest_days: 2,
      resting_until: null,
      puzzle_themes: null,
      created_at: '2026-09-02T10:00:00Z',
      completed_at: null,
      pool_size: 150,
      rounds: [
        {
          round: 1,
          attempted: 150,
          solved: 110,
          last_attempt_at: '2026-10-01T10:00:00Z',
        },
        { round: 2, attempted: 40, solved: 35, last_attempt_at: '2026-10-18T08:00:00Z' },
      ],
    },
  ],
  elo_history: [
    { attempted_at: '2026-09-02T10:00:00Z', elo_after: 1500 },
    { attempted_at: '2026-10-01T10:00:00Z', elo_after: 1712 },
  ],
  practice: {
    attempted: 3,
    solved: 2,
    recent: [
      {
        puzzle_id: 'qdQBJ',
        result: 'failed',
        time_seconds: 31.6,
        attempted_at: '2026-10-18T07:00:00Z',
      },
    ],
  },
}

const puzzles: AdminSessionPuzzle[] = [
  {
    session_puzzle_id: 'sp-1',
    order_index: 1,
    puzzle_id: 'abc12',
    rating: 1650,
    themes: ['fork'],
    attempts: [
      {
        round_number: 1,
        result: 'solved',
        time_seconds: 12,
        elo_before: 1500,
        elo_after: 1510,
        attempted_at: '2026-09-02T10:00:00Z',
      },
      {
        round_number: 2,
        result: 'failed',
        time_seconds: 40,
        elo_before: 1600,
        elo_after: 1600,
        attempted_at: '2026-10-10T10:00:00Z',
      },
    ],
  },
]

const sessionPuzzlesRequested = vi.fn()
vi.mock('@/hooks/use-admin', () => ({
  useAdminUserDetail: (id: string) => ({
    data: id === 'u-7' ? detail : undefined,
    isLoading: false,
    isError: id !== 'u-7',
  }),
  useAdminSessionPuzzles: (sessionId: string) => {
    sessionPuzzlesRequested(sessionId)
    return { data: puzzles, isLoading: false, isError: false }
  },
}))

function renderUser(id: string) {
  render(
    <MemoryRouter initialEntries={[`/admin/users/${id}`]}>
      <Routes>
        <Route path="/admin/users/:id" element={<AdminUserPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminUserPage', () => {
  it('shows the account in read-only mode, with no form controls', () => {
    renderUser('u-7')

    expect(screen.getByRole('heading', { name: 'carla@example.com' })).toBeInTheDocument()
    expect(screen.getByText(a.user.readOnly('carla@example.com'))).toBeInTheDocument()
    expect(screen.getByText(a.user.rating(1712, 61.4))).toBeInTheDocument()
    expect(screen.getByText(a.user.solvedFailed(120, 30))).toBeInTheDocument()
    expect(screen.getByText('email, google')).toBeInTheDocument()
    expect(screen.getByText(a.user.practiceOnlyFailed('last'))).toBeInTheDocument()
    expect(screen.getByText(a.user.practiceSummary(3, 2))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'qdQBJ' })).toHaveAttribute(
      'href',
      'https://lichess.org/training/qdQBJ',
    )
    // Sola lettura: nessun campo modificabile, solo il pulsante per espandere.
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(screen.queryAllByRole('switch')).toHaveLength(0)
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      a.user.showPuzzles,
    ])
  })

  it('shows round progress and loads the session puzzles on request', () => {
    renderUser('u-7')

    expect(screen.getByText('Tattiche autunno')).toBeInTheDocument()
    expect(screen.getByText(a.user.roundProgress(1, 150, 150, 110))).toBeInTheDocument()
    expect(screen.getByText(a.user.roundProgress(2, 40, 150, 35))).toBeInTheDocument()
    expect(sessionPuzzlesRequested).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: a.user.showPuzzles }))

    expect(sessionPuzzlesRequested).toHaveBeenCalledWith('s-1')
    const row = screen.getByRole('link', { name: 'abc12' }).closest('tr') as HTMLElement
    expect(within(row).getByText('1650')).toBeInTheDocument()
    expect(within(row).getByText(a.user.solved)).toBeInTheDocument()
    expect(within(row).getByText(a.user.failed)).toBeInTheDocument()
    expect(within(row).getByText(a.user.seconds(40))).toBeInTheDocument()
  })

  it('reports an unknown user', () => {
    renderUser('missing')
    expect(screen.getByText(a.user.notFound)).toBeInTheDocument()
  })
})
