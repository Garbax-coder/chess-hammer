import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_GITHUB_URL,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function TermsDe() {
  return (
    <>
      <p>
        Zuletzt aktualisiert: 10. Oktober 2026. Mit der Nutzung von {SITE_DOMAIN} („Chess
        Hammer“, „der Dienst“) akzeptierst du diese Bedingungen. Wenn du sie nicht
        akzeptierst, nutze den Dienst nicht.
      </p>

      <h2>Was der Dienst ist</h2>
      <p>
        Chess Hammer ist eine kostenlose Web-App zum Training mit Schachpuzzles nach der
        „Woodpecker“-Methode (ein festes Puzzle-Set in mehreren aufeinanderfolgenden
        Durchgängen lösen, jedes Mal schneller). Der Dienst wird derzeit kostenlos
        angeboten, ohne Werbung und ohne Abonnement: Wir übernehmen keine Gewähr für
        Fortbestand, Verfügbarkeit oder Fehlerfreiheit.
      </p>

      <h2>Konto</h2>
      <ul>
        <li>Für die Registrierung musst du mindestens {MIN_AGE} Jahre alt sein.</li>
        <li>
          Die Angaben bei der Registrierung müssen korrekt sein; du bist dafür
          verantwortlich, dein Passwort geheim zu halten, und für alle Aktivitäten in
          deinem Konto.
        </li>
        <li>
          Du kannst dein Konto jederzeit auf der Seite <Link to="/profile">Profil</Link>{' '}
          löschen: Die Löschung erfolgt sofort und endgültig.
        </li>
      </ul>

      <h2>Zulässige Nutzung</h2>
      <p>Mit der Nutzung des Dienstes verpflichtest du dich, Folgendes zu unterlassen:</p>
      <ul>
        <li>
          Konten mit falschen Angaben anzulegen oder dich als andere Person auszugeben;
        </li>
        <li>
          zu versuchen, auf fremde Konten zuzugreifen oder die Sicherheitsmaßnahmen des
          Dienstes zu umgehen;
        </li>
        <li>
          den Dienst für rechtswidrige Zwecke oder zur Verbreitung von Schadsoftware oder
          Spam zu nutzen;
        </li>
        <li>
          die Infrastruktur absichtlich zu überlasten (z. B. durch massenhafte
          automatisierte Anfragen).
        </li>
      </ul>
      <p>
        Wir behalten uns vor, Konten, die gegen diese Bedingungen verstoßen, zu sperren
        oder zu löschen.
      </p>

      <h2>Quellcode und Lizenz</h2>
      <p>
        Der Quellcode von Chess Hammer ist in genau der Version, die auf dieser Website
        läuft, unter der GNU GPLv3 oder später öffentlich:{' '}
        <a href={SITE_GITHUB_URL} target="_blank" rel="noreferrer">
          {SITE_GITHUB_URL}
        </a>
        . Du darfst ihn gemäß dieser Lizenz lesen, verändern und weitergeben. Der Name
        „Chess Hammer“ und die Inhalte deines Kontos (deine Daten) sind nicht von der
        Lizenz des Codes erfasst. Lizenzen und Nachweise von Komponenten Dritter
        (Stockfish-Engine, Lichess-Puzzle-Datenbank, Figurensätze, Bibliotheken): siehe{' '}
        <Link to="/credits">Danksagungen</Link>.
      </p>

      <h2>Keine Gewährleistung und Haftungsbeschränkung</h2>
      <p>
        Der Dienst wird „wie besehen“ bereitgestellt, ohne jegliche Gewährleistung, soweit
        gesetzlich zulässig. Wir haften nicht für Datenverlust, Unterbrechungen des
        Dienstes oder Schäden aus seiner Nutzung, außer in Fällen, in denen das Gesetz
        einen Haftungsausschluss nicht zulässt (z. B. Vorsatz oder grobe Fahrlässigkeit).
        Nichts in diesen Bedingungen schränkt die zwingenden Rechte ein, die dir das
        Gesetz als Verbraucher gewährt.
      </p>

      <h2>Änderungen des Dienstes und dieser Bedingungen</h2>
      <p>
        Wir können den Dienst jederzeit ändern, aussetzen oder einstellen. Wenn wir diese
        Bedingungen wesentlich ändern (z. B. durch Einführung eines kostenpflichtigen
        Angebots), aktualisieren wir diese Seite und das Datum oben und weisen dich in der
        App darauf hin, bevor die Änderungen für deine Nutzung gelten.
      </p>

      <h2>Sprache</h2>
      <p>
        Diese Bedingungen sind in mehreren Sprachen verfügbar. Bei Abweichungen zwischen
        den Fassungen ist der italienische Text maßgeblich.
      </p>

      <h2>Anwendbares Recht und Gerichtsstand</h2>
      <p>
        Diese Bedingungen unterliegen italienischem Recht. Für alle Streitigkeiten ist das
        Gericht in {SITE_CONTROLLER_CITY} (Italien) zuständig, unbeschadet der zwingenden
        Verbraucherschutzvorschriften deines Wohnsitzlandes.
      </p>

      <h2>Kontakt</h2>
      <p>
        Bei Fragen zu diesen Bedingungen schreib an{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
        Verantwortlicher: {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italien.
      </p>
    </>
  )
}
