/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Le intestazioni di sicurezza stanno in vercel.json, fuori dal codice: questi
// controlli evitano che una modifica a index.html o ai servizi usati le renda
// sbagliate senza che nessuno se ne accorga (la pagina smetterebbe di
// funzionare solo in produzione).
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[]
}
const csp =
  vercel.headers
    .find((rule) => rule.source === '/(.*)')
    ?.headers.find((h) => h.key === 'Content-Security-Policy')?.value ?? ''

function directive(name: string): string[] {
  const entry = csp
    .split(';')
    .map((d) => d.trim().split(/\s+/))
    .find(([n]) => n === name)
  return entry?.slice(1) ?? []
}

describe('vercel.json security headers', () => {
  it('allows exactly the inline scripts of index.html by hash', () => {
    const html = readFileSync('index.html', 'utf8')
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
      ([, code]) => `'sha256-${createHash('sha256').update(code).digest('base64')}'`,
    )
    expect(inline.length).toBeGreaterThan(0)
    const allowedHashes = directive('script-src').filter((s) => s.startsWith("'sha256-"))
    expect(allowedHashes.sort()).toEqual(inline.sort())
  })

  it('lets the app reach the services it uses', () => {
    expect(directive('connect-src')).toEqual(
      expect.arrayContaining([
        'https://*.supabase.co',
        'https://api.pwnedpasswords.com',
        'https://*.ingest.de.sentry.io',
      ]),
    )
    expect(directive('script-src')).toEqual(
      expect.arrayContaining(["'wasm-unsafe-eval'", 'https://challenges.cloudflare.com']),
    )
    expect(directive('frame-src')).toContain('https://challenges.cloudflare.com')
  })

  it('forbids framing and plugins', () => {
    expect(directive('frame-ancestors')).toEqual(["'none'"])
    expect(directive('object-src')).toEqual(["'none'"])
  })
})
