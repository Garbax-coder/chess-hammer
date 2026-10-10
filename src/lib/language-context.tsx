import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { marketingPageForPath } from '@/lib/marketing'
import { useUpdateLanguage, useUserStats } from '@/hooks/use-user-stats'
import { useAuth } from '@/lib/auth-context'
import { detectBrowserLanguage } from '@/lib/i18n/detect-language'
import { translations, type Language, type Translations } from '@/lib/i18n/translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Lingua: italiano se il browser e' in italiano, inglese altrimenti, finche'
 * l'utente non ne sceglie una esplicitamente dal selettore — a quel punto
 * viene salvata su user_stats.language e resta costante su ogni dispositivo.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { data: stats } = useUserStats()
  const updateLanguage = useUpdateLanguage()
  const [language, setLanguageState] = useState<Language>(() => detectBrowserLanguage())
  const [userOverride, setUserOverride] = useState(false)

  useEffect(() => {
    if (userOverride) return
    if (stats?.language) {
      setLanguageState(stats.language)
    }
  }, [stats?.language, userOverride])

  function setLanguage(lang: Language) {
    setUserOverride(true)
    setLanguageState(lang)
    if (user) {
      updateLanguage.mutate(lang)
    }
  }

  // Sulle pagine pubbliche (home, guida) la lingua la decide l'URL: ogni
  // versione ha il suo indirizzo per i motori di ricerca, e l'HTML
  // pre-generato deve coincidere con quello mostrato nel browser.
  const { pathname } = useLocation()
  const effectiveLanguage = marketingPageForPath(pathname)?.lang ?? language

  const value = useMemo<LanguageContextValue>(
    () => ({ language: effectiveLanguage, setLanguage, t: translations[effectiveLanguage] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function useTranslations(): Translations {
  return useLanguage().t
}
