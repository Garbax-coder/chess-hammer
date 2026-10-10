import type { Language } from '@/lib/i18n/translations'

// Pagine pubbliche indicizzabili: una per lingua, ciascuna con il proprio
// indirizzo (Google indicizza separatamente le versioni linguistiche solo se
// hanno URL distinti). Su questi percorsi la lingua la decide l'URL, non il
// browser: vedi LanguageProvider. Vengono anche pre-generate in HTML statico
// alla build (scripts/prerender.mjs).
export const SITE_URL = 'https://chesshammer.com'

export type MarketingPageId = 'home' | 'guide'

export const MARKETING_PATHS: Record<MarketingPageId, Record<Language, string>> = {
  home: { it: '/', en: '/en', fr: '/fr', es: '/es', de: '/de' },
  guide: {
    it: '/metodo-woodpecker',
    en: '/en/woodpecker-method',
    fr: '/fr/methode-woodpecker',
    es: '/es/metodo-woodpecker',
    de: '/de/woodpecker-methode',
  },
}

export interface MarketingPage {
  id: MarketingPageId
  lang: Language
  path: string
}

export const MARKETING_PAGES: MarketingPage[] = (
  Object.entries(MARKETING_PATHS) as [MarketingPageId, Record<Language, string>][]
).flatMap(([id, paths]) =>
  (Object.entries(paths) as [Language, string][]).map(([lang, path]) => ({
    id,
    lang,
    path,
  })),
)

export function marketingPageForPath(pathname: string): MarketingPage | null {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return MARKETING_PAGES.find((p) => p.path === normalized) ?? null
}
