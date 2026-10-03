import { afterEach, describe, expect, it, vi } from 'vitest'
import { findPasswordProblem, MIN_PASSWORD_LENGTH } from './password-policy'

// Stesso calcolo (Web Crypto, SHA-1 esadecimale maiuscolo) usato dal modulo
// sotto test: serve a costruire nei test un suffisso che coincida davvero
// con quello che findPasswordProblem invierebbe all'API.
async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('findPasswordProblem', () => {
  it('rejects a password shorter than the minimum, before any network call', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const problem = await findPasswordProblem('a'.repeat(MIN_PASSWORD_LENGTH - 1))

    expect(problem).toBe('tooShort')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('accepts a password exactly at the minimum length (not breached)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('') }),
    )
    const problem = await findPasswordProblem('a'.repeat(MIN_PASSWORD_LENGTH))
    expect(problem).toBeNull()
  })

  it('rejects a password equal to the email address', async () => {
    const problem = await findPasswordProblem('user@example.com', 'User@Example.com')
    expect(problem).toBe('sameAsEmail')
  })

  it('rejects a password equal to the local part of the email', async () => {
    const problem = await findPasswordProblem('longenoughuser', 'longenoughuser@example.com')
    expect(problem).toBe('sameAsEmail')
  })

  it('flags a password found in the k-anonymity range response', async () => {
    const password = 'correct horse battery staple'
    const hash = await sha1Hex(password)
    const suffix = hash.slice(5)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(`AAAA0:0\n${suffix}:37\nBBBB0:0`),
      }),
    )

    const problem = await findPasswordProblem(password)

    expect(problem).toBe('breached')
  })

  it('sends only the 5-char hash prefix to the API, never the password', async () => {
    const password = 'a fully unrelated test passphrase'
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, text: () => Promise.resolve('') })
    vi.stubGlobal('fetch', fetchSpy)

    await findPasswordProblem(password)

    const [url] = fetchSpy.mock.calls[0]
    expect(url).toBe(`https://api.pwnedpasswords.com/range/${prefix}`)
    expect(url).not.toContain(password)
  })

  it('treats a count of 0 (padding row) as not breached', async () => {
    const password = 'another long enough passphrase'
    const hash = await sha1Hex(password)
    const suffix = hash.slice(5)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(`${suffix}:0`) }),
    )

    expect(await findPasswordProblem(password)).toBeNull()
  })

  it('fails open (lets the password through) when the API errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('') }))
    expect(await findPasswordProblem('some long enough passphrase')).toBeNull()
  })

  it('fails open when the network request rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    expect(await findPasswordProblem('some long enough passphrase')).toBeNull()
  })
})
