import { marketingCopy } from '@/lib/i18n/marketing'
import { LANGUAGES, type Language } from '@/lib/i18n/translations'
import { MARKETING_PATHS, SITE_URL, type MarketingPageId } from '@/lib/marketing'
import { SITE_CONTROLLER_NAME } from '@/lib/site-info'

export interface PageMeta {
  lang: Language
  title: string
  description: string
  canonical: string
  alternates: { hreflang: string; href: string }[]
  ogImage: string
  ogLocale: string
  ogLocaleAlternates: string[]
  jsonLd: Record<string, unknown>[]
}

const OG_LOCALES: Record<Language, string> = {
  it: 'it_IT',
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  de: 'de_DE',
}
const GUIDE_PUBLISHED = '2026-10-11'

function absolute(path: string): string {
  return SITE_URL + path
}

export function marketingMeta(id: MarketingPageId, lang: Language): PageMeta {
  const copy = marketingCopy[lang]
  const paths = MARKETING_PATHS[id]
  const canonical = absolute(paths[lang])
  const ogImage = absolute(`/og/og-${lang}.png`)
  const { title, description } = copy.seo[id]

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: copy.faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
  const main =
    id === 'home'
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Chess Hammer',
          url: canonical,
          description,
          inLanguage: lang,
          applicationCategory: 'GameApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          image: ogImage,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: copy.guide.title,
          description,
          inLanguage: lang,
          url: canonical,
          mainEntityOfPage: canonical,
          image: ogImage,
          datePublished: GUIDE_PUBLISHED,
          author: { '@type': 'Person', name: SITE_CONTROLLER_NAME },
          publisher: { '@type': 'Organization', name: 'Chess Hammer', url: SITE_URL },
        }

  return {
    lang,
    title,
    description,
    canonical,
    // x-default in inglese: chi non legge l'italiano capisce piu' facilmente quella.
    alternates: [
      ...LANGUAGES.map((l) => ({ hreflang: l, href: absolute(paths[l]) })),
      { hreflang: 'x-default', href: absolute(paths.en) },
    ],
    ogImage,
    ogLocale: OG_LOCALES[lang],
    ogLocaleAlternates: LANGUAGES.filter((l) => l !== lang).map((l) => OG_LOCALES[l]),
    jsonLd: [main, faqPage],
  }
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Tag <head> per l'HTML pre-generato (scripts/prerender.mjs). Nel browser li
// tiene aggiornati useDocumentMeta, senza duplicarli.
export function renderHeadTags(meta: PageMeta): string {
  const tags = [
    `<title>${escapeAttr(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<link rel="canonical" href="${meta.canonical}" />`,
    ...meta.alternates.map(
      (a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`,
    ),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Chess Hammer" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${meta.ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="${meta.ogLocale}" />`,
    ...meta.ogLocaleAlternates.map(
      (locale) => `<meta property="og:locale:alternate" content="${locale}" />`,
    ),
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...meta.jsonLd.map(
      (data) =>
        `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`,
    ),
  ]
  return tags.join('\n    ')
}
