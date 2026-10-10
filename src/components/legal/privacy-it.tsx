import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function PrivacyIt() {
  return (
    <>
      <p>
        Ultimo aggiornamento: 10 ottobre 2026. Questa informativa descrive quali dati
        personali raccoglie {SITE_DOMAIN} ("Chess Hammer", "il Servizio"), per quali
        finalità e con quali diritti puoi gestirli, in base al Regolamento (UE) 2016/679
        (GDPR).
      </p>

      <h2>Titolare del trattamento</h2>
      <p>
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italia. Per qualsiasi richiesta
        relativa ai tuoi dati scrivi a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>: rispondiamo
        entro 30 giorni. Il Servizio è oggi offerto gratuitamente da una persona fisica,
        senza partita IVA: se in futuro il Servizio passasse a una forma societaria,
        questa pagina verrà aggiornata con i nuovi dati del titolare.
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
          <b>Segnalazioni di errore:</b> se l'app incontra un errore, una segnalazione
          tecnica (messaggio d'errore, pagina, tipo di browser e sistema operativo,
          versione dell'app, identificativi tecnici come quello della sessione di
          allenamento). Non contiene la tua email, il tuo nome né il tuo indirizzo IP.
        </li>
        <li>
          <b>Dati tecnici minimi:</b> indirizzo IP e informazioni del browser, trattati
          dai nostri fornitori di infrastruttura (sotto) per il solo funzionamento del
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
          <b>Correzione degli errori</b> (sapere quando e dove l'app si guasta, e
          controllare che il sito sia raggiungibile): legittimo interesse a offrire un
          Servizio funzionante.
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
          <b>Sentry</b> (segnalazioni di errore e controllo della raggiungibilità del
          sito) — dati conservati nella regione UE (Germania). Il controllo di
          raggiungibilità interroga il sito da più paesi e non riguarda dati personali.
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
        dalle copie. Le segnalazioni di errore sono cancellate dopo 30 giorni.
      </p>

      <h2>Cookie e memoria del browser</h2>
      <p>
        Il Servizio non usa cookie di profilazione o di terze parti, e non ha bisogno di
        un banner di consenso: usiamo solo la memoria tecnica del browser (localStorage)
        necessaria al suo funzionamento:
      </p>
      <ul>
        <li>la sessione di accesso (per restare collegato, gestita da Supabase Auth);</li>
        <li>
          lingua, tema, suoni, stile scacchiera, set di pezzi, impostazioni del motore di
          analisi;
        </li>
        <li>
          una copia della lista puzzle della sessione in corso, per non riscaricarla
          intera a ogni visita (cancellata quando esci dall'account).
        </li>
      </ul>
      <p>Nessuno di questi dati lascia il tuo browser per finalità di tracciamento.</p>

      <h2>I tuoi diritti</h2>
      <p>
        Hai diritto di accesso, rettifica, cancellazione, limitazione del trattamento,
        portabilità dei dati e opposizione, oltre al diritto di proporre reclamo al{' '}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
          Garante per la protezione dei dati personali
        </a>{' '}
        o all'autorità del tuo paese. Accesso e cancellazione dei dati sono disponibili in
        autonomia nel tuo profilo; per qualunque altra richiesta scrivi a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
      </p>

      <h2>Età minima</h2>
      <p>
        Il Servizio è destinato a utenti che hanno compiuto almeno {MIN_AGE} anni. È l'età
        più alta tra quelle previste nei paesi dell'Unione Europea per prestare da soli il
        consenso ai servizi online, e la applichiamo in tutti i paesi.
      </p>

      <h2>Lingua</h2>
      <p>
        Questa informativa è disponibile in più lingue. In caso di differenze tra le
        versioni, prevale il testo italiano.
      </p>

      <h2>Modifiche a questa informativa</h2>
      <p>
        Se cambiamo in modo sostanziale questa informativa (ad es. passando a un modello a
        pagamento, aggiungendo pubblicità o nuovi fornitori) aggiorneremo questa pagina e
        la data in cima, e te lo segnaleremo nell'app.
      </p>
    </>
  )
}
