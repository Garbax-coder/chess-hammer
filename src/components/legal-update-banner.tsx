import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAcceptLegalTerms, useUserStats } from '@/hooks/use-user-stats'
import { useTranslations } from '@/lib/language-context'
import { MIN_AGE } from '@/lib/legal'
import { SITE_LEGAL_VERSION } from '@/lib/site-info'

// Avviso in cima alle pagine dell'app quando l'utente non ha accettato la
// versione attuale di Termini e Privacy: le novita' se ne aveva accettata una
// precedente, la richiesta di accettazione se non l'ha mai fatto (chi si e'
// registrato con Google non ha visto la casella della registrazione). Non
// blocca l'uso: sparisce quando l'utente conferma.
export function LegalUpdateBanner() {
  const t = useTranslations()
  const { data: stats } = useUserStats()
  const accept = useAcceptLegalTerms()

  if (!stats || stats.legal_version === SITE_LEGAL_VERSION) return null

  const neverAccepted = stats.legal_version === null
  const linkClass = 'text-primary underline underline-offset-4'
  const terms = (
    <Link to="/terms" target="_blank" className={linkClass}>
      {t.footer.terms}
    </Link>
  )
  const privacy = (
    <Link to="/privacy" target="_blank" className={linkClass}>
      {t.footer.privacy}
    </Link>
  )

  return (
    <aside
      aria-labelledby="legal-update-title"
      className="mx-auto w-full max-w-3xl px-4 pt-4"
    >
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 text-sm">
        <h2 id="legal-update-title" className="text-foreground font-medium">
          {neverAccepted ? t.legalUpdate.acceptTitle : t.legalUpdate.updatedTitle}
        </h2>
        {neverAccepted ? (
          <p className="text-muted-foreground">
            {t.legalUpdate.acceptBefore(MIN_AGE)} {terms} {t.legalUpdate.acceptAnd}{' '}
            {privacy}
            {t.legalUpdate.acceptAfter}
          </p>
        ) : (
          <>
            <p className="text-muted-foreground">{t.legalUpdate.updatedIntro}</p>
            <ul className="text-muted-foreground ml-5 flex list-disc flex-col gap-1">
              {t.legalUpdate.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
            <p className="text-muted-foreground">
              {terms} · {privacy}. {t.legalUpdate.continuing}
            </p>
          </>
        )}
        {accept.isError && <p className="text-destructive">{t.legalUpdate.error}</p>}
        <div>
          <Button
            size="sm"
            loading={accept.isPending}
            onClick={() => accept.mutate(SITE_LEGAL_VERSION)}
          >
            {neverAccepted ? t.legalUpdate.accept : t.legalUpdate.acknowledge}
          </Button>
        </div>
      </div>
    </aside>
  )
}
