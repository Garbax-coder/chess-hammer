import { beforeAll, describe, expect, it } from 'vitest'
import { loadLanguage } from './load-language'
import { marketingCopy } from './marketing'
import { LANGUAGES } from './translations'

// Come translations.test.ts: controlla che le due lingue abbiano la stessa
// struttura (anche il numero di voci negli elenchi), non il testo.
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, v]) =>
    keyPaths(v, prefix ? `${prefix}.${key}` : key),
  )
}

describe('marketingCopy', () => {
  beforeAll(() => Promise.all(LANGUAGES.map(loadLanguage)))

  it.each(LANGUAGES.filter((lang) => lang !== 'it'))(
    '%s has the same keys and list lengths as it',
    (lang) => {
      expect(keyPaths(marketingCopy[lang]).sort()).toEqual(
        keyPaths(marketingCopy.it).sort(),
      )
    },
  )

  it('has no empty strings', () => {
    for (const lang of LANGUAGES) {
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
    for (const lang of LANGUAGES) {
      for (const { title, description } of Object.values(marketingCopy[lang].seo)) {
        expect(title.length, title).toBeLessThanOrEqual(70)
        expect(description.length, description).toBeGreaterThanOrEqual(70)
        expect(description.length, description).toBeLessThanOrEqual(160)
      }
    }
  })
})
