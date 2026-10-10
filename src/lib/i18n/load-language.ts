import { marketingCopy } from './marketing'
import { translations, type Language } from './translations'

const PACKS = {
  fr: () => import('./pack-fr'),
  es: () => import('./pack-es'),
  de: () => import('./pack-de'),
}

export function isLanguageLoaded(lang: Language): boolean {
  return lang in translations && lang in marketingCopy
}

// Scarica i testi di una lingua non inclusa nel pacchetto iniziale e li
// registra in translations e marketingCopy. Nessun effetto se gia' caricata.
export async function loadLanguage(lang: Language): Promise<void> {
  if (isLanguageLoaded(lang) || !(lang in PACKS)) return
  const pack = await PACKS[lang as keyof typeof PACKS]()
  translations[lang] = pack.app
  marketingCopy[lang] = pack.marketing
}
