import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import PrivacyDe from '@/components/legal/privacy-de'
import PrivacyEn from '@/components/legal/privacy-en'
import PrivacyEs from '@/components/legal/privacy-es'
import PrivacyFr from '@/components/legal/privacy-fr'
import PrivacyIt from '@/components/legal/privacy-it'
import { SiteFooter } from '@/components/site-footer'
import type { Language } from '@/lib/i18n/translations'
import { useLanguage } from '@/lib/language-context'

// Un file per lingua in src/components/legal; in caso di differenze prevale
// il testo italiano (lo dice ogni versione).
const CONTENT: Record<Language, ComponentType> = {
  it: PrivacyIt,
  en: PrivacyEn,
  fr: PrivacyFr,
  es: PrivacyEs,
  de: PrivacyDe,
}

export default function PrivacyPage() {
  const { language, t } = useLanguage()
  const Content = CONTENT[language]

  return (
    <main className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.privacy.title}
        </h1>
        <div className="text-muted-foreground [&_a]:text-primary [&_h2]:text-foreground flex flex-col gap-4 text-sm leading-relaxed [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-medium [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          <Content />
        </div>
        <Link
          to="/"
          className="text-primary w-fit text-sm underline-offset-4 hover:underline"
        >
          {t.privacy.back}
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
