import { Check, X } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { StaticBoard } from '@/components/marketing/static-board'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useDocumentMeta } from '@/hooks/use-document-meta'
import { marketingCopy } from '@/lib/i18n/marketing'
import type { Language } from '@/lib/i18n/translations'
import { MATE_PUZZLE, positionAfter } from '@/lib/landing-puzzles'
import { marketingMeta } from '@/lib/seo'

const SECTION_IDS = ['why', 'rounds', 'compare', 'faq'] as const

export default function GuidePage({ lang }: { lang: Language }) {
  const copy = marketingCopy[lang]
  const g = copy.guide
  const meta = useMemo(() => marketingMeta('guide', lang), [lang])
  useDocumentMeta(meta)
  const exampleFen = useMemo(
    () => positionAfter(MATE_PUZZLE.fen, MATE_PUZZLE.moves.slice(0, 1)),
    [],
  )
  const toc = [g.whyTitle, g.roundsTitle, g.compareTitle, copy.faqTitle]

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <MarketingNav lang={lang} page="guide" />
      <main className="flex-1">
        <header className="border-b px-4 py-16 sm:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
            <p className="text-muted-foreground text-sm">{g.kicker}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              {g.title}
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">{g.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/signup">{g.ctaPrimary}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a href="#why">{g.ctaSecondary} ↓</a>
              </Button>
            </div>
          </div>
        </header>

        <article className="px-4 py-16">
          <div className="mx-auto flex max-w-3xl flex-col gap-14">
            <nav aria-label={g.tocTitle} className="bg-muted rounded-xl p-6 text-sm">
              <p className="font-semibold">{g.tocTitle}</p>
              <ol className="text-muted-foreground mt-3 list-decimal space-y-1 pl-5">
                {toc.map((label, i) => (
                  <li key={label}>
                    <a href={`#${SECTION_IDS[i]}`} className="hover:text-foreground">
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <section id="why" className="flex scroll-mt-4 flex-col gap-4">
              <h2 className="text-3xl font-semibold tracking-tight">{g.whyTitle}</h2>
              <p className="text-lg leading-relaxed">{g.whyText}</p>
              <figure className="bg-card mt-4 grid gap-6 rounded-2xl border p-5 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                <StaticBoard
                  fen={exampleFen}
                  orientation="white"
                  arrows={[
                    { from: 'h5', to: 'h7' },
                    { from: 'e4', to: 'h4', opacity: 0.45 },
                  ]}
                />
                <figcaption className="flex flex-col gap-2">
                  <span className="text-primary text-sm font-semibold">
                    {g.exampleLabel}
                  </span>
                  <span className="text-lg font-semibold">{g.exampleTitle}</span>
                  <span className="text-muted-foreground">{g.exampleText}</span>
                </figcaption>
              </figure>
            </section>

            <section id="rounds" className="flex scroll-mt-4 flex-col gap-6">
              <h2 className="text-3xl font-semibold tracking-tight">{g.roundsTitle}</h2>
              <ol className="relative flex flex-col gap-8 border-l-2 pl-8">
                {g.rounds.map(({ title, pace, text }) => (
                  <li key={title} className="relative">
                    <span className="bg-primary absolute top-1.5 -left-[41px] size-4 rounded-full" />
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-primary text-sm font-medium">{pace}</p>
                    <p className="text-muted-foreground mt-1">{text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section id="compare" className="flex scroll-mt-4 flex-col gap-6">
              <h2 className="text-3xl font-semibold tracking-tight">{g.compareTitle}</h2>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <td className="p-4" />
                      <th scope="col" className="p-4 font-medium">
                        {g.compareHead.random}
                      </th>
                      <th scope="col" className="p-4 font-medium">
                        {g.compareHead.ours}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {g.compareRows.map(({ label, random, ours }) => (
                      <tr key={label}>
                        <th scope="row" className="p-4 font-medium">
                          {label}
                        </th>
                        <td className="text-muted-foreground p-4">
                          <span className="inline-flex items-center gap-2">
                            <X className="size-4 shrink-0" aria-hidden />
                            {random}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-2">
                            <Check className="text-primary size-4 shrink-0" aria-hidden />
                            {ours}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="faq" className="flex scroll-mt-4 flex-col gap-4">
              <h2 className="text-3xl font-semibold tracking-tight">{copy.faqTitle}</h2>
              {copy.faq.map(({ q, a }) => (
                <div key={q}>
                  <h3 className="font-semibold">{q}</h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{a}</p>
                </div>
              ))}
            </section>

            <aside className="bg-primary text-primary-foreground flex flex-col items-start gap-4 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold">{g.finalTitle}</h2>
              <p className="opacity-90">{g.finalText}</p>
              <Button asChild size="lg" variant="secondary">
                <Link to="/signup">{g.finalCta}</Link>
              </Button>
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
