import type { MarketingCopy } from './marketing'

export const de: MarketingCopy = {
  nav: {
    guide: 'Die Methode',
    signIn: 'Anmelden',
    startFree: 'Kostenlos starten',
    goToDashboard: 'Zum Dashboard',
    languageMenu: 'Sprache',
  },
  seo: {
    home: {
      title: 'Chess Hammer — Kostenloser Trainer für Schachtaktik',
      description:
        'Trainiere Schachtaktik mit der Woodpecker-Methode: dieselben Lichess-Puzzles in drei Durchgängen, jedes Mal schneller. Kostenlos, werbefrei, mit Stockfish.',
    },
    guide: {
      title: 'Woodpecker-Methode: Anleitung und Gratis-Training | Chess Hammer',
      description:
        'Was die Woodpecker-Methode ist, warum das Wiederholen derselben Puzzles wirkt und wie du die drei Durchgänge planst. Mit einem kostenlosen Online-Trainer.',
    },
  },
  puzzle: {
    prompt: 'Schwarz am Zug: Finde den Zug, der Material gewinnt.',
    wrong: 'Nicht dieser. Such ein Schach, das gleichzeitig eine andere Figur angreift.',
    solved: 'Richtig: Gabel mit Schach, der Springer geht verloren.',
    caption: 'Echtes Puzzle aus der Lichess-Datenbank · Wertung 1500',
  },
  faqTitle: 'Häufige Fragen',
  faq: [
    {
      q: 'Was ist die Woodpecker-Methode?',
      a: 'Eine Trainingsmethode für Taktik, entwickelt von den Großmeistern Axel Smith und Hans Tikkanen: Du löst dasselbe Puzzle-Set mehrmals, jedes Mal schneller, bis die taktischen Motive automatisch sitzen. Chess Hammer setzt sie um, ist aber nicht mit den Autoren verbunden.',
    },
    {
      q: 'Ist Chess Hammer kostenlos?',
      a: 'Ja: Registrierung, Training, Analyse mit Stockfish und Statistiken sind kostenlos und werbefrei. Der Code ist Open Source (GPLv3).',
    },
    {
      q: 'Woher kommen die Puzzles?',
      a: 'Aus der öffentlichen Lichess-Datenbank: über 200.000 Stellungen aus echten Partien, ausgewählt nach deinem Niveau und deinen Lieblingsthemen. Chess Hammer ist nicht mit Lichess verbunden.',
    },
    {
      q: 'Wie viel Zeit brauche ich pro Tag?',
      a: 'Das Tempo bestimmst du. Meist 10 Puzzles pro Tag im ersten Durchgang, 20 im zweiten und 40 im dritten, mit ein paar Pausentagen dazwischen: etwa zwei Monate für ein Set mit 200 Puzzles.',
    },
    {
      q: 'Muss ich etwas installieren?',
      a: 'Nein: Chess Hammer läuft im Browser, am Computer und auf dem Handy. Du brauchst nur ein Konto mit E-Mail oder Google.',
    },
  ],
  landing: {
    eyebrow: 'Taktiktraining für Schachspieler',
    title: 'Erkenne die Taktik, bevor du sie berechnest',
    subtitle:
      'Probier dieses Puzzle. Bei Chess Hammer verschwindet es nicht, sobald du es gelöst hast: Es begegnet dir noch zweimal, mit ein paar Tagen Abstand, bis dir die Lösung sofort ins Auge springt. Das ist die Woodpecker-Methode, für dich organisiert.',
    ctaPrimary: 'Kostenloses Set erstellen',
    ctaSecondary: 'So funktioniert’s',
    note: 'Anmeldung mit E-Mail oder Google · Puzzles aus der öffentlichen Lichess-Datenbank',
    stats: [
      { value: '210.000', label: 'Puzzles aus echten Partien' },
      { value: '3 Durchgänge', label: 'mit demselben Set' },
      { value: '0 €', label: 'keine Werbung' },
      { value: 'Open Source', label: 'öffentlicher GPLv3-Code' },
    ],
    howTitle: 'So funktioniert’s',
    steps: [
      {
        title: 'Du erstellst dein Set',
        text: 'Wähle, wie viele Puzzles (meist 200) und welche Themen: Chess Hammer holt sie passend zu deinem Niveau aus der Lichess-Datenbank.',
      },
      {
        title: 'Du wiederholst es dreimal',
        text: 'Erster Durchgang in Ruhe, dann immer schneller: 10, 20 und 40 Puzzles pro Tag, mit ein paar Pausentagen zwischen den Durchgängen.',
      },
      {
        title: 'Du misst deine Fortschritte',
        text: 'Zeiten, Fehler und ELO-Wertung Durchgang für Durchgang: Sieh, welche taktischen Motive schon automatisch sitzen und welche noch nicht.',
      },
    ],
    featuresTitle: 'Alles, was du zum Trainieren brauchst, und nicht mehr',
    features: [
      {
        title: 'Wiederholung in Durchgängen',
        text: 'Dasselbe Set, dreimal: Das Gedächtnis für taktische Motive entsteht durch Wiederholen, nicht durch immer neue Puzzles.',
      },
      {
        title: 'Analyse mit Stockfish',
        text: 'Nach jedem Puzzle kannst du die Stellung mit der Engine analysieren, direkt im Browser.',
      },
      {
        title: 'Statistiken und Wertung',
        text: 'ELO, Zeiten und Erfolgsquote pro Durchgang und pro Thema, mit dem Verlauf jeder Session.',
      },
      {
        title: 'Freies Üben',
        text: 'Ist das Tagesziel erreicht, wiederholst du verfehlte Puzzles, ohne die offizielle Session zu verändern.',
      },
    ],
    guideTeaser: {
      title: 'Warum wirkt es, dieselben Puzzles zu wiederholen?',
      text: 'Die Anleitung zur Woodpecker-Methode: woher sie kommt, wie die drei Durchgänge aufgebaut sind und was sie von zufälligen Puzzles unterscheidet.',
      cta: 'Anleitung lesen',
    },
    finalTitle: 'Dein erstes Set ist in einer Minute fertig',
    finalCta: 'Kostenlos starten',
  },
  guide: {
    kicker: 'Anleitung · Taktiktraining · 6 Minuten Lesezeit',
    title: 'Die Woodpecker-Methode, online und kostenlos',
    intro:
      'Dasselbe Puzzle-Set, dreimal, jedes Mal schneller. So wird Taktik am wirksamsten zum Reflex, und Chess Hammer organisiert das für dich: Tagesziel, Pausen zwischen den Durchgängen, Zeiten und Fortschritt.',
    ctaPrimary: 'Methode kostenlos testen',
    ctaSecondary: 'Anleitung lesen',
    tocTitle: 'Auf dieser Seite',
    whyTitle: 'Warum es wirkt, dieselben Puzzles zu wiederholen',
    whyText:
      'In der Partie wird Taktik nicht bei null berechnet, sondern erkannt. Ein starker Spieler sieht Anastasias Matt, weil er es schon dutzendfach gesehen hat. Die Methode der Großmeister Axel Smith und Hans Tikkanen trainiert genau das: Statt immer neue Puzzles zu lösen, wiederholst du dasselbe Set, bis die Lösung vor der Berechnung da ist.',
    exampleLabel: 'Lichess-Puzzle · Wertung 1899',
    exampleTitle: 'Matt in zwei mit Opfer',
    exampleText:
      'Im ersten Durchgang rechnest du es aus. Im dritten erkennst du es in zwei Sekunden: Dame nach h7, der König muss sie schlagen, Turm nach h4 matt.',
    roundsTitle: 'Die drei Durchgänge, Schritt für Schritt',
    rounds: [
      {
        title: 'Durchgang 1 · etwa 3 Wochen',
        pace: '10 Puzzles pro Tag',
        text: 'Löse die 200 Puzzles des Sets in Ruhe und rechne jede Variante durch. Fehler sind normal: Sie sind der Stoff für die Wiederholung.',
      },
      {
        title: 'Pause · ein paar Tage',
        pace: 'keine Puzzles',
        text: 'Die Pause zwischen den Durchgängen sorgt dafür, dass der nächste ein echtes Abrufen aus dem Gedächtnis ist und keine kurzfristige Wiederholung.',
      },
      {
        title: 'Durchgang 2 · etwa 10 Tage',
        pace: '20 Puzzles pro Tag',
        text: 'Dasselbe Set, doppeltes Tempo. Viele Lösungen fallen dir von selbst wieder ein: Das Erkennen beginnt, das Rechnen zu ersetzen.',
      },
      {
        title: 'Durchgang 3 · etwa 5 Tage',
        pace: '40 Puzzles pro Tag',
        text: 'Das ganze Set in wenigen Tagen. Hier zeigt sich das Ergebnis: viel kürzere Zeiten und taktische Motive, die du ohne Nachdenken siehst.',
      },
    ],
    compareTitle: 'Zufällige Puzzles oder Training in Durchgängen?',
    compareHead: { random: 'Zufällige Puzzles', ours: 'Chess Hammer' },
    compareRows: [
      {
        label: 'Jede Stellung siehst du',
        random: 'einmal',
        ours: 'dreimal, mit wachsendem Abstand',
      },
      { label: 'Ziel', random: 'lösen', ours: 'erkennen ohne zu rechnen' },
      {
        label: 'Tempo',
        random: 'zufällig',
        ours: 'Tagesziel und Pausen zwischen den Durchgängen',
      },
      {
        label: 'Fortschritt',
        random: 'die Wertung steigt und fällt',
        ours: 'Zeiten und Fehler im Vergleich der Durchgänge',
      },
    ],
    finalTitle: 'Bereit für deinen ersten Durchgang?',
    finalText:
      'Erstelle dein Set mit 200 Puzzles in einer Minute. Kostenlos, werbefrei, Open-Source-Code.',
    finalCta: 'Ersten Durchgang starten',
  },
}
