import { beforeAll, describe, expect, it } from 'vitest'
import { loadLanguage } from './load-language'
import { en, it as itTranslations, LANGUAGES, translations } from './translations'

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
  beforeAll(() => Promise.all(LANGUAGES.map(loadLanguage)))

  it.each(LANGUAGES.filter((lang) => lang !== 'it'))(
    '%s exposes exactly the same set of keys as it',
    (lang) => {
      expect(keyPaths(translations[lang]).sort()).toEqual(keyPaths(itTranslations).sort())
    },
  )

  it('meta.locale differs between languages and starts with the language code', () => {
    const locales = LANGUAGES.map((lang) => translations[lang].meta.locale)
    expect(new Set(locales).size).toBe(LANGUAGES.length)
    for (const lang of LANGUAGES)
      expect(translations[lang].meta.locale).toMatch(new RegExp(`^${lang}-`))
  })

  it('signup consent states the minimum age it is given', () => {
    for (const lang of LANGUAGES) expect(translations[lang].signup.legalBefore(16)).toContain('16')
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
