import { describe, expect, it } from 'vitest'
import { MARKETING_PAGES, marketingPageForPath } from './marketing'

describe('marketing pages', () => {
  it('lists one page per id and language, each with a distinct path', () => {
    expect(MARKETING_PAGES).toHaveLength(10)
    expect(new Set(MARKETING_PAGES.map((p) => p.path)).size).toBe(10)
  })

  it('resolves the language from the path', () => {
    expect(marketingPageForPath('/')).toEqual({ id: 'home', lang: 'it', path: '/' })
    expect(marketingPageForPath('/en')).toEqual({ id: 'home', lang: 'en', path: '/en' })
    expect(marketingPageForPath('/metodo-woodpecker')?.lang).toBe('it')
    expect(marketingPageForPath('/en/woodpecker-method')).toMatchObject({
      id: 'guide',
      lang: 'en',
    })
    expect(marketingPageForPath('/fr')).toMatchObject({ id: 'home', lang: 'fr' })
    expect(marketingPageForPath('/es/metodo-woodpecker')).toMatchObject({
      id: 'guide',
      lang: 'es',
    })
    expect(marketingPageForPath('/de/woodpecker-methode')).toMatchObject({
      id: 'guide',
      lang: 'de',
    })
  })

  it('ignores a trailing slash', () => {
    expect(marketingPageForPath('/en/')?.lang).toBe('en')
    expect(marketingPageForPath('/metodo-woodpecker/')?.id).toBe('guide')
  })

  it('returns null for app routes', () => {
    expect(marketingPageForPath('/dashboard')).toBeNull()
    expect(marketingPageForPath('/en/dashboard')).toBeNull()
    expect(marketingPageForPath('/login')).toBeNull()
  })
})
