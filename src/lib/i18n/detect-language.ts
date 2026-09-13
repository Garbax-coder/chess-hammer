import type { Language } from '@/lib/i18n/translations'

/** Italiano se il browser e' in italiano, inglese in tutti gli altri casi. */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en'
  const languages = navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language]
  return languages.some((lang) => lang.toLowerCase().startsWith('it')) ? 'it' : 'en'
}
