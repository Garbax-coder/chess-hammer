import type { BoardThemeId } from '@/lib/board-themes'
import type { PuzzleThemeCategoryId } from '@/lib/puzzle-themes'

export type Language = 'it' | 'en'

export interface Translations {
  meta: { locale: string }
  common: {
    loading: string
    email: string
    password: string
    or: string
    rename: string
    sessionNameLabel: string
  }
  language: {
    label: string
    it: string
    en: string
  }
  home: {
    subtitle: string
    goToDashboard: string
    startTraining: string
  }
  nav: {
    dashboard: string
    history: string
    faq: string
    toggleTheme: string
    signOut: string
  }
  login: {
    title: string
    subtitle: string
    submit: string
    noAccount: string
    signup: string
  }
  signup: {
    title: string
    subtitle: string
    checkEmail: string
    submit: string
    haveAccount: string
    login: string
  }
  socialLogin: {
    continueWith: (provider: string) => string
  }
  dashboard: {
    loggedInAs: (email: string) => string
    stats: (elo: number, solved: number, failed: number) => string
    currentSessionTitle: string
    currentSessionDescription: (round: number, total: number) => string
    roundProgress: (round: number, attempted: number, target: number) => string
    todayProgress: (attempted: number, target: number) => string
    roundSummary: (round: number, perDay: number, days: number) => string
    restingNote: (date: string) => string
    continueTraining: string
    noActiveSessionTitle: string
    noActiveSessionDescription: string
    createSession: string
    eloHistory: {
      title: string
      empty: string
      range: { week: string; month: string; year: string; all: string }
    }
    puzzlePerformance: {
      title: string
      empty: string
      roundLabel: (round: number) => string
      legendSolved: string
      legendFailed: string
      legendPending: string
      openSession: string
      expandSession: string
      collapseSession: string
    }
  }
  newSession: {
    title: string
    subtitle: string
    sessionName: string
    sessionNamePlaceholder: string
    totalPuzzles: string
    roundLabel: (round: number) => string
    daysEstimate: (days: number | string) => string
    restDays: string
    restDaysHint: string
    errorGeneric: string
    errorInvalidValues: string
    start: string
    calendarTitle: string
    calendarEndDate: (date: string) => string
    calendarTruncated: string
    calendarRestLabel: string
    calendarInvalid: string
    themesTitle: string
    themesSubtitle: string
    themesSelectedCount: (selected: number, total: number) => string
    themesSelectAll: string
    themesDeselectAll: string
    errorNoThemes: string
  }
  puzzleThemes: {
    categories: Record<PuzzleThemeCategoryId, string>
    labels: Record<string, string>
  }
  sessionsHistory: {
    title: string
    empty: string
    puzzlesRound: (total: number, round: number) => string
    createdOn: (date: string) => string
  }
  sessionDetail: {
    title: (date: string) => string
    subtitle: (total: number, round: number, status: string) => string
    selectPrompt: string
  }
  sessionStatus: {
    in_progress: string
    completed: string
    abandoned: string
  }
  train: {
    noActiveSession: string
    createSession: string
    practiceTitle: string
    practiceSubtitle: string
    title: string
    roundInfo: (round: number, total: number) => string
    todayPuzzle: (current: number, target: number) => string
    autoAdvance: string
    soundEnabled: string
    onlyFailedPuzzles: string
    failedScopeAll: string
    failedScopeLastRound: string
    backToList: string
    quotaTitle: string
    quotaDescription: (round: number) => string
    restingTitle: string
    restingDescription: (date: string, round: number) => string
    checkAgain: string
    sessionCompleteTitle: string
    sessionCompleteDescription: string
    backToDashboard: string
  }
  puzzleBoard: {
    rating: (rating: number) => string
    analysisMode: string
    reviewingMove: (ply: number) => string
    opponentMoving: string
    solved: string
    wrongMove: string
    moveWith: (color: string) => string
    white: string
    black: string
    prevMove: string
    nextMove: string
    nextPuzzle: string
    choosePromotion: string
    promotionPieces: { q: string; r: string; b: string; n: string }
  }
  analysisPanel: {
    title: string
    settingsAria: string
    settingsTitle: string
    analyzing: string
    noAnalysis: string
    depth: (current: string | number, target: number) => string
    numberOfLines: string
    engineDepth: string
    bestMoveArrow: string
  }
  moveHistory: {
    title: string
    empty: string
    goToStart: string
    prevMove: string
    nextMove: string
    goToEnd: string
  }
  sessionPuzzleList: {
    title: string
    quotaHint: string
    empty: string
    roundResult: (round: number, solved: boolean, timeSeconds: number) => string
    roundTodo: (round: number) => string
    practiceTooltip: (
      date: string,
      solved: boolean,
      timeSeconds: number,
      isBest: boolean,
    ) => string
    themesToggle: string
    themesEmpty: string
    infoDisabledHint: string
    copyFen: string
    copyPgn: string
    fenCopied: string
  }
  devTools: {
    title: string
    resetting: string
    resetQuota: string
    resetSession: string
    deleteActiveSession: string
    skipRest: string
    addKnightPromotionPuzzle: string
  }
  profile: {
    openLabel: string
    title: string
    elo: (elo: number) => string
  }
  appearance: {
    boardTheme: string
    pieceSet: string
    themes: Record<BoardThemeId, string>
  }
  faq: {
    title: string
    intro: string
    items: { question: string; answer: string }[]
  }
  errors: {
    noPuzzleAvailable: string
  }
}

