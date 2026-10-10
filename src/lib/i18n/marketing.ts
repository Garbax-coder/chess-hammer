import type { Language } from '@/lib/i18n/translations'

// Testi delle pagine pubbliche (home e guida): separati da translations.ts
// perche' servono anche alla pre-generazione dell'HTML e ai dati strutturati
// per i motori di ricerca, e non al resto dell'app.
export interface MarketingCopy {
  nav: {
    guide: string
    signIn: string
    startFree: string
    goToDashboard: string
    otherLanguage: string
    otherLanguageLabel: string
  }
  seo: Record<'home' | 'guide', { title: string; description: string }>
  puzzle: {
    prompt: string
    wrong: string
    solved: string
    caption: string
  }
  faqTitle: string
  faq: { q: string; a: string }[]
  landing: {
    eyebrow: string
    title: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
    note: string
    stats: { value: string; label: string }[]
    howTitle: string
    steps: { title: string; text: string }[]
    featuresTitle: string
    features: { title: string; text: string }[]
    guideTeaser: { title: string; text: string; cta: string }
    finalTitle: string
    finalCta: string
  }
  guide: {
    kicker: string
    title: string
    intro: string
    ctaPrimary: string
    ctaSecondary: string
    tocTitle: string
    whyTitle: string
    whyText: string
    exampleLabel: string
    exampleTitle: string
    exampleText: string
    roundsTitle: string
    rounds: { title: string; pace: string; text: string }[]
    compareTitle: string
    compareHead: { random: string; ours: string }
    compareRows: { label: string; random: string; ours: string }[]
    finalTitle: string
    finalText: string
    finalCta: string
  }
}

