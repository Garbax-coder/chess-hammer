import { Link } from 'react-router-dom'
import { SiteFooter } from '@/components/site-footer'
import { useTranslations } from '@/lib/language-context'
import { SITE_GITHUB_URL } from '@/lib/site-info'
import { THIRD_PARTY_PACKAGES } from '@/lib/third-party-licenses'

export default function CreditsPage() {
  const t = useTranslations()

  return (
    <main className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            {t.credits.title}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{t.credits.intro}</p>
          <a
            href={SITE_GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-primary w-fit text-sm underline-offset-4 hover:underline"
          >
            {t.credits.sourceNotice} ↗
          </a>
        </div>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground text-base font-medium">{t.credits.engineTitle}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t.credits.engineBody}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground text-base font-medium">{t.credits.puzzlesTitle}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t.credits.puzzlesBody}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground text-base font-medium">{t.credits.piecesTitle}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t.credits.piecesBody}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground text-base font-medium">{t.credits.fontTitle}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{t.credits.fontBody}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-medium">
            {t.credits.librariesTitle}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t.credits.librariesIntro}
          </p>
          <div className="border-border/60 max-h-80 overflow-y-auto rounded-md border">
            <table className="w-full text-xs">
              <tbody>
                {THIRD_PARTY_PACKAGES.map((pkg) => (
                  <tr key={`${pkg.name}@${pkg.version}`} className="border-border/60 border-b last:border-0">
                    <td className="px-2.5 py-1.5 font-mono">
                      {pkg.repository ? (
                        <a
                          href={pkg.repository}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground underline-offset-2 hover:underline"
                        >
                          {pkg.name}
                        </a>
                      ) : (
                        pkg.name
                      )}
                    </td>
                    <td className="text-muted-foreground px-2.5 py-1.5 font-mono">
                      {pkg.version}
                    </td>
                    <td className="text-muted-foreground px-2.5 py-1.5 text-right font-mono">
                      {pkg.license}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Link to="/" className="text-primary w-fit text-sm underline-offset-4 hover:underline">
          {t.credits.back}
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