export const it: Translations = {
  meta: { locale: 'it-IT' },
  common: {
    loading: 'Caricamento…',
    email: 'Email',
    password: 'Password',
    or: 'oppure',
    rename: 'Rinomina sessione',
    sessionNameLabel: 'Nome sessione',
  },
  language: {
    label: 'Lingua',
    it: 'Italiano',
    en: 'English',
  },
  home: {
    subtitle:
      'Allena la tattica con il Metodo Woodpecker: risolvi lo stesso set di puzzle per 3 giri, sempre più veloce, e traccia il tuo rating ELO nel tempo.',
    goToDashboard: 'Vai alla dashboard',
    startTraining: 'Inizia allenamento',
  },
  nav: {
    dashboard: 'Dashboard',
    history: 'Storico',
    faq: 'FAQ',
    toggleTheme: 'Cambia tema',
    signOut: 'Esci',
  },
  login: {
    title: 'Accedi',
    subtitle: 'Continua il tuo allenamento Woodpecker',
    submit: 'Accedi',
    noAccount: 'Non hai un account?',
    signup: 'Registrati',
  },
  signup: {
    title: 'Crea account',
    subtitle: 'Inizia a tracciare i tuoi allenamenti Woodpecker',
    checkEmail: "Controlla la tua email per confermare l'account prima di accedere.",
    submit: 'Registrati',
    haveAccount: 'Hai già un account?',
    login: 'Accedi',
  },
  socialLogin: {
    continueWith: (provider) => `Continua con ${provider}`,
  },
  dashboard: {
    loggedInAs: (email) => `Accesso effettuato come ${email}`,
    stats: (elo, solved, failed) => `ELO ${elo} · ${solved} risolti · ${failed} falliti`,
    currentSessionTitle: 'Sessione in corso',
    currentSessionDescription: (round, total) =>
      `Giro ${round} di 3 — ${total} puzzle totali`,
    roundProgress: (round, attempted, target) => `Giro ${round}: ${attempted}/${target}`,
    todayProgress: (attempted, target) => `Oggi: ${attempted}/${target}`,
    roundSummary: (round, perDay, days) =>
      `${round}° giro: ${perDay}/giorno (~${days} giorni)`,
    restingNote: (date) => `⏸ In pausa fino al ${date}`,
    continueTraining: 'Continua allenamento',
    noActiveSessionTitle: 'Nessuna sessione attiva',
    noActiveSessionDescription: 'Configura un nuovo allenamento Woodpecker per iniziare.',
    createSession: 'Crea nuova sessione',
    eloHistory: {
      title: 'Andamento ELO',
      empty: 'Nessun puzzle risolto in questo periodo.',
      range: { week: 'Settimana', month: 'Mese', year: 'Anno', all: 'Tutto' },
    },
    puzzlePerformance: {
      title: 'Prestazioni puzzle',
      empty: 'Nessun puzzle ancora nel pool di questa sessione.',
      roundLabel: (round) => `Giro ${round}`,
      legendSolved: 'Risolto',
      legendFailed: 'Fallito',
      legendPending: 'Da fare',
      openSession: 'Apri sessione',
      expandSession: 'Espandi dettagli sessione',
      collapseSession: 'Comprimi dettagli sessione',
    },
  },
  newSession: {
    title: 'Nuova sessione',
    subtitle:
      'Configura il tuo allenamento Woodpecker: stesso set di puzzle ripetuto per 3 giri, sempre più veloce.',
    sessionName: 'Nome sessione (opzionale)',
    sessionNamePlaceholder: 'es. Ripasso forchette',
    totalPuzzles: 'Totale puzzle nella sessione',
    roundLabel: (round) => `${round}° giro — puzzle/giorno`,
    daysEstimate: (days) => `~${days} giorni`,
    restDays: 'Giorni di pausa tra un giro e l’altro',
    restDaysHint:
      'Il metodo Woodpecker consiglia qualche giorno di riposo tra un giro e il successivo, così il richiamo dalla memoria è più efficace. 0 = nessuna pausa.',
    errorGeneric: 'Errore nella creazione della sessione',
    errorInvalidValues:
      'Puzzle e puzzle/giorno devono essere numeri interi ≥ 1; i giorni di pausa devono essere ≥ 0.',
    start: 'Avvia sessione',
    calendarTitle: 'Anteprima calendario',
    calendarEndDate: (date) => `Fine prevista: ${date}`,
    calendarTruncated: 'Durata troppo lunga per essere mostrata per intero.',
    calendarRestLabel: 'Pausa',
    calendarInvalid:
      "Inserisci un totale puzzle e almeno 1 puzzle/giorno per ogni giro per vedere l'anteprima.",
    themesTitle: 'Temi puzzle',
    themesSubtitle:
      'Il giro 1 pescherà nuovi puzzle solo tra i temi selezionati. I giri 2 e 3 ripetono comunque lo stesso pool, senza una nuova selezione.',
    themesSelectedCount: (selected, total) => `${selected}/${total} selezionati`,
    themesSelectAll: 'Seleziona tutti',
    themesDeselectAll: 'Deseleziona tutti',
    errorNoThemes: 'Seleziona almeno un tema puzzle.',
  },
  puzzleThemes: {
    categories: {
      phase: 'Fase di gioco',
      goal: 'Obiettivo',
      length: 'Lunghezza',
      level: 'Livello',
      tactics: 'Motivi tattici',
      mates: 'Tipi di scacco matto',
      endgameType: 'Tipo di finale',
      specialMoves: 'Mosse speciali',
    },
    labels: {
      opening: 'Apertura',
      middlegame: 'Mediogioco',
      endgame: 'Finale',
      crushing: 'Vantaggio schiacciante',
      advantage: 'Vantaggio',
      equality: 'Parità',
      oneMove: 'Una mossa',
      short: 'Breve',
      long: 'Lungo',
      veryLong: 'Molto lungo',
      master: 'Partita di maestri',
      masterVsMaster: 'Maestro contro maestro',
      superGM: 'Super Gran Maestro',
      fork: 'Forchetta',
      pin: 'Inchiodatura',
      skewer: 'Infilata',
      discoveredAttack: 'Attacco di scoperta',
      discoveredCheck: 'Scacco di scoperta',
      doubleCheck: 'Doppio scacco',
      deflection: 'Deviazione',
      attraction: 'Attrazione',
      clearance: 'Sgombero',
      interference: 'Interferenza',
      intermezzo: 'Intermezzo',
      xRayAttack: 'Attacco a raggi X',
      zugzwang: 'Zugzwang',
      trappedPiece: 'Pezzo in trappola',
      capturingDefender: 'Cattura del difensore',
      hangingPiece: 'Pezzo in presa',
      quietMove: 'Mossa quieta',
      defensiveMove: 'Mossa difensiva',
      sacrifice: 'Sacrificio',
      advancedPawn: 'Pedone avanzato',
      exposedKing: 'Re scoperto',
      kingsideAttack: 'Attacco sul lato di re',
      queensideAttack: 'Attacco sul lato di donna',
      attackingF2F7: 'Attacco su f2/f7',
      collinearMove: 'Mossa sulla stessa linea',
      mate: 'Scacco matto',
      mateIn1: 'Matto in 1',
      mateIn2: 'Matto in 2',
      mateIn3: 'Matto in 3',
      mateIn4: 'Matto in 4',
      mateIn5: 'Matto in 5',
      backRankMate: 'Matto di corridoio',
      smotheredMate: 'Matto soffocato',
      anastasiaMate: 'Matto di Anastasia',
      arabianMate: 'Matto arabo',
      bodenMate: 'Matto di Boden',
      hookMate: 'Matto ad uncino (hook mate)',
      dovetailMate: 'Matto a coda di pesce (dovetail mate)',
      doubleBishopMate: 'Matto dei due alfieri',
      cornerMate: "Matto d'angolo",
      epauletteMate: 'Matto delle spalline (epaulette mate)',
      killBoxMate: 'Matto della gabbia (kill box mate)',
      morphysMate: 'Matto di Morphy',
      operaMate: "Matto dell'Opera",
      pillsburysMate: 'Matto di Pillsbury',
      swallowstailMate: 'Matto a coda di rondine',
      triangleMate: 'Matto a triangolo',
      vukovicMate: 'Matto di Vukovic',
      blindSwineMate: 'Matto dei maiali ciechi (blind swine mate)',
      balestraMate: 'Matto "balestra" (balestra mate)',
      pawnEndgame: 'Finale di pedoni',
      knightEndgame: 'Finale di cavalli',
      bishopEndgame: 'Finale di alfieri',
      rookEndgame: 'Finale di torri',
      queenEndgame: 'Finale di donne',
      queenRookEndgame: 'Finale di donna e torre',
      promotion: 'Promozione',
      enPassant: 'En passant',
      castling: 'Arrocco',
      underPromotion: 'Sottopromozione',
    },
  },
  sessionsHistory: {
    title: 'Storico sessioni',
    empty: 'Nessuna sessione ancora creata.',
    puzzlesRound: (total, round) => `${total} puzzle — giro ${round}/3`,
    createdOn: (date) => `Creata il ${date}`,
  },
  sessionDetail: {
    title: (date) => `Sessione del ${date}`,
    subtitle: (total, round, status) => `${total} puzzle · giro ${round}/3 · ${status}`,
    selectPrompt: 'Seleziona un puzzle dalla lista per rivederlo o risolverlo di nuovo.',
  },
  sessionStatus: {
    in_progress: 'In corso',
    completed: 'Completata',
    abandoned: 'Abbandonata',
  },
  train: {
    noActiveSession: 'Nessuna sessione attiva.',
    createSession: 'Crea una sessione',
    practiceTitle: 'Pratica libera',
    practiceSubtitle: 'Il risultato non viene tracciato nella sessione ufficiale.',
    title: 'Allenamento',
    roundInfo: (round, total) => `Giro ${round} di 3 — ${total} puzzle totali`,
    todayPuzzle: (current, target) => `Puzzle di oggi: ${current}/${target}`,
    autoAdvance: 'Avanzamento automatico',
    soundEnabled: 'Suoni',
    onlyFailedPuzzles: 'Solo puzzle falliti',
    failedScopeAll: 'Tutti i falliti',
    failedScopeLastRound: 'Falliti nell’ultimo giro',
    backToList: 'Torna alla lista',
    quotaTitle: 'Quota di oggi completata',
    quotaDescription: (round) =>
      `Hai raggiunto il target giornaliero per il giro ${round}. Torna domani per continuare, oppure seleziona un puzzle dalla lista a sinistra per allenarti liberamente.`,
    restingTitle: 'In pausa tra un giro e l’altro',
    restingDescription: (date, round) =>
      `Il giro ${round} inizia il ${date}: il metodo Woodpecker consiglia qualche giorno di riposo, così il prossimo giro è un vero richiamo dalla memoria invece di una ripetizione a breve termine. Nel frattempo puoi allenarti liberamente selezionando un puzzle dalla lista a sinistra.`,
    checkAgain: 'Controlla di nuovo',
    sessionCompleteTitle: 'Sessione completata 🎉',
    sessionCompleteDescription:
      'Hai finito tutti e 3 i giri di questa sessione. Puoi continuare a esercitarti liberamente selezionando un puzzle dalla lista a sinistra.',
    backToDashboard: 'Torna alla dashboard',
  },
  puzzleBoard: {
    rating: (rating) => `Rating ${rating}`,
    analysisMode: 'Modalità analisi — muovi liberamente',
    reviewingMove: (ply) => `Stai rivedendo la mossa ${ply}`,
    opponentMoving: "L'avversario muove…",
    solved: 'Risolto! 🎉',
    wrongMove: 'Mossa sbagliata',
    moveWith: (color) => `Muovi con il ${color}`,
    white: 'Bianco',
    black: 'Nero',
    prevMove: 'Mossa precedente',
    nextMove: 'Mossa successiva',
    nextPuzzle: 'Puzzle successivo →',
    choosePromotion: 'Scegli il pezzo per la promozione',
    promotionPieces: { q: 'Regina', r: 'Torre', b: 'Alfiere', n: 'Cavallo' },
  },
  analysisPanel: {
    title: 'Analisi motore',
    settingsAria: 'Impostazioni analisi',
    settingsTitle: 'Impostazioni analisi',
    analyzing: 'Analisi in corso…',
    noAnalysis: 'Nessuna analisi disponibile.',
    depth: (current, target) => `Profondità ${current}/${target}`,
    numberOfLines: 'Numero di linee',
    engineDepth: 'Profondità motore',
    bestMoveArrow: 'Freccia mossa migliore',
  },
  moveHistory: {
    title: 'Cronologia mosse',
    empty: 'Nessuna mossa.',
    goToStart: "Vai all'inizio",
    prevMove: 'Cronologia: mossa precedente',
    nextMove: 'Cronologia: mossa successiva',
    goToEnd: 'Vai alla fine',
  },
  sessionPuzzleList: {
    title: 'Puzzle della sessione',
    quotaHint: 'Quota di oggi completata: seleziona un puzzle per allenarti liberamente.',
    empty: 'Nessun puzzle ancora eseguito.',
    roundResult: (round, solved, timeSeconds) =>
      `Giro ${round}: ${solved ? 'risolto' : 'fallito'} in ${timeSeconds}s`,
    roundTodo: (round) => `Giro ${round}: da fare`,
    practiceTooltip: (date, solved, timeSeconds, isBest) =>
      `Pratica libera — ${date}: ${solved ? 'risolto' : 'fallito'} in ${timeSeconds}s${isBest ? ' (miglior tempo)' : ''}`,
    themesToggle: 'Info',
    themesEmpty: 'Nessun tema disponibile per questo puzzle.',
    infoDisabledHint: 'Disponibile dopo aver tentato il puzzle in questo giro.',
    copyFen: 'Copia FEN',
    copyPgn: 'Copia PGN',
    fenCopied: 'Copiato!',
  },
  devTools: {
    title: '🔧 Debug (solo sviluppo)',
    resetting: 'Reset…',
    resetQuota: 'Reset quota oggi',
    resetSession: 'Reset sessione (ELO incluso)',
    deleteActiveSession: 'Elimina sessione attiva',
    skipRest: 'Salta pausa',
    addKnightPromotionPuzzle: 'Aggiungi puzzle promozione a cavallo',
  },
  profile: {
    openLabel: 'Profilo',
    title: 'Profilo',
    elo: (elo) => `ELO ${elo}`,
  },
  appearance: {
    boardTheme: 'Stile scacchiera',
    pieceSet: 'Stile pezzi',
    themes: {
      classic: 'Classico',
      ocean: 'Oceano',
      forest: 'Foresta',
      slate: 'Ardesia',
      coral: 'Corallo',
    },
  },
  faq: {
    title: 'Domande frequenti',
    intro:
      'Come funziona il Metodo Woodpecker, come lo applica Chess Hammer, e come leggere i tuoi dati per migliorare.',
    items: [
      {
        question: "Cos'è il Metodo Woodpecker?",
        answer:
          "Il Metodo Woodpecker è una tecnica di allenamento tattico ideata dai maestri Axel Smith e Hans Tikkanen: si sceglie un set fisso di puzzle e lo si risolve più volte di seguito (di solito 3-7 giri), invece di risolvere sempre puzzle nuovi.\n\nOgni ripetizione dello stesso set dovrebbe essere più veloce della precedente: l'obiettivo non è imparare il puzzle a memoria, ma allenare il riconoscimento immediato dei pattern tattici (forchette, inchiodature, sacrifici tipici...), rendendoli automatici anche in partita, sotto il tempo dell'orologio.",
      },
      {
        question: 'Come viene applicato in Chess Hammer?',
        answer:
          "Ogni sessione ha un pool fisso di puzzle (impostabile alla creazione, es. 200) e si articola in 3 giri:\n\n1° giro — scoperta: i puzzle vengono scelti uno alla volta in base al tuo rating ELO attuale, e formano il pool fisso della sessione.\n2° e 3° giro — ripetizione: si ripercorre esattamente lo stesso pool, nello stesso ordine, cercando di risolverlo più in fretta.\n\nOgni giro ha una quota giornaliera configurabile (es. 10/20/40 puzzle al giorno per giro 1/2/3): l'app calcola automaticamente quanti giorni servono per completare ciascun giro.\n\nTra un giro e il successivo è anche possibile impostare qualche giorno di pausa (0 = nessuna, come consigliato dal metodo originale): finché la pausa non è scaduta la sessione ufficiale resta in attesa, ma puoi comunque allenarti liberamente in modalità pratica.",
      },
      {
        question: "Cosa rappresenta l'ELO?",
        answer:
          'È una stima del tuo livello tattico, calcolata con la stessa formula usata negli scacchi per il rating dei giocatori: dopo ogni tentativo, il tuo ELO si avvicina a quello del puzzle a seconda che tu lo abbia risolto o no, pesato per quanto era "atteso" il risultato — batterti contro un puzzle molto più difficile del tuo livello vale di più se lo risolvi.',
      },
      {
        question: "Quando cambia l'ELO, e perché solo allora?",
        answer:
          "L'ELO cambia SOLO durante il 1° giro di ogni sessione. Nei giri 2° e 3° resta congelato, anche se risolvi o sbagli i puzzle.\n\nIl motivo: al 1° giro i puzzle sono nuovi per te, quindi risolverli è un test reale della tua forza tattica — per questo vengono anche scelti in base al tuo ELO attuale. Al 2° e 3° giro stai ripetendo puzzle già visti e (si spera) già risolti: andare più veloce misura la memorizzazione e l'automatismo del pattern, non la tua forza scacchistica, quindi non è un segnale corretto per aggiornare l'ELO.\n\nL'ELO torna a poter cambiare al 1° giro della sessione successiva, quando affronti di nuovo puzzle mai visti.",
      },
      {
        question: 'Cosa posso impostare io?',
        answer:
          'Alla creazione di una sessione: il numero totale di puzzle, la quota giornaliera per ciascuno dei 3 giri, e i giorni di pausa tra un giro e il successivo.\n\nNel profilo: lingua, stile della scacchiera, set dei pezzi, avanzamento automatico al puzzle successivo, suoni.',
      },
      {
        question: 'Quali dati vengono misurati, e a cosa servono?',
        answer:
          "Per ogni tentativo: esito (risolto/fallito), tempo di risoluzione, giro ed ELO prima/dopo. Questi dati alimentano:\n\n— il grafico Andamento ELO, per vedere il progresso nel tempo;\n— la heatmap Prestazioni puzzle, che mostra a colpo d'occhio quali puzzle risolvi e quali sbagli, giro per giro;\n— il grafico dei tempi di risoluzione, per vedere se stai davvero velocizzando la ripetizione, l'obiettivo del metodo.\n\nUn quadratino rosso ricorrente sullo stesso puzzle tra i giri, o un tempo che non scende, sono segnali utili: quel pattern non si è ancora fissato e vale la pena rivederlo con calma in modalità pratica.",
      },
      {
        question: 'Cosa è la modalità pratica?',
        answer:
          "Puoi rivedere e risolvere di nuovo qualsiasi puzzle già incontrato, anche di sessioni passate, senza che il tentativo influisca sulla sessione ufficiale o sull'ELO: serve solo per allenarti liberamente. La trovi cliccando un puzzle nella lista di una sessione, o un quadratino della heatmap Prestazioni puzzle in dashboard.",
      },
    ],
  },
  errors: {
    noPuzzleAvailable: 'Nessun puzzle disponibile per questo rating: pool esaurito.',
  },
}

