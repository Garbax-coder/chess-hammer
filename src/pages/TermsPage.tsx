import { Link } from 'react-router-dom'
import { SiteFooter } from '@/components/site-footer'
import { useLanguage } from '@/lib/language-context'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_GITHUB_URL,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'

const UPDATED_AT = { it: '4 ottobre 2026', en: 'October 4, 2026' }

function ContentIt() {
  return (
    <>
      <p>
        Ultimo aggiornamento: {UPDATED_AT.it}. Usando {SITE_DOMAIN} ("Chess Hammer", "il
        Servizio") accetti questi termini. Se non li accetti, non usare il Servizio.
      </p>

      <h2>Cos'è il Servizio</h2>
      <p>
        Chess Hammer è un'applicazione web gratuita per allenarsi con puzzle scacchistici
        secondo il metodo del "picchio" (risolvere un set fisso di puzzle per più giri
        consecutivi, aumentando la velocità). Il Servizio è oggi offerto gratuitamente, senza
        pubblicità né abbonamenti: non diamo garanzie di continuità, disponibilità o assenza
        di errori.
      </p>

      <h2>Account</h2>
      <ul>
        <li>Devi avere almeno 14 anni per registrarti.</li>
        <li>
          Le informazioni fornite alla registrazione devono essere corrette; sei responsabile
          della riservatezza della tua password e di ogni attività sul tuo account.
        </li>
        <li>
          Puoi eliminare il tuo account in qualsiasi momento dalla pagina{' '}
          <Link to="/profile">Profilo</Link>: l'eliminazione è definitiva e immediata.
        </li>
      </ul>

      <h2>Uso consentito</h2>
      <p>Usando il Servizio ti impegni a non:</p>
      <ul>
        <li>creare account con dati falsi o impersonare altre persone;</li>
        <li>
          tentare di accedere ad account altrui o di aggirare le misure di sicurezza del
          Servizio;
        </li>
        <li>usare il Servizio per scopi illegali o per distribuire malware o spam;</li>
        <li>
          sovraccaricare deliberatamente l'infrastruttura (ad es. con richieste automatizzate
          massive).
        </li>
      </ul>
      <p>
        Ci riserviamo il diritto di sospendere o eliminare account che violano questi termini.
      </p>

      <h2>Codice sorgente e licenza</h2>
      <p>
        Il codice sorgente di Chess Hammer, nella versione esattamente in esecuzione su
        questo sito, è pubblico sotto licenza GNU GPLv3 o successiva:{' '}
        <a href={SITE_GITHUB_URL} target="_blank" rel="noreferrer">
          {SITE_GITHUB_URL}
        </a>
        . Puoi leggerlo, modificarlo e distribuirlo secondo i termini di quella licenza. Il
        marchio "Chess Hammer" e i contenuti dell'account (i tuoi dati) non sono inclusi
        nella licenza del codice. Licenze e attribuzioni di componenti di terze parti (motore
        Stockfish, database puzzle Lichess, set di pezzi, librerie): vedi{' '}
        <Link to="/credits">Crediti</Link>.
      </p>

      <h2>Nessuna garanzia e limite di responsabilità</h2>
      <p>
        Il Servizio è fornito "così com'è", senza garanzie di alcun tipo, nella misura
        massima consentita dalla legge. Non siamo responsabili per perdita di dati,
        interruzioni del Servizio o danni derivanti dal suo uso, salvo nei casi in cui la
        legge non permetta di escludere la responsabilità (ad es. dolo o colpa grave). Nulla
        in questi termini limita i diritti inderogabili che la legge ti riconosce come
        consumatore.
      </p>

      <h2>Modifiche al Servizio e a questi termini</h2>
      <p>
        Possiamo modificare, sospendere o chiudere il Servizio in qualsiasi momento. Se
        aggiorniamo questi termini in modo sostanziale (ad es. introducendo un piano a
        pagamento), aggiorneremo questa pagina e la data in cima, e te lo segnaleremo
        nell'app prima che i cambiamenti si applichino al tuo uso del Servizio.
      </p>

      <h2>Legge applicabile e foro competente</h2>
      <p>
        Questi termini sono regolati dalla legge italiana. Per qualunque controversia è
        competente il foro di {SITE_CONTROLLER_CITY}, salve le tutele inderogabili
        riconosciute ai consumatori dalla legge del loro paese di residenza.
      </p>

      <h2>Contatti</h2>
      <p>
        Per domande su questi termini scrivi a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>. Titolare:{' '}
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italia.
      </p>
    </>
  )
}

