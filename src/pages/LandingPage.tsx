import { ArrowRight, BarChart3, Brain, Check, Cpu, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { MarketingFaq, MarketingNav } from '@/components/marketing/marketing-nav'
import { StaticBoard } from '@/components/marketing/static-board'
import { TryPuzzle } from '@/components/marketing/try-puzzle'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useDocumentMeta } from '@/hooks/use-document-meta'
import { useAuth } from '@/lib/auth-context'
import { marketingCopy } from '@/lib/i18n/marketing'
import type { Language } from '@/lib/i18n/translations'
import { MARKETING_PATHS } from '@/lib/marketing'
import { marketingMeta } from '@/lib/seo'

const FEATURE_ICONS = [RotateCcw, Cpu, BarChart3, Brain]
// La Partita Italiana dopo 3.Bc4, con la freccia dell'ultima mossa.
const OPENING_FEN = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'

export default function LandingPage({ lang }: { lang: Language }) {
  const copy = marketingCopy[lang]
  const meta = useMemo(() => marketingMeta('home', lang), [lang])
  useDocumentMeta(meta)
  const { session } = useAuth()
  const justSignedOut = (useLocation().state as { signedOut?: boolean } | null)?.signedOut

  // Chi ha gia' fatto l'accesso va dritto all'allenamento: la home serve a chi
  // non conosce ancora il sito. L'HTML pre-generato (motori di ricerca,
  // anteprime dei link) resta quello per i visitatori.
  // Eccezione: chi arriva qui subito dopo aver eliminato l'account (l'uscita
  // avviene un attimo dopo).
  if (session && !justSignedOut) return <Navigate to="/dashboard" replace />

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <MarketingNav lang={lang} page="home" />
      <main className="flex-1">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                {copy.landing.eyebrow}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {copy.landing.title}
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                {copy.landing.subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/signup">{copy.landing.ctaPrimary}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how-it-works">{copy.landing.ctaSecondary}</a>
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">{copy.landing.note}</p>
            </div>
            <div className="bg-card mx-auto w-full max-w-md rounded-2xl border p-3 shadow-sm">
              <TryPuzzle lang={lang} />
              <p className="text-muted-foreground px-1 text-xs">{copy.puzzle.caption}</p>
            </div>
          </div>
        </section>

        <section className="bg-muted border-y px-4 py-8">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {copy.landing.stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-muted-foreground text-sm">{label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="how-it-works" className="scroll-mt-4 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              {copy.landing.howTitle}
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {copy.landing.steps.map(({ title, text }, i) => (
                <li key={title} className="bg-card rounded-xl border p-6">
                  <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-2">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-muted/50 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              {copy.landing.featuresTitle}
            </h2>
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {copy.landing.features.map(({ title, text }, i) => {
                const Icon = FEATURE_ICONS[i]
                return (
                  <div key={title} className="flex gap-4">
                    <Icon className="text-primary mt-1 size-6 shrink-0" aria-hidden />
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="text-muted-foreground mt-1">{text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="openings" className="scroll-mt-4 px-4 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                {copy.landing.openings.eyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                {copy.landing.openings.title}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {copy.landing.openings.text}
              </p>
              <ul className="flex flex-col gap-3">
                {copy.landing.openings.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <Check className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <figure className="bg-card mx-auto flex w-full max-w-md flex-col gap-2 rounded-2xl border p-3 shadow-sm">
              <StaticBoard
                fen={OPENING_FEN}
                arrows={[{ from: 'f1', to: 'c4' }]}
                className="w-full"
              />
              <figcaption className="text-muted-foreground px-1 text-xs">
                {copy.landing.openings.caption}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-muted/50 px-4 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            <div className="bg-card flex flex-col items-start gap-4 rounded-2xl border p-8 lg:self-start">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                {copy.landing.guideTeaser.title}
              </h2>
              <p className="text-muted-foreground">{copy.landing.guideTeaser.text}</p>
              <Button asChild variant="outline">
                <Link to={MARKETING_PATHS.guide[lang]}>
                  {copy.landing.guideTeaser.cta} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight">
                {copy.faqTitle}
              </h2>
              <MarketingFaq lang={lang} />
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground px-4 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            {copy.landing.finalTitle}
          </h2>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/signup">{copy.landing.finalCta}</Link>
          </Button>
        </section>
      </main>
      <SiteFooter className="max-w-6xl" />
    </div>
  )
}