const it: MarketingCopy = {
  nav: {
    guide: 'Il metodo',
    signIn: 'Accedi',
    startFree: 'Inizia gratis',
    goToDashboard: 'Vai alla dashboard',
    otherLanguage: 'EN',
    otherLanguageLabel: 'Read in English',
  },
  seo: {
    home: {
      title: 'Chess Hammer — Trainer di tattica per scacchi, gratis',
      description:
        'Allena la tattica a scacchi con il metodo Woodpecker: gli stessi puzzle Lichess per tre giri, sempre più veloce. Gratis, senza pubblicità, analisi Stockfish.',
    },
    guide: {
      title: 'Metodo Woodpecker: guida e allenamento online gratis | Chess Hammer',
      description:
        'Cos’è il metodo Woodpecker, perché ripetere gli stessi puzzle funziona e come organizzare i tre giri. Con un trainer online gratuito che lo applica per te.',
    },
  },
  puzzle: {
    prompt: 'Tocca al Nero: trova la mossa che vince materiale.',
    wrong: 'Non è questa. Cerca uno scacco che attacchi anche un altro pezzo.',
    solved: 'Esatto: forchetta con scacco, il Cavallo è perso.',
    caption: 'Puzzle reale dal database Lichess · rating 1500',
  },
  faqTitle: 'Domande frequenti',
  faq: [
    {
      q: 'Cos’è il metodo Woodpecker?',
      a: 'Un metodo di allenamento tattico ideato dai maestri Axel Smith e Hans Tikkanen: si risolve lo stesso set di puzzle più volte, sempre più velocemente, finché i motivi tattici diventano automatici. Chess Hammer lo applica ma non è affiliato agli autori.',
    },
    {
      q: 'Chess Hammer è gratuito?',
      a: 'Sì: registrazione, allenamento, analisi con Stockfish e statistiche sono gratuiti e senza pubblicità. Il codice è open source (GPLv3).',
    },
    {
      q: 'Da dove vengono i puzzle?',
      a: 'Dal database pubblico di Lichess: oltre 200.000 posizioni da partite reali, scelte in base al tuo livello e ai temi che preferisci. Chess Hammer non è affiliato a Lichess.',
    },
    {
      q: 'Quanto tempo serve al giorno?',
      a: 'Decidi tu il ritmo. Di solito 10 puzzle al giorno nel primo giro, 20 nel secondo e 40 nel terzo, con qualche giorno di pausa tra un giro e l’altro: circa due mesi per un set da 200.',
    },
    {
      q: 'Serve installare qualcosa?',
      a: 'No: Chess Hammer funziona nel browser, da computer e da telefono. Basta un account con email o Google.',
    },
  ],
  landing: {
    eyebrow: 'Allenamento tattico per scacchisti',
    title: 'Riconosci la tattica prima ancora di calcolarla',
    subtitle:
      'Prova questo puzzle. Su Chess Hammer non sparisce dopo averlo risolto: lo ritrovi altre due volte, a distanza di giorni, finché la soluzione non ti salta all’occhio. È il metodo Woodpecker, organizzato per te.',
    ctaPrimary: 'Crea il tuo set gratis',
    ctaSecondary: 'Come funziona',
    note: 'Accesso con email o Google · puzzle dal database pubblico di Lichess',
    stats: [
      { value: '210.000', label: 'puzzle da partite reali' },
      { value: '3 giri', label: 'sullo stesso set' },
      { value: '0 €', label: 'nessuna pubblicità' },
      { value: 'Open source', label: 'codice pubblico GPLv3' },
    ],
    howTitle: 'Come funziona',
    steps: [
      {
        title: 'Crei il tuo set',
        text: 'Scegli quanti puzzle (di solito 200) e i temi: Chess Hammer li pesca dal database Lichess in base al tuo livello.',
      },
      {
        title: 'Lo ripeti tre volte',
        text: 'Primo giro con calma, poi sempre più veloce: 10, 20 e 40 puzzle al giorno, con qualche giorno di pausa tra un giro e l’altro.',
      },
      {
        title: 'Misuri i progressi',
        text: 'Tempi, errori e rating ELO giro dopo giro: vedi quali motivi tattici sono diventati automatici e quali ancora no.',
      },
    ],
    featuresTitle: 'Tutto quello che serve per allenarti, niente di più',
    features: [
      {
        title: 'Ripetizione a giri',
        text: 'Lo stesso set, tre volte: la memoria dei motivi tattici si costruisce ripetendo, non risolvendo puzzle sempre nuovi.',
      },
      {
        title: 'Analisi con Stockfish',
        text: 'Dopo ogni puzzle puoi analizzare la posizione con il motore, direttamente nel browser.',
      },
      {
        title: 'Statistiche e rating',
        text: 'ELO, tempi e percentuale di successo per giro e per tema, con lo storico di ogni sessione.',
      },
      {
        title: 'Pratica libera',
        text: 'Finita la quota del giorno, ripassi i puzzle sbagliati senza toccare la sessione ufficiale.',
      },
    ],
    guideTeaser: {
      title: 'Perché ripetere gli stessi puzzle funziona?',
      text: 'La guida al metodo Woodpecker: da dove nasce, come sono organizzati i tre giri e cosa cambia rispetto ai puzzle casuali.',
      cta: 'Leggi la guida',
    },
    finalTitle: 'Il tuo primo set è pronto in un minuto',
    finalCta: 'Inizia gratis',
  },
  guide: {
    kicker: 'Guida · Allenamento tattico · 6 minuti di lettura',
    title: 'Il metodo Woodpecker, online e gratis',
    intro:
      'Lo stesso set di puzzle, tre volte, sempre più veloce. È il modo più efficace per trasformare la tattica in riflesso, e Chess Hammer lo organizza al posto tuo: quota giornaliera, pause tra i giri, tempi e progressi.',
    ctaPrimary: 'Prova il metodo gratis',
    ctaSecondary: 'Leggi la guida',
    tocTitle: 'In questa pagina',
    whyTitle: 'Perché ripetere gli stessi puzzle funziona',
    whyText:
      'In partita la tattica non si calcola da zero: si riconosce. Un giocatore forte vede il matto di Anastasia perché l’ha già visto decine di volte. Il metodo ideato dai maestri Axel Smith e Hans Tikkanen allena proprio questo: invece di risolvere sempre puzzle nuovi, si ripete lo stesso set finché la soluzione arriva prima del calcolo.',
    exampleLabel: 'Puzzle Lichess · rating 1899',
    exampleTitle: 'Matto in due con sacrificio',
    exampleText:
      'Al primo giro lo calcoli. Al terzo lo riconosci in due secondi: Donna in h7, il Re è costretto a prenderla, Torre in h4 matto.',
    roundsTitle: 'I tre giri, passo per passo',
    rounds: [
      {
        title: 'Giro 1 · circa 3 settimane',
        pace: '10 puzzle al giorno',
        text: 'Risolvi i 200 puzzle del set con calma, calcolando ogni variante. Gli errori sono attesi: sono il materiale del ripasso.',
      },
      {
        title: 'Pausa · qualche giorno',
        pace: 'nessun puzzle',
        text: 'Il riposo tra i giri fa sì che il giro successivo sia un vero richiamo dalla memoria, non una ripetizione a breve termine.',
      },
      {
        title: 'Giro 2 · circa 10 giorni',
        pace: '20 puzzle al giorno',
        text: 'Stesso set, il doppio del ritmo. Molte soluzioni tornano in mente da sole: il riconoscimento comincia a prendere il posto del calcolo.',
      },
      {
        title: 'Giro 3 · circa 5 giorni',
        pace: '40 puzzle al giorno',
        text: 'Il set intero in pochi giorni. Qui si vede il risultato: tempi molto più brevi e motivi tattici che scatti senza pensarci.',
      },
    ],
    compareTitle: 'Puzzle casuali o allenamento a giri?',
    compareHead: { random: 'Puzzle casuali', ours: 'Chess Hammer' },
    compareRows: [
      {
        label: 'Ogni posizione la vedi',
        random: 'una volta',
        ours: 'tre volte, a distanza crescente',
      },
      { label: 'Obiettivo', random: 'risolvere', ours: 'riconoscere senza calcolare' },
      { label: 'Ritmo', random: 'a caso', ours: 'quota giornaliera e pause tra i giri' },
      {
        label: 'Progressi',
        random: 'il rating sale e scende',
        ours: 'tempi ed errori a confronto giro per giro',
      },
    ],
    finalTitle: 'Pronto per il primo giro?',
    finalText:
      'Crea il tuo set di 200 puzzle in un minuto. Gratis, senza pubblicità, codice open source.',
    finalCta: 'Inizia il primo giro',
  },
}

