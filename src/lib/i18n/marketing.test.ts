import { describe, expect, it } from 'vitest'
import { marketingCopy } from './marketing'

// Come translations.test.ts: controlla che le due lingue abbiano la stessa
// struttura (anche il numero di voci negli elenchi), non il testo.
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, v]) =>
    keyPaths(v, prefix ? `${prefix}.${key}` : key),
  )
}

describe('marketingCopy', () => {
  it('it and en have the same keys and list lengths', () => {
    expect(keyPaths(marketingCopy.it).sort()).toEqual(keyPaths(marketingCopy.en).sort())
  })

  it('has no empty strings', () => {
    for (const lang of ['it', 'en'] as const) {
      const empty = keyPaths(marketingCopy[lang]).filter((path) => {
        const value = path
          .split('.')
          .reduce<unknown>(
            (acc, k) => (acc as Record<string, unknown>)[k],
            marketingCopy[lang],
          )
        return typeof value === 'string' && value.trim() === ''
      })
      expect(empty, lang).toEqual([])
    }
  })

  it('keeps search titles and descriptions within what results pages show', () => {
    for (const lang of ['it', 'en'] as const) {
      for (const { title, description } of Object.values(marketingCopy[lang].seo)) {
        expect(title.length, title).toBeLessThanOrEqual(70)
        expect(description.length, description).toBeGreaterThanOrEqual(70)
        expect(description.length, description).toBeLessThanOrEqual(160)
      }
    }
  })
})