function ContentEn() {
  return (
    <>
      <p>
        Last updated: {UPDATED_AT.en}. By using {SITE_DOMAIN} ("Chess Hammer", "the
        Service") you accept these terms. If you don't accept them, don't use the Service.
      </p>

      <h2>What the Service is</h2>
      <p>
        Chess Hammer is a free web app for training with chess puzzles using the
        "woodpecker" method (solving a fixed set of puzzles over several consecutive rounds,
        increasing speed each round). The Service is currently offered for free, with no
        advertising or subscriptions: we make no guarantee of continuity, availability, or
        error-free operation.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must be at least 14 years old to register.</li>
        <li>
          Information provided at signup must be accurate; you're responsible for keeping
          your password confidential and for all activity on your account.
        </li>
        <li>
          You can delete your account at any time from your{' '}
          <Link to="/profile">Profile</Link> page: deletion is final and immediate.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>By using the Service you agree not to:</p>
      <ul>
        <li>create accounts with false information or impersonate others;</li>
        <li>try to access other accounts or bypass the Service's security measures;</li>
        <li>use the Service for unlawful purposes or to distribute malware or spam;</li>
        <li>
          deliberately overload the infrastructure (e.g. with massive automated requests).
        </li>
      </ul>
      <p>We may suspend or delete accounts that violate these terms.</p>

      <h2>Source code and license</h2>
      <p>
        Chess Hammer's source code, in the exact version running on this site, is public
        under the GNU GPLv3 license or later:{' '}
        <a href={SITE_GITHUB_URL} target="_blank" rel="noreferrer">
          {SITE_GITHUB_URL}
        </a>
        . You may read, modify and distribute it under that license's terms. The "Chess
        Hammer" name and your account content (your data) are not covered by the code's
        license. Third-party component licenses and attributions (Stockfish engine, Lichess
        puzzle database, piece sets, libraries): see <Link to="/credits">Credits</Link>.
      </p>

      <h2>No warranty and limitation of liability</h2>
      <p>
        The Service is provided "as is", with no warranties of any kind, to the fullest
        extent permitted by law. We're not liable for data loss, Service interruptions, or
        damages arising from its use, except where the law doesn't allow excluding
        liability (e.g. willful misconduct or gross negligence). Nothing here limits any
        mandatory rights the law grants you as a consumer.
      </p>

      <h2>Changes to the Service and these terms</h2>
      <p>
        We may change, suspend, or shut down the Service at any time. If we materially
        update these terms (e.g. introducing a paid plan), we'll update this page and the
        date at the top, and flag it inside the app before the changes apply to your use of
        the Service.
      </p>

      <h2>Governing law and jurisdiction</h2>
      <p>
        These terms are governed by Italian law. Any dispute falls under the jurisdiction
        of {SITE_CONTROLLER_CITY}, Italy, without prejudice to any mandatory consumer
        protections of your country of residence.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these terms, write to{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>. Controller:{' '}
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italy.
      </p>
    </>
  )
}

export default function TermsPage() {
  const { language, t } = useLanguage()

  return (
    <main className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.terms.title}
        </h1>
        <div className="text-muted-foreground [&_a]:text-primary flex flex-col gap-4 text-sm leading-relaxed [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:text-foreground [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-medium [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {language === 'it' ? <ContentIt /> : <ContentEn />}
        </div>
        <Link to="/" className="text-primary w-fit text-sm underline-offset-4 hover:underline">
          {t.terms.back}
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
