import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_GITHUB_URL,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function TermsIt() {
  return (
    <>
      <p>
        Ultimo aggiornamento: 10 ottobre 2026. Usando {SITE_DOMAIN} ("Chess Hammer", "il
        Servizio") accetti questi termini. Se non li accetti, non usare il Servizio.
      </p>

      <h2>Cos'è il Servizio</h2>
      <p>
        Chess Hammer è un'applicazione web gratuita per allenarsi con puzzle scacchistici
        secondo il metodo del "picchio" (risolvere un set fisso di puzzle per più giri
        consecutivi, aumentando la velocità). Il Servizio è oggi offerto gratuitamente,
        senza pubblicità né abbonamenti: non diamo garanzie di continuità, disponibilità o
        assenza di errori.
      </p>

      <h2>Account</h2>
      <ul>
        <li>Devi avere almeno {MIN_AGE} anni per registrarti.</li>
        <li>
          Le informazioni fornite alla registrazione devono essere corrette; sei
          responsabile della riservatezza della tua password e di ogni attività sul tuo
          account.
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
          sovraccaricare deliberatamente l'infrastruttura (ad es. con richieste
          automatizzate massive).
        </li>
      </ul>
      <p>
        Ci riserviamo il diritto di sospendere o eliminare account che violano questi
        termini.
      </p>

      <h2>Codice sorgente e licenza</h2>
      <p>
        Il codice sorgente di Chess Hammer, nella versione esattamente in esecuzione su
        questo sito, è pubblico sotto licenza GNU GPLv3 o successiva:{' '}
        <a href={SITE_GITHUB_URL} target="_blank" rel="noreferrer">
          {SITE_GITHUB_URL}
        </a>
        . Puoi leggerlo, modificarlo e distribuirlo secondo i termini di quella licenza.
        Il marchio "Chess Hammer" e i contenuti dell'account (i tuoi dati) non sono
        inclusi nella licenza del codice. Licenze e attribuzioni di componenti di terze
        parti (motore Stockfish, database puzzle Lichess, set di pezzi, librerie): vedi{' '}
        <Link to="/credits">Crediti</Link>.
      </p>

      <h2>Nessuna garanzia e limite di responsabilità</h2>
      <p>
        Il Servizio è fornito "così com'è", senza garanzie di alcun tipo, nella misura
        massima consentita dalla legge. Non siamo responsabili per perdita di dati,
        interruzioni del Servizio o danni derivanti dal suo uso, salvo nei casi in cui la
        legge non permetta di escludere la responsabilità (ad es. dolo o colpa grave).
        Nulla in questi termini limita i diritti inderogabili che la legge ti riconosce
        come consumatore.
      </p>

      <h2>Modifiche al Servizio e a questi termini</h2>
      <p>
        Possiamo modificare, sospendere o chiudere il Servizio in qualsiasi momento. Se
        aggiorniamo questi termini in modo sostanziale (ad es. introducendo un piano a
        pagamento), aggiorneremo questa pagina e la data in cima, e te lo segnaleremo
        nell'app prima che i cambiamenti si applichino al tuo uso del Servizio.
      </p>

      <h2>Lingua</h2>
      <p>
        Questi termini sono disponibili in più lingue. In caso di differenze tra le
        versioni, prevale il testo italiano.
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
