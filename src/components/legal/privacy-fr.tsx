import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function PrivacyFr() {
  return (
    <>
      <p>
        Dernière mise à jour : 10 octobre 2026. Cette politique décrit quelles données
        personnelles {SITE_DOMAIN} (« Chess Hammer », « le Service ») collecte, à quelles
        fins et de quels droits vous disposez, conformément au règlement (UE) 2016/679
        (RGPD).
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italie. Pour toute demande
        concernant vos données, écrivez à{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a> : nous répondons
        sous 30 jours. Le Service est aujourd’hui proposé gratuitement par une personne
        physique, sans activité commerciale enregistrée : si le Service passait à l’avenir
        à une forme de société, cette page serait mise à jour avec les coordonnées du
        nouveau responsable.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>
          <b>Données de compte :</b> adresse e-mail, mot de passe (jamais lisible par nous
          : il est conservé sous forme de hachage par Supabase Auth) ou, si vous utilisez
          « Continuer avec Google », le nom, l’e-mail et la photo de profil fournis par
          Google.
        </li>
        <li>
          <b>Données d’entraînement :</b> les puzzles qui vous sont proposés, vos
          tentatives (résolu/raté, temps passé), votre classement ELO et les sessions
          d’entraînement que vous créez.
        </li>
        <li>
          <b>Préférences :</b> langue, thème clair/sombre, style de l’application, style
          de l’échiquier et jeu de pièces, sons activés/désactivés, passage automatique,
          filtre de l’entraînement libre.
        </li>
        <li>
          <b>Rapports d’erreur :</b> si l’application rencontre une erreur, un rapport
          technique (message d’erreur, page, type de navigateur et de système
          d’exploitation, version de l’application, identifiants techniques comme celui de
          la session d’entraînement). Il ne contient ni votre e-mail, ni votre nom, ni
          votre adresse IP.
        </li>
        <li>
          <b>Données techniques minimales :</b> adresse IP et informations du navigateur,
          traitées par nos prestataires d’infrastructure (ci-dessous) uniquement pour
          faire fonctionner et sécuriser le Service ; nous ne les utilisons pas pour vous
          profiler.
        </li>
      </ul>
      <p>
        Nous ne collectons aucune donnée de paiement : le Service est aujourd’hui gratuit.
      </p>

      <h2>Pourquoi nous les collectons</h2>
      <ul>
        <li>
          <b>Fournir le Service que vous avez demandé</b> (créer et utiliser votre compte,
          suivre vos entraînements, afficher votre historique) : base légale, exécution du
          contrat d’utilisation que vous acceptez à l’inscription.
        </li>
        <li>
          <b>E-mails de service</b> (confirmation du compte, réinitialisation du mot de
          passe) : même base, exécution du contrat.
        </li>
        <li>
          <b>Sécurité</b> (prévenir les abus et les accès non autorisés) : intérêt
          légitime à protéger le Service et ses utilisateurs.
        </li>
        <li>
          <b>Correction des erreurs</b> (savoir quand et où l’application tombe en panne,
          et vérifier que le site est accessible) : intérêt légitime à offrir un Service
          qui fonctionne.
        </li>
        <li>
          <b>Statistiques d’utilisation agrégées</b> (combien de personnes s’entraînent, à
          quelle fréquence elles reviennent), tirées des données du Service sans outil de
          suivi, pour l’améliorer et décider de son évolution : intérêt légitime. Seuls
          des chiffres globaux sont utilisés, jamais des profils individuels.
        </li>
      </ul>
      <p>
        Nous n’affichons pas de publicité, ne vendons ni ne cédons vos données à des tiers
        à des fins de marketing, et ne les utilisons pas pour du profilage commercial.
      </p>

      <h2>Qui traite les données pour notre compte</h2>
      <p>Nous ne partageons les données qu’avec ceux qui font fonctionner le Service :</p>
      <ul>
        <li>
          <b>Supabase</b> (base de données, authentification) — infrastructure dans la
          région UE.
        </li>
        <li>
          <b>Vercel</b> (hébergement du site) — infrastructure dans la région UE.
        </li>
        <li>
          <b>Resend</b> (envoi des e-mails de service via le domaine {SITE_DOMAIN}).
        </li>
        <li>
          <b>Google Cloud</b> (stockage privé des copies de sauvegarde de la base de
          données) — infrastructure dans la région UE (Belgique).
        </li>
        <li>
          <b>Sentry</b> (rapports d’erreur et contrôle de l’accessibilité du site) —
          données conservées dans la région UE (Allemagne). Le contrôle d’accessibilité
          interroge le site depuis plusieurs pays et ne concerne aucune donnée
          personnelle.
        </li>
        <li>
          <b>Google</b> (uniquement si vous choisissez « Continuer avec Google ») : Google
          traite les données en tant que responsable autonome selon sa propre politique de
          confidentialité.
        </li>
      </ul>
      <p>
        Lorsqu’un prestataire traite des données hors de l’Union européenne, il le fait
        dans le cadre des garanties appropriées prévues par le RGPD (par ex. clauses
        contractuelles types).
      </p>

      <h2>Où les données sont conservées et pendant combien de temps</h2>
      <p>
        Les données sont conservées tant que votre compte est actif. Vous pouvez
        télécharger une copie de vos données et supprimer définitivement votre compte à
        tout moment depuis la page <Link to="/profile">Profil</Link> : la suppression est
        immédiate et efface aussi les sessions, tentatives et statistiques associées. Pour
        protéger les données contre les pannes, une copie de sauvegarde de la base de
        données est enregistrée chaque semaine sur Google Cloud, dans un stockage privé
        dans l’Union européenne, et conservée au maximum 8 semaines : passé ce délai, les
        données d’un compte supprimé disparaissent aussi des copies. Les rapports d’erreur
        sont supprimés après 30 jours.
      </p>

      <h2>Cookies et stockage du navigateur</h2>
      <p>
        Le Service n’utilise pas de cookies de profilage ou tiers, et n’a pas besoin de
        bandeau de consentement : nous utilisons seulement le stockage technique du
        navigateur (localStorage) nécessaire à son fonctionnement :
      </p>
      <ul>
        <li>la session de connexion (pour rester connecté, gérée par Supabase Auth) ;</li>
        <li>
          langue, thème, sons, style de l’échiquier, jeu de pièces, réglages du moteur
          d’analyse ;
        </li>
        <li>
          une copie de la liste des puzzles de la session en cours, pour ne pas la
          retélécharger entièrement à chaque visite (effacée à la déconnexion).
        </li>
      </ul>
      <p>Aucune de ces données ne quitte votre navigateur à des fins de suivi.</p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation du
        traitement, de portabilité des données et d’opposition, ainsi que du droit
        d’introduire une réclamation auprès de l’
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
          autorité italienne de protection des données (Garante)
        </a>{' '}
        ou de l’autorité de votre pays, comme la CNIL en France. L’accès et la suppression
        des données sont disponibles en libre-service dans votre profil ; pour toute autre
        demande, écrivez à{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
      </p>

      <h2>Âge minimum</h2>
      <p>
        Le Service est destiné aux utilisateurs âgés d’au moins {MIN_AGE} ans. C’est l’âge
        le plus élevé fixé par les pays de l’Union européenne pour consentir seul aux
        services en ligne, et nous l’appliquons dans tous les pays.
      </p>

      <h2>Langue</h2>
      <p>
        Cette politique est disponible en plusieurs langues. En cas de différence entre
        les versions, le texte italien prévaut.
      </p>

      <h2>Modifications de cette politique</h2>
      <p>
        Si nous modifions cette politique de manière substantielle (par ex. passage à un
        modèle payant, ajout de publicité ou de nouveaux prestataires), nous mettrons à
        jour cette page et la date en haut, et nous vous le signalerons dans
        l’application.
      </p>
    </>
  )
}
