import { describe, expect, it } from 'vitest'
import { marketingCopy } from './i18n/marketing'
import { marketingMeta, renderHeadTags, type PageMeta } from './seo'

describe('marketingMeta', () => {
  it('points canonical and hreflang alternates at absolute URLs, x-default in English', () => {
    const meta = marketingMeta('guide', 'it')
    expect(meta.canonical).toBe('https://chesshammer.com/metodo-woodpecker')
    expect(meta.alternates).toEqual([
      { hreflang: 'it', href: 'https://chesshammer.com/metodo-woodpecker' },
      { hreflang: 'en', href: 'https://chesshammer.com/en/woodpecker-method' },
      { hreflang: 'x-default', href: 'https://chesshammer.com/en/woodpecker-method' },
    ])
  })

  it('uses the localized title, description and social image', () => {
    const meta = marketingMeta('home', 'en')
    expect(meta.title).toBe(marketingCopy.en.seo.home.title)
    expect(meta.description).toBe(marketingCopy.en.seo.home.description)
    expect(meta.ogImage).toBe('https://chesshammer.com/og/og-en.png')
    expect(meta.ogLocale).toBe('en_US')
    expect(marketingMeta('home', 'it').ogLocale).toBe('it_IT')
  })

  it('describes the home as a free web application', () => {
    const [app, faq] = marketingMeta('home', 'it').jsonLd
    expect(app).toMatchObject({
      '@type': 'WebApplication',
      isAccessibleForFree: true,
      offers: { price: '0' },
    })
    expect(faq['@type']).toBe('FAQPage')
    expect(faq.mainEntity).toHaveLength(marketingCopy.it.faq.length)
  })

  it('describes the guide as an article', () => {
    const [article] = marketingMeta('guide', 'en').jsonLd
    expect(article).toMatchObject({
      '@type': 'Article',
      headline: marketingCopy.en.guide.title,
      url: 'https://chesshammer.com/en/woodpecker-method',
    })
  })
})

describe('renderHeadTags', () => {
  it('emits title, description, canonical, alternates and Open Graph tags', () => {
    const html = renderHeadTags(marketingMeta('home', 'en'))
    expect(html).toContain('<link rel="canonical" href="https://chesshammer.com/en" />')
    expect(html).toContain('hreflang="x-default"')
    expect(html).toContain(
      '<meta property="og:image" content="https://chesshammer.com/og/og-en.png" />',
    )
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html.match(/application\/ld\+json/g)).toHaveLength(2)
  })

  it('escapes attribute values and keeps JSON-LD from closing its script tag', () => {
    const meta: PageMeta = {
      ...marketingMeta('home', 'it'),
      title: 'A & "B" <c>',
      jsonLd: [{ text: '</script><script>alert(1)</script>' }],
    }
    const html = renderHeadTags(meta)
    expect(html).toContain('<title>A &amp; &quot;B&quot; &lt;c&gt;</title>')
    expect(html).not.toContain('</script><script>')
    expect(html).toContain('\\u003c/script>')
  })
})
