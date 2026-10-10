import { Link } from 'react-router-dom'
import { SiteFooter } from '@/components/site-footer'
import { useLanguage } from '@/lib/language-context'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'

const UPDATED_AT = { it: '4 ottobre 2026', en: 'October 4, 2026' }

function ContentIt() {
  return (
    <>
      <p>
        Ultimo aggiornamento: {UPDATED_AT.it}. Questa informativa descrive quali dati
        personali raccoglie {SITE_DOMAIN} ("Chess Hammer", "il Servizio"), per quali
        finalità e con quali diritti puoi gestirli, in base al Regolamento (UE) 2016/679
        (GDPR).
      </p>

      <h2>Titolare del trattamento</h2>
      <p>
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italia. Per qualsiasi richiesta
        relativa ai tuoi dati scrivi a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>: rispondiamo entro
        30 giorni. Il Servizio è oggi offerto gratuitamente da una persona fisica, senza
        partita IVA: se in futuro il Servizio passasse a una forma societaria, questa pagina
        verrà aggiornata con i nuovi dati del titolare.
      </p>

      <h2>Dati che raccogliamo</h2>
      <ul>
        <li>
          <b>Dati di account:</b> indirizzo email, password (mai leggibile da noi: è
          salvata come hash da Supabase Auth) oppure, se usi "Continua con Google", nome,
          email e immagine del profilo forniti da Google.
        </li>
        <li>
          <b>Dati di allenamento:</b> i puzzle che ti vengono proposti, i tentativi
          (risolto/fallito, tempo impiegato), il tuo punteggio ELO e le sessioni di
          allenamento che crei.
        </li>
        <li>
          <b>Preferenze:</b> lingua, tema chiaro/scuro, stile dell'app, stile scacchiera e
          set di pezzi, suoni attivi/disattivi, avanzamento automatico, filtro della
          pratica libera.
        </li>
        <li>
          <b>Dati tecnici minimi:</b> indirizzo IP e informazioni del browser, trattati dai
          nostri fornitori di infrastruttura (sotto) per il solo funzionamento del
          Servizio e la sicurezza; non li usiamo per profilarti.
        </li>
      </ul>
      <p>Non raccogliamo dati di pagamento: il Servizio non prevede oggi alcun costo.</p>

      <h2>Perché li raccogliamo</h2>
      <ul>
        <li>
          <b>Fornire il Servizio che hai richiesto</b> (creare e usare il tuo account,
          tracciare i tuoi allenamenti, mostrarti lo storico): base giuridica, esecuzione
          del contratto d'uso che accetti alla registrazione.
        </li>
        <li>
          <b>Email di servizio</b> (conferma dell'account, reimpostazione della password):
          stessa base, esecuzione del contratto.
        </li>
        <li>
          <b>Sicurezza</b> (prevenire abusi, accessi non autorizzati): legittimo interesse
          a proteggere il Servizio e i suoi utenti.
        </li>
        <li>
          <b>Statistiche d'uso aggregate</b> (quante persone si allenano, quanto spesso
          tornano), ricavate dai dati del Servizio senza strumenti di tracciamento, per
          migliorarlo e decidere come svilupparlo: legittimo interesse. Si usano solo
          numeri complessivi, mai profili dei singoli utenti.
        </li>
      </ul>
      <p>
        Non mostriamo pubblicità, non vendiamo né cediamo i tuoi dati a terzi per finalità
        di marketing, e non li usiamo per profilazione commerciale.
      </p>

      <h2>Chi tratta i dati per nostro conto</h2>
      <p>Condividiamo i dati solo con chi fa funzionare materialmente il Servizio:</p>
      <ul>
        <li>
          <b>Supabase</b> (database, autenticazione) — infrastruttura nella regione UE.
        </li>
        <li>
          <b>Vercel</b> (hosting del sito) — infrastruttura nella regione UE.
        </li>
        <li>
          <b>Resend</b> (invio delle email di servizio tramite il dominio {SITE_DOMAIN}).
        </li>
        <li>
          <b>Google Cloud</b> (archivio privato delle copie di sicurezza del database) —
          infrastruttura nella regione UE (Belgio).
        </li>
        <li>
          <b>Google</b> (solo se scegli di accedere con "Continua con Google"): Google
          tratta i dati come titolare autonomo secondo la propria informativa.
        </li>
      </ul>
      <p>
        Quando un fornitore tratta dati fuori dall'Unione Europea, lo fa nell'ambito di
        garanzie adeguate previste dal GDPR (ad es. clausole contrattuali standard).
      </p>

      <h2>Dove sono conservati i dati e per quanto tempo</h2>
      <p>
        I dati restano finché il tuo account è attivo. Puoi scaricare una copia dei tuoi
        dati ed eliminare definitivamente il tuo account in qualsiasi momento dalla pagina{' '}
        <Link to="/profile">Profilo</Link>: l'eliminazione è immediata e cancella anche
        sessioni, tentativi e statistiche collegate. Per proteggere i dati da guasti, una
        copia di sicurezza del database viene salvata ogni settimana su Google Cloud, in
        un archivio privato nell'Unione Europea, e conservata per un massimo di 8
        settimane: entro questo termine i dati di un account eliminato spariscono anche
        dalle copie.
      </p>

      <h2>Cookie e memoria del browser</h2>
      <p>
        Il Servizio non usa cookie di profilazione o di terze parti, e non ha bisogno di un
        banner di consenso: usiamo solo la memoria tecnica del browser (localStorage)
        necessaria al suo funzionamento:
      </p>
      <ul>
        <li>la sessione di accesso (per restare collegato, gestita da Supabase Auth);</li>
        <li>lingua, tema, suoni, stile scacchiera, set di pezzi, impostazioni del motore di analisi;</li>
        <li>
          una copia della lista puzzle della sessione in corso, per non riscaricarla intera
          a ogni visita (cancellata quando esci dall'account).
        </li>
      </ul>
      <p>Nessuno di questi dati lascia il tuo browser per finalità di tracciamento.</p>

      <h2>I tuoi diritti</h2>
      <p>
        Hai diritto di accesso, rettifica, cancellazione, limitazione del trattamento,
        portabilità dei dati e opposizione, oltre al diritto di proporre reclamo al{' '}
        <a
          href="https://www.garanteprivacy.it"
          target="_blank"
          rel="noreferrer"
        >
          Garante per la protezione dei dati personali
        </a>
        . Accesso e cancellazione dei dati sono disponibili in autonomia nel tuo profilo;
        per qualunque altra richiesta scrivi a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
      </p>

      <h2>Età minima</h2>
      <p>
        Il Servizio è destinato a utenti che hanno compiuto almeno 14 anni, l'età minima
        prevista dalla normativa italiana per prestare da soli il consenso ai servizi della
        società dell'informazione.
      </p>

      <h2>Modifiche a questa informativa</h2>
      <p>
        Se cambiamo in modo sostanziale questa informativa (ad es. passando a un modello a
        pagamento, aggiungendo pubblicità o nuovi fornitori) aggiorneremo questa pagina e la
        data in cima, e te lo segnaleremo nell'app.
      </p>
    </>
  )
}

function ContentEn() {
  return (
    <>
      <p>
        Last updated: {UPDATED_AT.en}. This notice describes what personal data{' '}
        {SITE_DOMAIN} ("Chess Hammer", "the Service") collects, why, and what rights you
        have over it, under Regulation (EU) 2016/679 (GDPR).
      </p>

      <h2>Data controller</h2>
      <p>
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italy. For any request about your
        data, write to <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>: we
        reply within 30 days. The Service is currently offered for free by an individual,
        with no registered business yet: if the Service later moves to a company, this page
        will be updated with the new controller's details.
      </p>

      <h2>Data we collect</h2>
      <ul>
        <li>
          <b>Account data:</b> email address, password (never readable by us: stored as a
          hash by Supabase Auth), or, if you use "Continue with Google", the name, email
          and profile picture Google provides.
        </li>
        <li>
          <b>Training data:</b> the puzzles shown to you, your attempts (solved/failed,
          time taken), your ELO rating, and the training sessions you create.
        </li>
        <li>
          <b>Preferences:</b> language, light/dark theme, app style, board style and piece
          set, sound on/off, auto-advance, free practice filter.
        </li>
        <li>
          <b>Minimal technical data:</b> IP address and browser information, processed by
          our infrastructure providers (below) only to run and secure the Service; we don't
          use it to profile you.
        </li>
      </ul>
      <p>We don't collect payment data: the Service has no cost today.</p>

      <h2>Why we collect it</h2>
      <ul>
        <li>
          <b>To provide the Service you asked for</b> (create and use your account, track
          your training, show your history): legal basis, performance of the usage
          agreement you accept at signup.
        </li>
        <li>
          <b>Service emails</b> (account confirmation, password reset): same basis,
          contract performance.
        </li>
        <li>
          <b>Security</b> (preventing abuse, unauthorized access): legitimate interest in
          protecting the Service and its users.
        </li>
        <li>
          <b>Aggregate usage statistics</b> (how many people train, how often they come
          back), derived from the Service's own data without any tracking tools, to
          improve it and decide how to develop it: legitimate interest. Only overall
          numbers are used, never profiles of individual users.
        </li>
      </ul>
      <p>
        We show no advertising, we don't sell or share your data with third parties for
        marketing purposes, and we don't use it for commercial profiling.
      </p>

      <h2>Who processes data on our behalf</h2>
      <p>We only share data with who actually makes the Service run:</p>
      <ul>
        <li>
          <b>Supabase</b> (database, authentication) — EU-region infrastructure.
        </li>
        <li>
          <b>Vercel</b> (site hosting) — EU-region infrastructure.
        </li>
        <li>
          <b>Resend</b> (sending service emails through the {SITE_DOMAIN} domain).
        </li>
        <li>
          <b>Google Cloud</b> (private storage for database backup copies) — EU-region
          infrastructure (Belgium).
        </li>
        <li>
          <b>Google</b> (only if you choose "Continue with Google"): Google processes data
          as an independent controller per its own privacy notice.
        </li>
      </ul>
      <p>
        When a provider processes data outside the European Union, it does so under GDPR
        safeguards (e.g. standard contractual clauses).
      </p>

      <h2>Where data is stored and for how long</h2>
      <p>
        Data stays as long as your account is active. You can download a copy of your data
        and permanently delete your account at any time from your{' '}
        <Link to="/profile">Profile</Link> page: deletion is immediate and also removes
        linked sessions, attempts and statistics. To protect data against failures, a
        backup copy of the database is saved every week on Google Cloud, in private
        storage in the European Union, and kept for at most 8 weeks: within that period a
        deleted account's data also disappears from the copies.
      </p>

      <h2>Cookies and browser storage</h2>
      <p>
        The Service doesn't use tracking or third-party cookies, and needs no consent
        banner: we only use the technical browser storage (localStorage) necessary for it
        to work:
      </p>
      <ul>
        <li>your sign-in session (to keep you logged in, managed by Supabase Auth);</li>
        <li>language, theme, sound, board style, piece set, analysis engine settings;</li>
        <li>
          a copy of the current session's puzzle list, so it isn't downloaded in full on
          every visit (deleted when you sign out).
        </li>
      </ul>
      <p>None of this data leaves your browser for tracking purposes.</p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, rectify, erase, restrict processing of, port, and
        object to the use of your data, as well as the right to lodge a complaint with the{' '}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
          Italian Data Protection Authority (Garante)
        </a>{' '}
        or your own country's authority. Access and deletion are self-service from your
        profile; for any other request write to{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
      </p>

      <h2>Minimum age</h2>
      <p>
        The Service is intended for users aged 14 or older, the minimum age under Italian
        law to consent on your own to information-society services.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        If we make a substantial change to this notice (e.g. moving to a paid model, adding
        advertising, or new providers) we'll update this page and the date at the top, and
        flag it inside the app.
      </p>
    </>
  )
}

export default function PrivacyPage() {
  const { language, t } = useLanguage()

  return (
    <main className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.privacy.title}
        </h1>
        <div className="text-muted-foreground [&_a]:text-primary flex flex-col gap-4 text-sm leading-relaxed [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:text-foreground [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-medium [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {language === 'it' ? <ContentIt /> : <ContentEn />}
        </div>
        <Link to="/" className="text-primary w-fit text-sm underline-offset-4 hover:underline">
          {t.privacy.back}
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
