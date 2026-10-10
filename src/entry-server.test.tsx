import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

const { render, pages } = await import('./entry-server')
const { marketingCopy } = await import('@/lib/i18n/marketing')

describe('prerendered public pages', () => {
  it('renders every page with its h1, in the language of its URL', () => {
    for (const page of pages) {
      const html = render(page.path)
      const copy = marketingCopy[page.lang]
      const title = page.id === 'home' ? copy.landing.title : copy.guide.title
      expect(html).toContain('<h1')
      expect(html).toContain(title.replace(/&/g, '&amp;').replace(/'/g, '&#x27;'))
    }
  })

  it('links each page to its counterpart in the other language', () => {
    expect(render('/en')).toContain('href="/"')
    expect(render('/')).toContain('href="/en"')
    expect(render('/metodo-woodpecker')).toContain('href="/en/woodpecker-method"')
  })

  it('renders the shared footer in English on English pages', () => {
    expect(render('/en')).toContain('Privacy')
    expect(render('/en')).not.toContain(marketingCopy.it.landing.ctaPrimary)
  })

  it('ships head tags for each page', () => {
    for (const page of pages) {
      expect(page.head).toContain(
        `<link rel="canonical" href="${page.meta.canonical}" />`,
      )
    }
  })
})
