import type { MarketingCopy } from './marketing'

export const fr: MarketingCopy = {
  nav: {
    guide: 'La méthode',
    signIn: 'Connexion',
    startFree: 'Commencer',
    goToDashboard: 'Tableau de bord',
    languageMenu: 'Langue',
  },
  seo: {
    home: {
      title: 'Chess Hammer — Entraîneur de tactique aux échecs, gratuit',
      description:
        'Entraînez votre tactique aux échecs avec la méthode Woodpecker : les mêmes puzzles Lichess en trois cycles, de plus en plus vite. Gratuit, sans publicité.',
    },
    guide: {
      title: 'Méthode Woodpecker : guide et entraînement gratuit | Chess Hammer',
      description:
        'Ce qu’est la méthode Woodpecker, pourquoi répéter les mêmes puzzles fonctionne et comment organiser les trois cycles. Avec un entraîneur en ligne gratuit.',
    },
  },
  puzzle: {
    prompt: 'Aux Noirs de jouer : trouvez le coup qui gagne du matériel.',
    wrong: 'Ce n’est pas ça. Cherchez un échec qui attaque aussi une autre pièce.',
    solved: 'Exact : fourchette avec échec, le Cavalier est perdu.',
    caption: 'Puzzle réel de la base Lichess · classement 1500',
  },
  faqTitle: 'Questions fréquentes',
  faq: [
    {
      q: 'Qu’est-ce que la méthode Woodpecker ?',
      a: 'Une méthode d’entraînement tactique conçue par les grands maîtres Axel Smith et Hans Tikkanen : on résout le même ensemble de puzzles plusieurs fois, de plus en plus vite, jusqu’à ce que les motifs tactiques deviennent automatiques. Chess Hammer l’applique mais n’est pas affilié aux auteurs.',
    },
    {
      q: 'Chess Hammer est-il gratuit ?',
      a: 'Oui : inscription, entraînement, analyse avec Stockfish et statistiques sont gratuits et sans publicité. Le code est open source (GPLv3).',
    },
    {
      q: 'D’où viennent les puzzles ?',
      a: 'De la base publique de Lichess : plus de 200 000 positions issues de vraies parties, choisies selon votre niveau et les thèmes que vous préférez. Chess Hammer n’est pas affilié à Lichess.',
    },
    {
      q: 'Combien de temps faut-il par jour ?',
      a: 'C’est vous qui fixez le rythme. En général 10 puzzles par jour au premier cycle, 20 au deuxième et 40 au troisième, avec quelques jours de pause entre les cycles : environ deux mois pour un ensemble de 200.',
    },
    {
      q: 'Faut-il installer quelque chose ?',
      a: 'Non : Chess Hammer fonctionne dans le navigateur, sur ordinateur comme sur téléphone. Il suffit d’un compte avec e-mail ou Google.',
    },
  ],
  landing: {
    eyebrow: 'Entraînement tactique pour joueurs d’échecs',
    title: 'Reconnaissez la tactique avant même de la calculer',
    subtitle:
      'Essayez ce puzzle. Sur Chess Hammer, il ne disparaît pas une fois résolu : vous le retrouvez deux autres fois, à quelques jours d’intervalle, jusqu’à ce que la solution vous saute aux yeux. C’est la méthode Woodpecker, organisée pour vous.',
    ctaPrimary: 'Créer mon ensemble gratuit',
    ctaSecondary: 'Comment ça marche',
    note: 'Connexion par e-mail ou Google · puzzles de la base publique de Lichess',
    stats: [
      { value: '210 000', label: 'puzzles issus de vraies parties' },
      { value: '3 cycles', label: 'sur le même ensemble' },
      { value: '0 €', label: 'aucune publicité' },
      { value: 'Open source', label: 'code public GPLv3' },
    ],
    howTitle: 'Comment ça marche',
    steps: [
      {
        title: 'Vous créez votre ensemble',
        text: 'Choisissez combien de puzzles (souvent 200) et quels thèmes : Chess Hammer les tire de la base Lichess selon votre niveau.',
      },
      {
        title: 'Vous le répétez trois fois',
        text: 'Premier cycle au calme, puis de plus en plus vite : 10, 20 et 40 puzzles par jour, avec quelques jours de pause entre les cycles.',
      },
      {
        title: 'Vous mesurez vos progrès',
        text: 'Temps, erreurs et classement ELO cycle après cycle : voyez quels motifs tactiques sont devenus automatiques et lesquels pas encore.',
      },
    ],
    featuresTitle: 'Tout ce qu’il faut pour vous entraîner, rien de plus',
    features: [
      {
        title: 'Répétition par cycles',
        text: 'Le même ensemble, trois fois : la mémoire des motifs tactiques se construit en répétant, pas en résolvant toujours de nouveaux puzzles.',
      },
      {
        title: 'Analyse avec Stockfish',
        text: 'Après chaque puzzle, analysez la position avec le moteur, directement dans le navigateur.',
      },
      {
        title: 'Statistiques et classement',
        text: 'ELO, temps et taux de réussite par cycle et par thème, avec l’historique de chaque session.',
      },
      {
        title: 'Entraînement libre',
        text: 'Une fois le quota du jour atteint, revoyez les puzzles ratés sans toucher à la session officielle.',
      },
    ],
    guideTeaser: {
      title: 'Pourquoi répéter les mêmes puzzles fonctionne ?',
      text: 'Le guide de la méthode Woodpecker : d’où elle vient, comment sont organisés les trois cycles et ce qui change par rapport aux puzzles au hasard.',
      cta: 'Lire le guide',
    },
    finalTitle: 'Votre premier ensemble est prêt en une minute',
    finalCta: 'Commencer gratuitement',
  },
  guide: {
    kicker: 'Guide · Entraînement tactique · 6 minutes de lecture',
    title: 'La méthode Woodpecker, en ligne et gratuite',
    intro:
      'Le même ensemble de puzzles, trois fois, de plus en plus vite. C’est le moyen le plus efficace de transformer la tactique en réflexe, et Chess Hammer l’organise pour vous : quota quotidien, pauses entre les cycles, temps et progrès.',
    ctaPrimary: 'Essayer la méthode gratuitement',
    ctaSecondary: 'Lire le guide',
    tocTitle: 'Sur cette page',
    whyTitle: 'Pourquoi répéter les mêmes puzzles fonctionne',
    whyText:
      'En partie, la tactique ne se calcule pas à partir de zéro : elle se reconnaît. Un joueur fort voit le mat d’Anastasia parce qu’il l’a déjà vu des dizaines de fois. La méthode conçue par les grands maîtres Axel Smith et Hans Tikkanen entraîne exactement cela : au lieu de résoudre sans cesse de nouveaux puzzles, on répète le même ensemble jusqu’à ce que la solution arrive avant le calcul.',
    exampleLabel: 'Puzzle Lichess · classement 1899',
    exampleTitle: 'Mat en deux avec sacrifice',
    exampleText:
      'Au premier cycle, vous le calculez. Au troisième, vous le reconnaissez en deux secondes : Dame en h7, le Roi doit la prendre, Tour en h4 mat.',
    roundsTitle: 'Les trois cycles, étape par étape',
    rounds: [
      {
        title: 'Cycle 1 · environ 3 semaines',
        pace: '10 puzzles par jour',
        text: 'Résolvez les 200 puzzles de l’ensemble au calme, en calculant chaque variante. Les erreurs sont normales : c’est la matière de la révision.',
      },
      {
        title: 'Pause · quelques jours',
        pace: 'aucun puzzle',
        text: 'Le repos entre les cycles fait du cycle suivant un vrai rappel en mémoire, et non une répétition à court terme.',
      },
      {
        title: 'Cycle 2 · environ 10 jours',
        pace: '20 puzzles par jour',
        text: 'Même ensemble, deux fois plus vite. Beaucoup de solutions reviennent d’elles-mêmes : la reconnaissance commence à remplacer le calcul.',
      },
      {
        title: 'Cycle 3 · environ 5 jours',
        pace: '40 puzzles par jour',
        text: 'L’ensemble complet en quelques jours. C’est là qu’on voit le résultat : des temps bien plus courts et des motifs tactiques repérés sans y penser.',
      },
    ],
    compareTitle: 'Puzzles au hasard ou entraînement par cycles ?',
    compareHead: { random: 'Puzzles au hasard', ours: 'Chess Hammer' },
    compareRows: [
      {
        label: 'Chaque position, vous la voyez',
        random: 'une fois',
        ours: 'trois fois, de plus en plus espacées',
      },
      { label: 'Objectif', random: 'résoudre', ours: 'reconnaître sans calculer' },
      {
        label: 'Rythme',
        random: 'au hasard',
        ours: 'quota quotidien et pauses entre les cycles',
      },
      {
        label: 'Progrès',
        random: 'le classement monte et descend',
        ours: 'temps et erreurs comparés cycle par cycle',
      },
    ],
    finalTitle: 'Prêt pour votre premier cycle ?',
    finalText:
      'Créez votre ensemble de 200 puzzles en une minute. Gratuit, sans publicité, code open source.',
    finalCta: 'Commencer le premier cycle',
  },
}
