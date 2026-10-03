import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const signInWithPassword = vi.fn()
const updateUser = vi.fn()
const signOut = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { signInWithPassword, updateUser, signOut } },
}))

const { changePassword } = await import('./auth')

describe('changePassword', () => {
  beforeEach(() => {
    signInWithPassword.mockReset()
    updateUser.mockReset()
    signOut.mockReset().mockResolvedValue({ error: null })
  })
  afterEach(() => vi.clearAllMocks())

  it('verifies the current password first, and never calls updateUser if it is wrong', async () => {
    signInWithPassword.mockResolvedValue({
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    })

    const result = await changePassword('user@example.com', 'wrong', 'NewPassword123!')

    expect(result).toEqual({
      ok: false,
      reason: 'wrong-current',
      message: 'Invalid login credentials',
    })
    expect(updateUser).not.toHaveBeenCalled()
  })

  it('reports a non-credential verification error as "other"', async () => {
    signInWithPassword.mockResolvedValue({
      error: { code: 'rate_limited', message: 'Too many requests' },
    })

    const result = await changePassword('user@example.com', 'whatever', 'NewPassword123!')

    expect(result).toEqual({ ok: false, reason: 'other', message: 'Too many requests' })
  })

  it('on success, updates the password and signs out other devices', async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    updateUser.mockResolvedValue({ error: null })

    const result = await changePassword('user@example.com', 'current', 'NewPassword123!')

    expect(result).toEqual({ ok: true })
    expect(updateUser).toHaveBeenCalledWith({ password: 'NewPassword123!' })
    expect(signOut).toHaveBeenCalledWith({ scope: 'others' })
  })

  it('reports an updateUser failure as "other" without crashing', async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    updateUser.mockResolvedValue({ error: { message: 'Password too weak' } })

    const result = await changePassword('user@example.com', 'current', 'weak')

    expect(result).toEqual({ ok: false, reason: 'other', message: 'Password too weak' })
    // La password non e' stata cambiata: non ha senso disconnettere gli altri dispositivi.
    expect(signOut).not.toHaveBeenCalled()
  })
})
