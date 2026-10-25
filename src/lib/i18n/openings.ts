import { useLanguage } from '@/lib/language-context'
import { openingsTranslations, type OpeningsTranslations } from './openings-text'

export { openingsTranslations, type OpeningsTranslations } from './openings-text'

/** I testi delle aperture nella lingua dell'utente (inglese se manca). */
export function useOpeningsTranslations(): OpeningsTranslations {
  const { language } = useLanguage()
  return openingsTranslations[language] ?? openingsTranslations.en
}
