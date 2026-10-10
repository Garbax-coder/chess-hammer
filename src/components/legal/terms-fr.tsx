import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_GITHUB_URL,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function TermsFr() {
  return (
    <>
      <p>
        Dernière mise à jour : 10 octobre 2026. En utilisant {SITE_DOMAIN} (« Chess Hammer
        », « le Service »), vous acceptez les présentes conditions. Si vous ne les
        acceptez pas, n’utilisez pas le Service.
      </p>

      <h2>Le Service</h2>
      <p>
        Chess Hammer est une application web gratuite pour s’entraîner avec des puzzles
        d’échecs selon la méthode « Woodpecker » (résoudre un ensemble fixe de puzzles en
        plusieurs cycles successifs, de plus en plus vite). Le Service est aujourd’hui
        proposé gratuitement, sans publicité ni abonnement : nous ne garantissons ni sa
        continuité, ni sa disponibilité, ni l’absence d’erreurs.
      </p>

      <h2>Compte</h2>
      <ul>
        <li>Vous devez avoir au moins {MIN_AGE} ans pour vous inscrire.</li>
        <li>
          Les informations fournies à l’inscription doivent être exactes ; vous êtes
          responsable de la confidentialité de votre mot de passe et de toute activité sur
          votre compte.
        </li>
        <li>
          Vous pouvez supprimer votre compte à tout moment depuis la page{' '}
          <Link to="/profile">Profil</Link> : la suppression est définitive et immédiate.
        </li>
      </ul>

      <h2>Utilisation autorisée</h2>
      <p>En utilisant le Service, vous vous engagez à ne pas :</p>
      <ul>
        <li>
          créer de comptes avec de fausses informations ni usurper l’identité d’autrui ;
        </li>
        <li>
          tenter d’accéder aux comptes d’autres personnes ou de contourner les mesures de
          sécurité du Service ;
        </li>
        <li>
          utiliser le Service à des fins illégales ou pour diffuser des logiciels
          malveillants ou du spam ;
        </li>
        <li>
          surcharger délibérément l’infrastructure (par ex. par des requêtes automatisées
          massives).
        </li>
      </ul>
      <p>
        Nous nous réservons le droit de suspendre ou de supprimer les comptes qui
        enfreignent ces conditions.
      </p>

      <h2>Code source et licence</h2>
      <p>
        Le code source de Chess Hammer, dans la version exacte en ligne sur ce site, est
        public sous licence GNU GPLv3 ou ultérieure :{' '}
        <a href={SITE_GITHUB_URL} target="_blank" rel="noreferrer">
          {SITE_GITHUB_URL}
        </a>
        . Vous pouvez le lire, le modifier et le distribuer selon les termes de cette
        licence. Le nom « Chess Hammer » et le contenu de votre compte (vos données) ne
        sont pas couverts par la licence du code. Licences et attributions des composants
        tiers (moteur Stockfish, base de puzzles Lichess, jeux de pièces, bibliothèques) :
        voir <Link to="/credits">Crédits</Link>.
      </p>

      <h2>Absence de garantie et limitation de responsabilité</h2>
      <p>
        Le Service est fourni « tel quel », sans garantie d’aucune sorte, dans toute la
        mesure permise par la loi. Nous ne sommes pas responsables des pertes de données,
        des interruptions du Service ni des dommages résultant de son utilisation, sauf
        lorsque la loi ne permet pas d’exclure la responsabilité (par ex. faute
        intentionnelle ou faute lourde). Rien dans ces conditions ne limite les droits
        impératifs que la loi vous reconnaît en tant que consommateur.
      </p>

      <h2>Modifications du Service et des présentes conditions</h2>
      <p>
        Nous pouvons modifier, suspendre ou fermer le Service à tout moment. Si nous
        modifions ces conditions de manière substantielle (par ex. en introduisant une
        offre payante), nous mettrons à jour cette page et la date en haut, et nous vous
        le signalerons dans l’application avant que les changements ne s’appliquent à
        votre utilisation du Service.
      </p>

      <h2>Langue</h2>
      <p>
        Ces conditions sont disponibles en plusieurs langues. En cas de différence entre
        les versions, le texte italien prévaut.
      </p>

      <h2>Droit applicable et juridiction compétente</h2>
      <p>
        Ces conditions sont régies par le droit italien. Tout litige relève de la
        compétence du tribunal de {SITE_CONTROLLER_CITY} (Italie), sans préjudice des
        protections impératives accordées aux consommateurs par la loi de leur pays de
        résidence.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question sur ces conditions, écrivez à{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>. Responsable :{' '}
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italie.
      </p>
    </>
  )
}
