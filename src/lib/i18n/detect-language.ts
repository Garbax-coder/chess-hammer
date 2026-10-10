import { LANGUAGES, type Language } from '@/lib/i18n/translations'

/**
 * La prima lingua del browser tra quelle supportate (it, en, fr, es, de);
 * inglese se nessuna corrisponde.
 */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en'
  const languages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language]
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0] as Language
    if (LANGUAGES.includes(base)) return base
  }
  return 'en'
}
