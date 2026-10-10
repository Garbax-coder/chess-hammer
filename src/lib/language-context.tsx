import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { marketingPageForPath } from '@/lib/marketing'
import { useUpdateLanguage, useUserStats } from '@/hooks/use-user-stats'
import { saveEmailLanguage } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { detectBrowserLanguage } from '@/lib/i18n/detect-language'
import { isLanguageLoaded, loadLanguage } from '@/lib/i18n/load-language'
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

  // Si passa a una lingua solo dopo averne caricato i testi (fr, es e de
  // non sono nel pacchetto iniziale): fino ad allora resta quella attuale.
  useEffect(() => {
    if (userOverride) return
    const saved = stats?.language
    if (!saved) return
    let cancelled = false
    void loadLanguage(saved).then(() => {
      if (!cancelled) setLanguageState(saved)
    })
    return () => {
      cancelled = true
    }
  }, [stats?.language, userOverride])

  // Le email di Supabase Auth (recupero password, cambio email) scelgono la
  // lingua dai metadati dell'account: si tengono allineati a quella dell'app,
  // una volta note le preferenze salvate (altrimenti si scriverebbe prima la
  // lingua del browser e subito dopo quella salvata).
  const emailLanguage = userOverride ? language : (stats?.language ?? language)
  const savedEmailLanguage = user?.user_metadata?.language as string | undefined
  useEffect(() => {
    if (!user || !stats || savedEmailLanguage === emailLanguage) return
    void saveEmailLanguage(emailLanguage)
  }, [user, stats, savedEmailLanguage, emailLanguage])

  function setLanguage(lang: Language) {
    setUserOverride(true)
    void loadLanguage(lang).then(() => setLanguageState(lang))
    if (user) {
      updateLanguage.mutate(lang)
    }
  }

  // Sulle pagine pubbliche (home, guida) la lingua la decide l'URL: ogni
  // versione ha il suo indirizzo per i motori di ricerca, e l'HTML
  // pre-generato deve coincidere con quello mostrato nel browser.
  const { pathname } = useLocation()
  const effectiveLanguage = marketingPageForPath(pathname)?.lang ?? language

  // Una pagina pubblica in una lingua non ancora caricata (navigazione interna
  // verso /fr, /es, /de): si aspetta il caricamento prima di mostrarla.
  const ready = isLanguageLoaded(effectiveLanguage)
  const [, setLoadedCount] = useState(0)
  useEffect(() => {
    if (ready) return
    void loadLanguage(effectiveLanguage).then(() => setLoadedCount((n) => n + 1))
  }, [ready, effectiveLanguage])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language: effectiveLanguage,
      setLanguage,
      t: translations[effectiveLanguage],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveLanguage, ready],
  )

  if (!ready) return null

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