const en: MarketingCopy = {
  nav: {
    guide: 'The method',
    signIn: 'Sign in',
    startFree: 'Start free',
    goToDashboard: 'Go to dashboard',
    otherLanguage: 'IT',
    otherLanguageLabel: 'Leggi in italiano',
  },
  seo: {
    home: {
      title: 'Chess Hammer — Free chess tactics trainer',
      description:
        'Train chess tactics with the Woodpecker Method: the same Lichess puzzles over three rounds, faster each time. Free, ad-free, with Stockfish analysis.',
    },
    guide: {
      title: 'The Woodpecker Method: guide and free online training | Chess Hammer',
      description:
        'What the Woodpecker Method is, why repeating the same puzzles works and how to plan the three rounds. With a free online trainer that applies it for you.',
    },
  },
  puzzle: {
    prompt: 'Black to move: find the move that wins material.',
    wrong: 'Not this one. Look for a check that also attacks another piece.',
    solved: 'Correct: a fork with check, the Knight is lost.',
    caption: 'Real puzzle from the Lichess database · rating 1500',
  },
  faqTitle: 'Frequently asked questions',
  faq: [
    {
      q: 'What is the Woodpecker Method?',
      a: 'A tactical training method devised by grandmasters Axel Smith and Hans Tikkanen: you solve the same set of puzzles several times, faster each time, until tactical patterns become automatic. Chess Hammer applies it but is not affiliated with the authors.',
    },
    {
      q: 'Is Chess Hammer free?',
      a: 'Yes: sign-up, training, Stockfish analysis and stats are free and ad-free. The code is open source (GPLv3).',
    },
    {
      q: 'Where do the puzzles come from?',
      a: 'From the public Lichess database: over 200,000 positions from real games, picked for your level and the themes you prefer. Chess Hammer is not affiliated with Lichess.',
    },
    {
      q: 'How much time does it take each day?',
      a: 'You set the pace. Usually 10 puzzles a day in the first round, 20 in the second and 40 in the third, with a few rest days in between: about two months for a 200-puzzle set.',
    },
    {
      q: 'Do I need to install anything?',
      a: 'No: Chess Hammer runs in the browser, on desktop and mobile. All you need is an account with email or Google.',
    },
  ],
  landing: {
    eyebrow: 'Tactics training for chess players',
    title: 'Spot the tactic before you even calculate it',
    subtitle:
      'Try this puzzle. On Chess Hammer it doesn’t disappear once solved: you meet it twice more, days apart, until the solution jumps out at you. That’s the Woodpecker Method, organized for you.',
    ctaPrimary: 'Create your free set',
    ctaSecondary: 'How it works',
    note: 'Sign in with email or Google · puzzles from the public Lichess database',
    stats: [
      { value: '210,000', label: 'puzzles from real games' },
      { value: '3 rounds', label: 'on the same set' },
      { value: '€0', label: 'no ads' },
      { value: 'Open source', label: 'public GPLv3 code' },
    ],
    howTitle: 'How it works',
    steps: [
      {
        title: 'Create your set',
        text: 'Choose how many puzzles (usually 200) and which themes: Chess Hammer picks them from the Lichess database for your level.',
      },
      {
        title: 'Repeat it three times',
        text: 'First round at your own pace, then faster and faster: 10, 20 and 40 puzzles a day, with a few rest days between rounds.',
      },
      {
        title: 'Track your progress',
        text: 'Times, mistakes and ELO rating round after round: see which tactical patterns have become automatic and which haven’t yet.',
      },
    ],
    featuresTitle: 'Everything you need to train, nothing more',
    features: [
      {
        title: 'Rounds of repetition',
        text: 'The same set, three times: memory of tactical patterns is built by repeating, not by always solving new puzzles.',
      },
      {
        title: 'Stockfish analysis',
        text: 'After each puzzle you can analyze the position with the engine, right in your browser.',
      },
      {
        title: 'Stats and rating',
        text: 'ELO, times and success rate per round and per theme, with the history of every session.',
      },
      {
        title: 'Free practice',
        text: 'Once the daily quota is done, review the puzzles you missed without touching the official session.',
      },
    ],
    guideTeaser: {
      title: 'Why does repeating the same puzzles work?',
      text: 'The guide to the Woodpecker Method: where it comes from, how the three rounds are organized and how it differs from random puzzles.',
      cta: 'Read the guide',
    },
    finalTitle: 'Your first set is ready in a minute',
    finalCta: 'Start free',
  },
  guide: {
    kicker: 'Guide · Tactics training · 6-minute read',
    title: 'The Woodpecker Method, online and free',
    intro:
      'The same set of puzzles, three times, faster each time. It’s the most effective way to turn tactics into reflexes, and Chess Hammer organizes it for you: daily quota, rests between rounds, times and progress.',
    ctaPrimary: 'Try the method for free',
    ctaSecondary: 'Read the guide',
    tocTitle: 'On this page',
    whyTitle: 'Why repeating the same puzzles works',
    whyText:
      'In a game, tactics aren’t calculated from scratch: they’re recognized. A strong player sees Anastasia’s mate because they’ve seen it dozens of times. The method devised by grandmasters Axel Smith and Hans Tikkanen trains exactly this: instead of always solving new puzzles, you repeat the same set until the solution comes before the calculation.',
    exampleLabel: 'Lichess puzzle · rating 1899',
    exampleTitle: 'Mate in two with a sacrifice',
    exampleText:
      'In the first round you calculate it. By the third you recognize it in two seconds: Queen to h7, the King must take it, Rook to h4 mate.',
    roundsTitle: 'The three rounds, step by step',
    rounds: [
      {
        title: 'Round 1 · about 3 weeks',
        pace: '10 puzzles a day',
        text: 'Solve the 200 puzzles of the set calmly, calculating every line. Mistakes are expected: they’re what you’ll review.',
      },
      {
        title: 'Rest · a few days',
        pace: 'no puzzles',
        text: 'Resting between rounds makes the next one real recall from memory, not short-term repetition.',
      },
      {
        title: 'Round 2 · about 10 days',
        pace: '20 puzzles a day',
        text: 'Same set, twice the pace. Many solutions come back by themselves: recognition starts taking the place of calculation.',
      },
      {
        title: 'Round 3 · about 5 days',
        pace: '40 puzzles a day',
        text: 'The whole set in a few days. This is where you see the result: much shorter times and tactical patterns you spot without thinking.',
      },
    ],
    compareTitle: 'Random puzzles or training in rounds?',
    compareHead: { random: 'Random puzzles', ours: 'Chess Hammer' },
    compareRows: [
      {
        label: 'You see each position',
        random: 'once',
        ours: 'three times, further apart',
      },
      { label: 'Goal', random: 'solving', ours: 'recognizing without calculating' },
      { label: 'Pace', random: 'random', ours: 'daily quota and rests between rounds' },
      {
        label: 'Progress',
        random: 'rating goes up and down',
        ours: 'times and mistakes compared round by round',
      },
    ],
    finalTitle: 'Ready for your first round?',
    finalText: 'Create your 200-puzzle set in a minute. Free, ad-free, open source code.',
    finalCta: 'Start the first round',
  },
}

export const marketingCopy: Record<Language, MarketingCopy> = { it, en }
