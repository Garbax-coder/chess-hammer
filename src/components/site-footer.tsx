import { Link } from 'react-router-dom'
import { useTranslations } from '@/lib/language-context'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'

// Chi gestisce il sito (nome, sede, contatto privacy) deve comparire in modo
// visibile a chiunque, anche senza account: presente sia nello shell
// dell'app (loggati) sia nelle pagine pubbliche (home, login, termini...).
export function SiteFooter() {
  const t = useTranslations()

  return (
    <footer className="text-muted-foreground mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-6 text-xs">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link to="/terms" className="hover:text-foreground underline-offset-4 hover:underline">
          {t.footer.terms}
        </Link>
        <Link to="/privacy" className="hover:text-foreground underline-offset-4 hover:underline">
          {t.footer.privacy}
        </Link>
        <Link to="/credits" className="hover:text-foreground underline-offset-4 hover:underline">
          {t.footer.credits}
        </Link>
      </div>
      <p>
        {t.footer.controller(SITE_CONTROLLER_NAME, SITE_CONTROLLER_CITY)}
        {' · '}
        <a
          href={`mailto:${SITE_PRIVACY_EMAIL}`}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          {t.footer.privacyEmail(SITE_PRIVACY_EMAIL)}
        </a>
      </p>
    </footer>
  )
}
