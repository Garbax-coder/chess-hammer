import { describe, expect, it } from 'vitest'
import { en, it as itTranslations } from './translations'

// Non verifica il TESTO (quello e' compito del parlante), ma che le due
// lingue restino STRUTTURALMENTE allineate: una chiave aggiunta/rimossa in
// una lingua e dimenticata nell'altra altrimenti passa inosservata finche'
// qualcuno non apre l'app in quella lingua e trova una stringa mancante.
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'function') return [prefix]
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, v]) =>
    keyPaths(v, prefix ? `${prefix}.${key}` : key),
  )
}

describe('translations', () => {
  it('it and en expose exactly the same set of keys', () => {
    const itKeys = keyPaths(itTranslations).sort()
    const enKeys = keyPaths(en).sort()
    expect(itKeys).toEqual(enKeys)
  })

  it('meta.locale differs between languages', () => {
    expect(itTranslations.meta.locale).not.toBe(en.meta.locale)
  })

  describe('interpolated strings produce the given values', () => {
    it('puzzleBoard.progress', () => {
      expect(itTranslations.puzzleBoard.progress(3, 10)).toContain('3')
      expect(itTranslations.puzzleBoard.progress(3, 10)).toContain('10')
      expect(en.puzzleBoard.progress(3, 10)).toContain('3')
    })

    it('dailySummary.subtitle', () => {
      const s = itTranslations.dailySummary.subtitle(2, 1, '1:30')
      expect(s).toContain('2')
      expect(s).toContain('1')
      expect(s).toContain('1:30')
    })

    it('passwordPolicy.hint includes the minimum length', () => {
      expect(itTranslations.passwordPolicy.hint(10)).toContain('10')
      expect(en.passwordPolicy.hint(10)).toContain('10')
    })
  })
})
