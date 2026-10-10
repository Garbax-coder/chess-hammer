import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function PrivacyDe() {
  return (
    <>
      <p>
        Zuletzt aktualisiert: 10. Oktober 2026. Diese Datenschutzerklärung beschreibt,
        welche personenbezogenen Daten {SITE_DOMAIN} („Chess Hammer“, „der Dienst“)
        erhebt, zu welchen Zwecken und welche Rechte du daran hast, gemäß der Verordnung
        (EU) 2016/679 (DSGVO).
      </p>

      <h2>Verantwortlicher</h2>
      <p>
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italien. Für alle Anfragen zu
        deinen Daten schreib an{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>: Wir antworten
        innerhalb von 30 Tagen. Der Dienst wird derzeit kostenlos von einer Privatperson
        ohne angemeldetes Gewerbe angeboten: Sollte der Dienst künftig von einer
        Gesellschaft betrieben werden, wird diese Seite mit den Angaben des neuen
        Verantwortlichen aktualisiert.
      </p>

      <h2>Welche Daten wir erheben</h2>
      <ul>
        <li>
          <b>Kontodaten:</b> E-Mail-Adresse, Passwort (für uns nie lesbar: Supabase Auth
          speichert es als Hash) oder, wenn du „Weiter mit Google“ nutzt, Name, E-Mail und
          Profilbild, die Google übermittelt.
        </li>
        <li>
          <b>Trainingsdaten:</b> die Puzzles, die dir angezeigt werden, deine Versuche
          (gelöst/verfehlt, benötigte Zeit), deine ELO-Wertung und die Trainingssessions,
          die du anlegst.
        </li>
        <li>
          <b>Einstellungen:</b> Sprache, helles/dunkles Design, App-Stil, Brettstil und
          Figurensatz, Töne an/aus, automatisches Weiterschalten, Filter für freies Üben.
        </li>
        <li>
          <b>Fehlerberichte:</b> Wenn in der App ein Fehler auftritt, ein technischer
          Bericht (Fehlermeldung, Seite, Browser- und Betriebssystemtyp, App-Version,
          technische Kennungen wie die der Trainingssession). Er enthält weder deine
          E-Mail-Adresse noch deinen Namen oder deine IP-Adresse.
        </li>
        <li>
          <b>Minimale technische Daten:</b> IP-Adresse und Browserinformationen, die
          unsere Infrastrukturanbieter (siehe unten) nur für Betrieb und Sicherheit des
          Dienstes verarbeiten; wir nutzen sie nicht, um Profile zu erstellen.
        </li>
      </ul>
      <p>Wir erheben keine Zahlungsdaten: Der Dienst ist derzeit kostenlos.</p>

      <h2>Warum wir sie erheben</h2>
      <ul>
        <li>
          <b>Bereitstellung des Dienstes, den du angefordert hast</b> (Konto anlegen und
          nutzen, Training aufzeichnen, Verlauf anzeigen): Rechtsgrundlage ist die
          Erfüllung des Nutzungsvertrags, den du bei der Registrierung akzeptierst.
        </li>
        <li>
          <b>Service-E-Mails</b> (Kontobestätigung, Zurücksetzen des Passworts): gleiche
          Grundlage, Vertragserfüllung.
        </li>
        <li>
          <b>Sicherheit</b> (Missbrauch und unbefugte Zugriffe verhindern): berechtigtes
          Interesse am Schutz des Dienstes und seiner Nutzer.
        </li>
        <li>
          <b>Fehlerbehebung</b> (erfahren, wann und wo die App Fehler hat, und prüfen, ob
          die Website erreichbar ist): berechtigtes Interesse an einem funktionierenden
          Dienst.
        </li>
        <li>
          <b>Zusammengefasste Nutzungsstatistiken</b> (wie viele Personen trainieren, wie
          oft sie wiederkommen), aus den Daten des Dienstes ohne Tracking-Werkzeuge
          gewonnen, um ihn zu verbessern und seine Weiterentwicklung zu planen:
          berechtigtes Interesse. Es werden nur Gesamtzahlen verwendet, nie Profile
          einzelner Nutzer.
        </li>
      </ul>
      <p>
        Wir zeigen keine Werbung, verkaufen oder überlassen deine Daten nicht an Dritte zu
        Marketingzwecken und nutzen sie nicht für kommerzielles Profiling.
      </p>

      <h2>Wer Daten in unserem Auftrag verarbeitet</h2>
      <p>Wir geben Daten nur an diejenigen weiter, die den Dienst technisch betreiben:</p>
      <ul>
        <li>
          <b>Supabase</b> (Datenbank, Authentifizierung) — Infrastruktur in der EU-Region.
        </li>
        <li>
          <b>Vercel</b> (Hosting der Website) — Infrastruktur in der EU-Region.
        </li>
        <li>
          <b>Resend</b> (Versand der Service-E-Mails über die Domain {SITE_DOMAIN}).
        </li>
        <li>
          <b>Google Cloud</b> (privater Speicher für Sicherungskopien der Datenbank) —
          Infrastruktur in der EU-Region (Belgien).
        </li>
        <li>
          <b>Sentry</b> (Fehlerberichte und Prüfung der Erreichbarkeit der Website) —
          Daten gespeichert in der EU-Region (Deutschland). Die Erreichbarkeitsprüfung
          ruft die Website aus mehreren Ländern auf und betrifft keine personenbezogenen
          Daten.
        </li>
        <li>
          <b>Cloudflare</b> („Turnstile“-Prüfung gegen Bots bei Registrierung, Anmeldung
          und Zurücksetzen des Passworts).
        </li>
        <li>
          <b>Have I Been Pwned</b> (Prüfung, ob das gewählte Passwort in bekannten
          Datenlecks vorkommt): Aus dem Browser wird nur ein Bruchstück seines
          kryptografischen Fingerabdrucks übertragen, nie das Passwort.
        </li>
        <li>
          <b>Google</b> (nur wenn du „Weiter mit Google“ wählst): Google verarbeitet die
          Daten als eigenständiger Verantwortlicher gemäß seiner eigenen
          Datenschutzerklärung.
        </li>
      </ul>
      <p>
        Wenn ein Anbieter Daten außerhalb der Europäischen Union verarbeitet, geschieht
        dies mit den von der DSGVO vorgesehenen geeigneten Garantien (z. B.
        Standardvertragsklauseln).
      </p>

      <h2>Wo und wie lange die Daten gespeichert werden</h2>
      <p>
        Die Daten bleiben gespeichert, solange dein Konto aktiv ist. Du kannst jederzeit
        auf der Seite <Link to="/profile">Profil</Link> eine Kopie deiner Daten
        herunterladen und dein Konto endgültig löschen: Die Löschung erfolgt sofort und
        entfernt auch die zugehörigen Sessions, Versuche und Statistiken. Zum Schutz vor
        Ausfällen wird jede Woche eine Sicherungskopie der Datenbank in einem privaten
        Speicher von Google Cloud in der Europäischen Union abgelegt und höchstens 8
        Wochen aufbewahrt: Innerhalb dieser Frist verschwinden die Daten eines gelöschten
        Kontos auch aus den Kopien. Fehlerberichte werden nach 30 Tagen gelöscht.
      </p>

      <h2>Cookies und Browserspeicher</h2>
      <p>
        Der Dienst verwendet keine Tracking- oder Drittanbieter-Cookies und braucht kein
        Einwilligungsbanner: Wir nutzen nur den technischen Speicher des Browsers
        (localStorage), der für den Betrieb nötig ist:
      </p>
      <ul>
        <li>
          deine Anmeldesitzung (damit du angemeldet bleibst, verwaltet von Supabase Auth);
        </li>
        <li>
          Sprache, Design, Töne, Brettstil, Figurensatz, Einstellungen der Analyse-Engine;
        </li>
        <li>
          eine Kopie der Puzzleliste der laufenden Session, damit sie nicht bei jedem
          Besuch vollständig neu geladen wird (wird beim Abmelden gelöscht).
        </li>
      </ul>
      <p>Keine dieser Daten verlässt deinen Browser zu Trackingzwecken.</p>

      <h2>Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
        Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, Beschwerde bei
        der{' '}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
          italienischen Datenschutzbehörde (Garante)
        </a>{' '}
        oder bei der Aufsichtsbehörde deines Landes einzulegen. Auskunft und Löschung
        kannst du selbst im Profil erledigen; für alle anderen Anfragen schreib an{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
      </p>

      <h2>Mindestalter</h2>
      <p>
        Der Dienst richtet sich an Nutzer ab {MIN_AGE} Jahren. Das ist das höchste Alter,
        das die Länder der Europäischen Union für die eigenständige Einwilligung in
        Online-Dienste festlegen, und wir wenden es in allen Ländern an.
      </p>

      <h2>Sprache</h2>
      <p>
        Diese Datenschutzerklärung ist in mehreren Sprachen verfügbar. Bei Abweichungen
        zwischen den Fassungen ist der italienische Text maßgeblich.
      </p>

      <h2>Änderungen dieser Erklärung</h2>
      <p>
        Wenn wir diese Erklärung wesentlich ändern (z. B. Umstellung auf ein
        kostenpflichtiges Modell, Werbung oder neue Anbieter), aktualisieren wir diese
        Seite und das Datum oben und weisen dich in der App darauf hin.
      </p>
    </>
  )
}
