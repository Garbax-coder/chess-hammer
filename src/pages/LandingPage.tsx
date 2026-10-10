import { ArrowRight, BarChart3, Brain, Cpu, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MarketingFaq, MarketingNav } from '@/components/marketing/marketing-nav'
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

export default function LandingPage({ lang }: { lang: Language }) {
  const copy = marketingCopy[lang]
  const meta = useMemo(() => marketingMeta('home', lang), [lang])
  useDocumentMeta(meta)
  const { session } = useAuth()
  const primaryCta = session
    ? { to: '/dashboard', label: copy.nav.goToDashboard }
    : { to: '/signup', label: copy.landing.ctaPrimary }

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
                  <Link to={primaryCta.to}>{primaryCta.label}</Link>
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

        <section className="px-4 py-16 sm:py-20">
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
            <Link to={primaryCta.to}>
              {session ? primaryCta.label : copy.landing.finalCta}
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter className="max-w-6xl" />
    </div>
  )
}
