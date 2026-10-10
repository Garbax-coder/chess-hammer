import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/app-logo'
import { Button } from '@/components/ui/button'
import { useAppStyle } from '@/hooks/use-app-style'
import { useAuth } from '@/lib/auth-context'
import { marketingCopy } from '@/lib/i18n/marketing'
import type { Language } from '@/lib/i18n/translations'
import { MARKETING_PATHS, type MarketingPageId } from '@/lib/marketing'

export function MarketingNav({ lang, page }: { lang: Language; page: MarketingPageId }) {
  const copy = marketingCopy[lang].nav
  const { session } = useAuth()
  const appStyle = useAppStyle()
  const otherLang: Language = lang === 'it' ? 'en' : 'it'

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to={MARKETING_PATHS.home[lang]}
          className="flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap"
        >
          <AppLogo styleId={appStyle} className="size-7" />
          Chess Hammer
        </Link>
        <div className="flex items-center gap-1">
          {page !== 'guide' && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to={MARKETING_PATHS.guide[lang]}>{copy.guide}</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link
              to={MARKETING_PATHS[page][otherLang]}
              hrefLang={otherLang}
              aria-label={copy.otherLanguageLabel}
              title={copy.otherLanguageLabel}
            >
              {copy.otherLanguage}
            </Link>
          </Button>
          {session ? (
            <Button asChild size="sm">
              <Link to="/dashboard">{copy.goToDashboard}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">{copy.signIn}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">{copy.startFree}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export function MarketingFaq({ lang }: { lang: Language }) {
  const { faq } = marketingCopy[lang]
  return (
    <div className="divide-y rounded-xl border">
      {faq.map(({ q, a }) => (
        <details key={q} className="group p-5">
          <summary className="cursor-pointer list-none font-medium">{q}</summary>
          <p className="text-muted-foreground mt-3">{a}</p>
        </details>
      ))}
    </div>
  )
}
