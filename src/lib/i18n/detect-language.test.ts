import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectBrowserLanguage } from './detect-language'

function mockLanguages(languages: string[]) {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages)
}

describe('detectBrowserLanguage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('picks the first supported browser language', () => {
    mockLanguages(['de-CH', 'it-IT', 'en'])
    expect(detectBrowserLanguage()).toBe('de')
  })

  it('skips unsupported languages', () => {
    mockLanguages(['pt-BR', 'es-419', 'en'])
    expect(detectBrowserLanguage()).toBe('es')
  })

  it('falls back to English', () => {
    mockLanguages(['pt-BR', 'ja'])
    expect(detectBrowserLanguage()).toBe('en')
  })
})
