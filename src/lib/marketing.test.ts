import { describe, expect, it } from 'vitest'
import { MARKETING_PAGES, marketingPageForPath } from './marketing'

describe('marketing pages', () => {
  it('lists one page per id and language, each with a distinct path', () => {
    expect(MARKETING_PAGES).toHaveLength(4)
    expect(new Set(MARKETING_PAGES.map((p) => p.path)).size).toBe(4)
  })

  it('resolves the language from the path', () => {
    expect(marketingPageForPath('/')).toEqual({ id: 'home', lang: 'it', path: '/' })
    expect(marketingPageForPath('/en')).toEqual({ id: 'home', lang: 'en', path: '/en' })
    expect(marketingPageForPath('/metodo-woodpecker')?.lang).toBe('it')
    expect(marketingPageForPath('/en/woodpecker-method')).toMatchObject({
      id: 'guide',
      lang: 'en',
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