export const en: Translations = {
  meta: { locale: 'en-US' },
  common: {
    loading: 'Loading…',
    email: 'Email',
    password: 'Password',
    or: 'or',
    rename: 'Rename session',
    sessionNameLabel: 'Session name',
  },
  language: {
    label: 'Language',
    it: 'Italiano',
    en: 'English',
  },
  home: {
    subtitle:
      'Train your tactics with the Woodpecker Method: solve the same puzzle set over 3 rounds, faster each time, and track your ELO rating over time.',
    goToDashboard: 'Go to dashboard',
    startTraining: 'Start training',
  },
  nav: {
    dashboard: 'Dashboard',
    history: 'History',
    faq: 'FAQ',
    toggleTheme: 'Toggle theme',
    signOut: 'Sign out',
  },
  login: {
    title: 'Log in',
    subtitle: 'Continue your Woodpecker training',
    submit: 'Log in',
    noAccount: "Don't have an account?",
    signup: 'Sign up',
  },
  signup: {
    title: 'Create account',
    subtitle: 'Start tracking your Woodpecker training',
    checkEmail: 'Check your email to confirm your account before logging in.',
    submit: 'Sign up',
    haveAccount: 'Already have an account?',
    login: 'Log in',
  },
  socialLogin: {
    continueWith: (provider) => `Continue with ${provider}`,
  },
  dashboard: {
    loggedInAs: (email) => `Logged in as ${email}`,
    stats: (elo, solved, failed) => `ELO ${elo} · ${solved} solved · ${failed} failed`,
    currentSessionTitle: 'Session in progress',
    currentSessionDescription: (round, total) =>
      `Round ${round} of 3 — ${total} total puzzles`,
    roundProgress: (round, attempted, target) => `Round ${round}: ${attempted}/${target}`,
    todayProgress: (attempted, target) => `Today: ${attempted}/${target}`,
    roundSummary: (round, perDay, days) =>
      `Round ${round}: ${perDay}/day (~${days} days)`,
    restingNote: (date) => `⏸ Resting until ${date}`,
    continueTraining: 'Continue training',
    noActiveSessionTitle: 'No active session',
    noActiveSessionDescription: 'Set up a new Woodpecker training to get started.',
    createSession: 'Create new session',
    eloHistory: {
      title: 'ELO trend',
      empty: 'No puzzles solved in this period.',
      range: { week: 'Week', month: 'Month', year: 'Year', all: 'All' },
    },
    puzzlePerformance: {
      title: 'Puzzle performance',
      empty: 'No puzzles in this session pool yet.',
      roundLabel: (round) => `Round ${round}`,
      legendSolved: 'Solved',
      legendFailed: 'Failed',
      legendPending: 'To do',
      openSession: 'Open session',
      expandSession: 'Expand session details',
      collapseSession: 'Collapse session details',
    },
  },
  newSession: {
    title: 'New session',
    subtitle:
      'Set up your Woodpecker training: the same puzzle set repeated over 3 rounds, faster each time.',
    sessionName: 'Session name (optional)',
    sessionNamePlaceholder: 'e.g. Fork practice',
    totalPuzzles: 'Total puzzles in the session',
    roundLabel: (round) => `Round ${round} — puzzles/day`,
    daysEstimate: (days) => `~${days} days`,
    restDays: 'Rest days between rounds',
    restDaysHint:
      'The Woodpecker Method recommends a few days of rest between one round and the next, so recall from memory is more effective. 0 = no rest.',
    errorGeneric: 'Error creating the session',
    errorInvalidValues:
      'Puzzles and puzzles/day must be whole numbers ≥ 1; rest days must be ≥ 0.',
    start: 'Start session',
    calendarTitle: 'Calendar preview',
    calendarEndDate: (date) => `Estimated finish: ${date}`,
    calendarTruncated: 'Too long to show in full.',
    calendarRestLabel: 'Rest',
    calendarInvalid:
      'Enter a puzzle total and at least 1 puzzle/day for each round to see the preview.',
    themesTitle: 'Puzzle themes',
    themesSubtitle:
      'Round 1 will only draw new puzzles from the selected themes. Rounds 2 and 3 still repeat the same pool, with no new selection.',
    themesSelectedCount: (selected, total) => `${selected}/${total} selected`,
    themesSelectAll: 'Select all',
    themesDeselectAll: 'Deselect all',
    errorNoThemes: 'Select at least one puzzle theme.',
  },
  puzzleThemes: {
    categories: {
      phase: 'Game phase',
      goal: 'Goal',
      length: 'Length',
      level: 'Level',
      tactics: 'Tactical motifs',
      mates: 'Checkmate patterns',
      endgameType: 'Endgame type',
      specialMoves: 'Special moves',
    },
    labels: {
      opening: 'Opening',
      middlegame: 'Middlegame',
      endgame: 'Endgame',
      crushing: 'Crushing',
      advantage: 'Advantage',
      equality: 'Equality',
      oneMove: 'One-move',
      short: 'Short',
      long: 'Long',
      veryLong: 'Very long',
      master: 'Master games',
      masterVsMaster: 'Master vs Master',
      superGM: 'Super GM',
      fork: 'Fork',
      pin: 'Pin',
      skewer: 'Skewer',
      discoveredAttack: 'Discovered attack',
      discoveredCheck: 'Discovered check',
      doubleCheck: 'Double check',
      deflection: 'Deflection',
      attraction: 'Attraction',
      clearance: 'Clearance',
      interference: 'Interference',
      intermezzo: 'Intermezzo (Zwischenzug)',
      xRayAttack: 'X-Ray attack',
      zugzwang: 'Zugzwang',
      trappedPiece: 'Trapped piece',
      capturingDefender: 'Capture the defender',
      hangingPiece: 'Hanging piece',
      quietMove: 'Quiet move',
      defensiveMove: 'Defensive move',
      sacrifice: 'Sacrifice',
      advancedPawn: 'Advanced pawn',
      exposedKing: 'Exposed king',
      kingsideAttack: 'Kingside attack',
      queensideAttack: 'Queenside attack',
      attackingF2F7: 'Attack on f2/f7',
      collinearMove: 'Collinear move',
      mate: 'Checkmate',
      mateIn1: 'Mate in 1',
      mateIn2: 'Mate in 2',
      mateIn3: 'Mate in 3',
      mateIn4: 'Mate in 4',
      mateIn5: 'Mate in 5',
      backRankMate: 'Back rank mate',
      smotheredMate: 'Smothered mate',
      anastasiaMate: "Anastasia's mate",
      arabianMate: 'Arabian mate',
      bodenMate: "Boden's mate",
      hookMate: 'Hook mate',
      dovetailMate: 'Dovetail mate',
      doubleBishopMate: 'Double bishop mate',
      cornerMate: 'Corner mate',
      epauletteMate: 'Epaulette mate',
      killBoxMate: 'Kill box mate',
      morphysMate: "Morphy's mate",
      operaMate: 'Opera mate',
      pillsburysMate: "Pillsbury's mate",
      swallowstailMate: "Swallow's tail mate",
      triangleMate: 'Triangle mate',
      vukovicMate: 'Vukovic mate',
      blindSwineMate: 'Blind swine mate',
      balestraMate: 'Balestra mate',
      pawnEndgame: 'Pawn endgame',
      knightEndgame: 'Knight endgame',
      bishopEndgame: 'Bishop endgame',
      rookEndgame: 'Rook endgame',
      queenEndgame: 'Queen endgame',
      queenRookEndgame: 'Queen and rook endgame',
      promotion: 'Promotion',
      enPassant: 'En passant',
      castling: 'Castling',
      underPromotion: 'Underpromotion',
    },
  },
  sessionsHistory: {
    title: 'Session history',
    empty: 'No session created yet.',
    puzzlesRound: (total, round) => `${total} puzzles — round ${round}/3`,
    createdOn: (date) => `Created on ${date}`,
  },
  sessionDetail: {
    title: (date) => `Session from ${date}`,
    subtitle: (total, round, status) => `${total} puzzles · round ${round}/3 · ${status}`,
    selectPrompt: 'Select a puzzle from the list to review it or solve it again.',
  },
  sessionStatus: {
    in_progress: 'In progress',
    completed: 'Completed',
    abandoned: 'Abandoned',
  },
  train: {
    noActiveSession: 'No active session.',
    createSession: 'Create a session',
    practiceTitle: 'Free practice',
    practiceSubtitle: "The result isn't tracked in the official session.",
    title: 'Training',
    roundInfo: (round, total) => `Round ${round} of 3 — ${total} total puzzles`,
    todayPuzzle: (current, target) => `Today's puzzle: ${current}/${target}`,
    autoAdvance: 'Auto-advance',
    soundEnabled: 'Sounds',
    onlyFailedPuzzles: 'Only failed puzzles',
    failedScopeAll: 'All failed',
    failedScopeLastRound: 'Failed in the last run',
    backToList: 'Back to list',
    quotaTitle: "Today's quota completed",
    quotaDescription: (round) =>
      `You've reached the daily target for round ${round}. Come back tomorrow to continue, or pick a puzzle from the list on the left to practice freely.`,
    restingTitle: 'Resting between rounds',
    restingDescription: (date, round) =>
      `Round ${round} starts on ${date}: the Woodpecker Method recommends a few days of rest, so the next round is real recall instead of short-term repetition. In the meantime you can practice freely by picking a puzzle from the list on the left.`,
    checkAgain: 'Check again',
    sessionCompleteTitle: 'Session completed 🎉',
    sessionCompleteDescription:
      "You've finished all 3 rounds of this session. You can keep practicing freely by picking a puzzle from the list on the left.",
    backToDashboard: 'Back to dashboard',
  },
  puzzleBoard: {
    rating: (rating) => `Rating ${rating}`,
    analysisMode: 'Analysis mode — move freely',
    reviewingMove: (ply) => `Reviewing move ${ply}`,
    opponentMoving: 'Opponent is moving…',
    solved: 'Solved! 🎉',
    wrongMove: 'Wrong move',
    moveWith: (color) => `Move with ${color}`,
    white: 'White',
    black: 'Black',
    prevMove: 'Previous move',
    nextMove: 'Next move',
    nextPuzzle: 'Next puzzle →',
    choosePromotion: 'Choose promotion piece',
    promotionPieces: { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' },
  },
  analysisPanel: {
    title: 'Engine analysis',
    settingsAria: 'Analysis settings',
    settingsTitle: 'Analysis settings',
    analyzing: 'Analyzing…',
    noAnalysis: 'No analysis available.',
    depth: (current, target) => `Depth ${current}/${target}`,
    numberOfLines: 'Number of lines',
    engineDepth: 'Engine depth',
    bestMoveArrow: 'Best move arrow',
  },
  moveHistory: {
    title: 'Move history',
    empty: 'No moves yet.',
    goToStart: 'Go to start',
    prevMove: 'History: previous move',
    nextMove: 'History: next move',
    goToEnd: 'Go to end',
  },
  sessionPuzzleList: {
    title: 'Session puzzles',
    quotaHint: "Today's quota completed: pick a puzzle to practice freely.",
    empty: 'No puzzle attempted yet.',
    roundResult: (round, solved, timeSeconds) =>
      `Round ${round}: ${solved ? 'solved' : 'failed'} in ${timeSeconds}s`,
    roundTodo: (round) => `Round ${round}: to do`,
    practiceTooltip: (date, solved, timeSeconds, isBest) =>
      `Free practice — ${date}: ${solved ? 'solved' : 'failed'} in ${timeSeconds}s${isBest ? ' (best time)' : ''}`,
    themesToggle: 'Info',
    themesEmpty: 'No themes available for this puzzle.',
    infoDisabledHint: 'Available after attempting the puzzle in this round.',
    copyFen: 'Copy FEN',
    copyPgn: 'Copy PGN',
    fenCopied: 'Copied!',
  },
  devTools: {
    title: '🔧 Debug (dev only)',
    resetting: 'Resetting…',
    resetQuota: "Reset today's quota",
    resetSession: 'Reset session (incl. ELO)',
    deleteActiveSession: 'Delete active session',
    skipRest: 'Skip rest',
    addKnightPromotionPuzzle: 'Add knight promotion puzzle',
  },
  profile: {
    openLabel: 'Profile',
    title: 'Profile',
    elo: (elo) => `ELO ${elo}`,
  },
  appearance: {
    boardTheme: 'Board style',
    pieceSet: 'Piece style',
    themes: {
      classic: 'Classic',
      ocean: 'Ocean',
      forest: 'Forest',
      slate: 'Slate',
      coral: 'Coral',
    },
  },
  faq: {
    title: 'Frequently asked questions',
    intro:
      'How the Woodpecker Method works, how Chess Hammer applies it, and how to read your data to improve.',
    items: [
      {
        question: 'What is the Woodpecker Method?',
        answer:
          "The Woodpecker Method is a tactical training technique devised by grandmasters Axel Smith and Hans Tikkanen: you pick a fixed set of puzzles and solve it several times in a row (usually 3-7 rounds), instead of always solving new puzzles.\n\nEach repetition of the same set should be faster than the previous one: the goal isn't to memorize the puzzle, but to train instant recognition of tactical patterns (forks, pins, typical sacrifices...), making them automatic even in a real game, under the clock.",
      },
      {
        question: 'How is it applied in Chess Hammer?',
        answer:
          "Each session has a fixed puzzle pool (configurable when you create it, e.g. 200) and unfolds over 3 rounds:\n\nRound 1 — discovery: puzzles are picked one at a time based on your current ELO rating, and form the session's fixed pool.\nRounds 2 and 3 — repetition: you go through the exact same pool, in the same order, trying to solve it faster.\n\nEach round has a configurable daily target (e.g. 10/20/40 puzzles a day for rounds 1/2/3): the app automatically works out how many days each round will take.\n\nYou can also set a few days of rest between one round and the next (0 = none, as the original method recommends): while the rest period hasn't elapsed the official session waits, but you can still train freely in practice mode.",
      },
      {
        question: 'What does ELO represent?',
        answer:
          'It\'s an estimate of your tactical level, computed with the same formula chess uses to rate players: after each attempt, your ELO moves toward the puzzle\'s rating depending on whether you solved it or not, weighted by how "expected" the outcome was — beating a puzzle well above your level is worth more if you solve it.',
      },
      {
        question: 'When does ELO change, and why only then?',
        answer:
          "ELO changes ONLY during round 1 of each session. In rounds 2 and 3 it stays frozen, whether you solve the puzzles or not.\n\nWhy: in round 1 the puzzles are new to you, so solving them is a real test of your tactical strength — that's also why they're picked based on your current ELO. In rounds 2 and 3 you're repeating puzzles you've already seen and (hopefully) already solved: getting faster measures memorization and pattern automaticity, not your chess strength, so it isn't a fair signal to update ELO with.\n\nELO starts changing again at round 1 of the next session, when you face puzzles you've never seen before.",
      },
      {
        question: 'What can I configure?',
        answer:
          'When creating a session: the total number of puzzles, the daily target for each of the 3 rounds, and the rest days between one round and the next.\n\nIn your profile: language, board style, piece set, auto-advance to the next puzzle, sounds.',
      },
      {
        question: 'What data is measured, and how does it help?',
        answer:
          "For every attempt: outcome (solved/failed), solving time, round, and ELO before/after. This data feeds:\n\n— the ELO trend chart, to see your progress over time;\n— the Puzzle performance heatmap, showing at a glance which puzzles you solve and which you miss, round by round;\n— the solving-time chart, to see whether you're actually getting faster on repetition, the whole point of the method.\n\nA cell that keeps turning up red for the same puzzle across rounds, or a solving time that isn't dropping, are useful signals: that pattern hasn't stuck yet and is worth reviewing calmly in practice mode.",
      },
      {
        question: 'What is practice mode?',
        answer:
          "You can review and re-solve any puzzle you've already encountered, even from past sessions, without the attempt affecting the official session or your ELO: it's purely for free training. You'll find it by clicking a puzzle in a session's list, or a cell in the Puzzle performance heatmap on the dashboard.",
      },
    ],
  },
  errors: {
    noPuzzleAvailable: 'No puzzle available for this rating: pool exhausted.',
  },
}

export const translations: Record<Language, Translations> = { it, en }
