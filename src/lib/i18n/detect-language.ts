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

// Lingua scelta in questo browser: quella delle pagine pubbliche lette per
// ultime (/, /en, /fr…) o quella impostata dal profilo. Cosi' chi passa dalla
// home in francese al login continua in francese, anche se il browser e' in
// un'altra lingua. Prevale comunque la lingua salvata nell'account.
const STORAGE_KEY = 'chess-hammer-language'

export function readStoredLanguage(): Language | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value && (LANGUAGES as string[]).includes(value) ? (value as Language) : null
  } catch {
    return null
  }
}

export function storeLanguage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // memoria del browser non disponibile: si riparte dalla lingua del browser
  }
}

export function preferredLanguage(): Language {
  return readStoredLanguage() ?? detectBrowserLanguage()
}
