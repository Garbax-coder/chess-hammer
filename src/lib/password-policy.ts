export const MIN_PASSWORD_LENGTH = 10

export type PasswordProblem = 'tooShort' | 'sameAsEmail' | 'breached'

async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

// Have I Been Pwned (k-anonymity): al servizio arrivano solo i primi 5
// caratteri dell'hash SHA-1, mai la password ne' il suo hash completo.
// "Add-Padding" aggiunge righe finte (conteggio 0) cosi' la dimensione della
// risposta non rivela quante password condividono il prefisso.
// Se il servizio non risponde si lascia passare: e' una protezione in piu',
// non deve impedire di registrarsi.
async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return false
    const body = await res.text()
    return body.split('\n').some((line) => {
      const [lineSuffix, count] = line.trim().split(':')
      return lineSuffix === suffix && Number(count) > 0
    })
  } catch {
    return false
  }
}

export async function findPasswordProblem(
  password: string,
  email?: string | null,
): Promise<PasswordProblem | null> {
  if (password.length < MIN_PASSWORD_LENGTH) return 'tooShort'

  if (email) {
    const lower = password.toLowerCase()
    const address = email.toLowerCase()
    if (lower === address || lower === address.split('@')[0]) return 'sameAsEmail'
  }

  if (await isPasswordBreached(password)) return 'breached'
  return null
}
