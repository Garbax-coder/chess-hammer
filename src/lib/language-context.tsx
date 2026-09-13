import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
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

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: translations[language] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
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
