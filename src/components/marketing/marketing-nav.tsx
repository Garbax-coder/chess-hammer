import { ChevronDown, Languages } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/app-logo'
import { Button } from '@/components/ui/button'
import { useAppStyle } from '@/hooks/use-app-style'
import { useAuth } from '@/lib/auth-context'
import { marketingCopy } from '@/lib/i18n/marketing'
import { LANGUAGE_NAMES, LANGUAGES, type Language } from '@/lib/i18n/translations'
import { MARKETING_PATHS, type MarketingPageId } from '@/lib/marketing'

export function MarketingNav({ lang, page }: { lang: Language; page: MarketingPageId }) {
  const copy = marketingCopy[lang].nav
  const { session } = useAuth()
  const appStyle = useAppStyle()

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
          <LanguageMenu lang={lang} page={page} label={copy.languageMenu} />
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

// Menu a tendina con <details>: funziona anche senza JavaScript, e i link alle
// altre lingue restano nell'HTML pre-generato, dove i motori di ricerca li
// seguono. Sono <a> normali: il cambio lingua ricarica la pagina, che arriva
// subito pre-generata invece di aspettare i testi della nuova lingua.
function LanguageMenu({
  lang,
  page,
  label,
}: {
  lang: Language
  page: MarketingPageId
  label: string
}) {
  return (
    <details className="group relative">
      <summary
        aria-label={label}
        title={label}
        className="hover:bg-accent hover:text-accent-foreground flex h-8 cursor-pointer list-none items-center gap-1 rounded-md px-2.5 text-sm font-medium uppercase [&::-webkit-details-marker]:hidden"
      >
        <Languages className="size-4" aria-hidden />
        {lang}
        <ChevronDown
          className="size-3.5 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <ul className="bg-popover text-popover-foreground absolute right-0 z-20 mt-1 min-w-36 rounded-md border p-1 shadow-md">
        {LANGUAGES.map((l) => (
          <li key={l}>
            <a
              href={MARKETING_PATHS[page][l]}
              hrefLang={l}
              lang={l}
              aria-current={l === lang ? 'page' : undefined}
              className="hover:bg-accent aria-[current=page]:text-primary flex rounded-sm px-2 py-1.5 text-sm aria-[current=page]:font-medium"
            >
              {LANGUAGE_NAMES[l]}
            </a>
          </li>
        ))}
      </ul>
    </details>
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
