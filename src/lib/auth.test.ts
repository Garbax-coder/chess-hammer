import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const signInWithPassword = vi.fn()
const updateUser = vi.fn()
const signOut = vi.fn()
const signUp = vi.fn()
const resetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { signInWithPassword, updateUser, signOut, signUp, resetPasswordForEmail },
  },
}))

const {
  changePassword,
  requestPasswordReset,
  signInWithEmail,
  signOut: signOutUser,
  signUpWithEmail,
} = await import('./auth')
const { readSnapshot, writeSnapshot } = await import('./session-puzzles-snapshot')

describe('signOut', () => {
  it("deletes the local copy of the session puzzle list, so the next user of the browser can't read it", async () => {
    signOut.mockResolvedValue({ error: null })
    writeSnapshot('session-1', [])

    await signOutUser()

    expect(readSnapshot('session-1')).toBeNull()
    expect(signOut).toHaveBeenCalled()
  })
})

describe('signUpWithEmail', () => {
  it('passes the legal acceptance version as user metadata', async () => {
    signUp.mockResolvedValue({ data: {}, error: null })

    await signUpWithEmail('user@example.com', 'a long enough passphrase', '2026-10-04')

    expect(signUp).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'a long enough passphrase',
      options: { data: { legal_version: '2026-10-04' }, captchaToken: undefined },
    })
  })

  it('also passes a captcha token when given one', async () => {
    signUp.mockResolvedValue({ data: {}, error: null })

    await signUpWithEmail('user@example.com', 'a long enough passphrase', '2026-10-04', 'tok-1')

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.objectContaining({ captchaToken: 'tok-1' }) }),
    )
  })
})

describe('signInWithEmail', () => {
  it('omits captcha options when no token is given (CAPTCHA not configured)', async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null })

    await signInWithEmail('user@example.com', 'secret')

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
      options: undefined,
    })
  })

  it('passes the captcha token when given one', async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null })

    await signInWithEmail('user@example.com', 'secret', 'tok-2')

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
      options: { captchaToken: 'tok-2' },
    })
  })
})

describe('requestPasswordReset', () => {
  it('passes the captcha token through to resetPasswordForEmail', async () => {
    resetPasswordForEmail.mockResolvedValue({ data: {}, error: null })

    await requestPasswordReset('user@example.com', 'tok-3')

    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({ captchaToken: 'tok-3' }),
    )
  })
})

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
