import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import {
  bucketsFor,
  filterAndSortUsers,
  isAdminUser,
  periodTotal,
  type AdminBucket,
  type AdminStats,
  type AdminUserRow,
} from './admin'

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

// 30 giorni: il giorno i (0 = 30 giorni fa, 29 = oggi) ha i+1 tentativi.
const stats: AdminStats = {
  generated_at: '2026-10-18T12:00:00Z',
  total_signups: 42,
  hourly: Array.from({ length: 24 }, (_, i) =>
    bucket(`2026-10-17T${String(i).padStart(2, '0')}:00:00Z`, {
      signups: i === 23 ? 2 : 0,
    }),
  ),
  daily: Array.from({ length: 30 }, (_, i) =>
    bucket(`day-${i}`, { session_attempts: i + 1, signups: i === 0 ? 5 : 0 }),
  ),
}

describe('isAdminUser', () => {
  it('is true only when app_metadata.admin is exactly true', () => {
    expect(isAdminUser({ app_metadata: { admin: true } } as unknown as User)).toBe(true)
    expect(isAdminUser({ app_metadata: { admin: 'true' } } as unknown as User)).toBe(
      false,
    )
    // user_metadata la scrive l'utente stesso: non deve contare.
    expect(
      isAdminUser({
        app_metadata: {},
        user_metadata: { admin: true },
      } as unknown as User),
    ).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })
})

describe('admin stats periods', () => {
  it('uses 24 hourly buckets, the last 7 days or all 30 days', () => {
    expect(bucketsFor(stats, 'day')).toHaveLength(24)
    expect(bucketsFor(stats, 'week').map((b) => b.start)).toEqual(
      Array.from({ length: 7 }, (_, i) => `day-${23 + i}`),
    )
    expect(bucketsFor(stats, 'month')).toHaveLength(30)
  })

  it('sums the chart buckets for the period totals', () => {
    expect(periodTotal(stats, 'signups', 'day')).toBe(2)
    expect(periodTotal(stats, 'session_attempts', 'week')).toBe(
      24 + 25 + 26 + 27 + 28 + 29 + 30,
    )
    expect(periodTotal(stats, 'session_attempts', 'month')).toBe((30 * 31) / 2)
    expect(periodTotal(stats, 'signups', 'month')).toBe(5)
  })
})

describe('filterAndSortUsers', () => {
  function user(email: string, created: string, lastSignIn: string | null): AdminUserRow {
    return {
      id: email,
      email,
      providers: ['email'],
      created_at: created,
      email_confirmed_at: created,
      last_sign_in_at: lastSignIn,
      last_activity_at: lastSignIn,
      is_admin: false,
      language: 'it',
      current_elo: 1500,
      sessions_count: 0,
      active_session_round: null,
    }
  }
  const users = [
    user('anna@example.com', '2026-10-01T00:00:00Z', '2026-10-17T00:00:00Z'),
    user('bruno@example.com', '2026-10-10T00:00:00Z', null),
    user('carla@Example.com', '2026-10-05T00:00:00Z', '2026-10-18T00:00:00Z'),
  ]

  it('sorts by sign-up date, newest first', () => {
    expect(filterAndSortUsers(users, '', 'created').map((u) => u.email)).toEqual([
      'bruno@example.com',
      'carla@Example.com',
      'anna@example.com',
    ])
  })

  it('sorts by last login, never-logged-in users last', () => {
    expect(filterAndSortUsers(users, '', 'last_sign_in').map((u) => u.email)).toEqual([
      'carla@Example.com',
      'anna@example.com',
      'bruno@example.com',
    ])
  })

  it('filters by email ignoring case and surrounding spaces', () => {
    expect(filterAndSortUsers(users, '  EXAMPLE.COM ', 'created')).toHaveLength(3)
    expect(filterAndSortUsers(users, 'car', 'created').map((u) => u.email)).toEqual([
      'carla@Example.com',
    ])
  })
})
