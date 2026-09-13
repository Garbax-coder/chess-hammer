import type { BoardThemeId } from '@/lib/board-themes'

export type Language = 'it' | 'en'

export interface Translations {
  meta: { locale: string }
  common: {
    loading: string
    email: string
    password: string
    or: string
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
    }
  }
  newSession: {
    title: string
    subtitle: string
    totalPuzzles: string
    roundLabel: (round: number) => string
    daysEstimate: (days: number | string) => string
    errorGeneric: string
    errorInvalidValues: string
    start: string
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
    empty: string
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
    backToList: string
    quotaTitle: string
    quotaDescription: (round: number) => string
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
  }
  devTools: {
    title: string
    resetting: string
    resetQuota: string
    resetSession: string
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
    },
  },
  newSession: {
    title: 'Nuova sessione',
    subtitle:
      'Configura il tuo allenamento Woodpecker: stesso set di puzzle ripetuto per 3 giri, sempre più veloce.',
    totalPuzzles: 'Totale puzzle nella sessione',
    roundLabel: (round) => `${round}° giro — puzzle/giorno`,
    daysEstimate: (days) => `~${days} giorni`,
    errorGeneric: 'Errore nella creazione della sessione',
    errorInvalidValues:
      'Tutti i valori devono essere numeri interi maggiori o uguali a 1.',
    start: 'Avvia sessione',
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
    empty: 'Nessun puzzle ancora nel pool di questa sessione.',
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
    backToList: 'Torna alla lista',
    quotaTitle: 'Quota di oggi completata',
    quotaDescription: (round) =>
      `Hai raggiunto il target giornaliero per il giro ${round}. Torna domani per continuare, oppure seleziona un puzzle dalla lista a sinistra per allenarti liberamente.`,
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
  },
  devTools: {
    title: '🔧 Debug (solo sviluppo)',
    resetting: 'Reset…',
    resetQuota: 'Reset quota oggi',
    resetSession: 'Reset sessione (ELO incluso)',
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
    },
  },
  newSession: {
    title: 'New session',
    subtitle:
      'Set up your Woodpecker training: the same puzzle set repeated over 3 rounds, faster each time.',
    totalPuzzles: 'Total puzzles in the session',
    roundLabel: (round) => `Round ${round} — puzzles/day`,
    daysEstimate: (days) => `~${days} days`,
    errorGeneric: 'Error creating the session',
    errorInvalidValues: 'All values must be whole numbers greater than or equal to 1.',
    start: 'Start session',
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
    empty: 'No puzzles in this session pool yet.',
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
    backToList: 'Back to list',
    quotaTitle: "Today's quota completed",
    quotaDescription: (round) =>
      `You've reached the daily target for round ${round}. Come back tomorrow to continue, or pick a puzzle from the list on the left to practice freely.`,
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
  },
  devTools: {
    title: '🔧 Debug (dev only)',
    resetting: 'Resetting…',
    resetQuota: "Reset today's quota",
    resetSession: 'Reset session (incl. ELO)',
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
  errors: {
    noPuzzleAvailable: 'No puzzle available for this rating: pool exhausted.',
  },
}

export const translations: Record<Language, Translations> = { it, en }
