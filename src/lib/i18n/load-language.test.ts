import { describe, expect, it } from 'vitest'
import { isLanguageLoaded, loadLanguage } from './load-language'
import { marketingCopy } from './marketing'
import { translations } from './translations'

describe('loadLanguage', () => {
  it('ships Italian and English with the initial bundle', () => {
    expect(isLanguageLoaded('it')).toBe(true)
    expect(isLanguageLoaded('en')).toBe(true)
  })

  it('adds a language’s app and public-page texts on demand', async () => {
    expect(isLanguageLoaded('es')).toBe(false)
    await loadLanguage('es')
    expect(isLanguageLoaded('es')).toBe(true)
    expect(translations.es.meta.locale).toBe('es-ES')
    expect(marketingCopy.es.nav.languageMenu).toBe('Idioma')
  })

  it('does nothing for a language already loaded', async () => {
    const before = translations.it
    await loadLanguage('it')
    expect(translations.it).toBe(before)
  })
})
