import type { Language } from '@/lib/i18n/translations'

// Testi dell'allenamento sulle aperture, in un modulo a parte da
// translations.ts. Solo dati (come translations.ts): li leggono anche i test
// end-to-end, fuori da React. L'hook e' in openings.ts.
export interface OpeningsTranslations {
  navLabel: string
  title: string
  subtitle: string
  dashboardTitle: string
  dashboardSummary: (repertoires: number, lines: number) => string
  dashboardReview: (name: string) => string
  dashboardLearn: (name: string) => string
  dashboardOpen: string
  dashboardEmpty: string
  statsTab: string
  statsSubtitle: string
  statsEmpty: string
  statsTiles: {
    firstTries: string
    accuracy: string
    averageTime: string
    mastered: string
    linesMastered: string
    cycles: string
  }
  statsByRepertoire: string
  statsColumns: {
    repertoire: string
    moves: string
    mastered: string
    due: string
    tries: string
    accuracy: string
    time: string
    cycles: string
  }
  statsHardest: string
  statsHardestNote: (min: number) => string
  statsHardestEmpty: (min: number) => string
  statsHardestLine: (accuracy: number, tries: number) => string
  statsActivity: string
  statsActivityNote: (days: number, moves: number) => string
  statsDay: (date: string, moves: number, correct: number) => string
  faqTitle: string
  faqItems: { question: string; answer: string }[]
  creditsTitle: string
  creditsBody: string
  empty: string
  notFound: string
  back: string
  color: { w: string; b: string }
  runs: (n: number) => string
  mastered: (mastered: number, total: number) => string
  due: (n: number) => string
  newMoves: (n: number) => string
  runsMastered: (mastered: number, total: number) => string
  train: string
  yourMove: string
  opponentMoving: string
  correct: string
  wrong: (san: string) => string
  runDone: string
  runResult: (correct: number, total: number) => string
  nextRun: string
  repeatRun: string
  movesTitle: string
  progressTitle: string
  saveError: string
  browse: string
  treeTitle: string
  linesTitle: string
  startPosition: string
  legendTitle: string
  legend: { new: string; learning: string; due: string; mastered: string }
  collapse: string
  expand: string
  expandAll: string
  collapseAll: string
  opponentMove: string
  neverPlayed: string
  moveStats: (attempts: number, firstTryPercent: number) => string
  nextReview: (date: string) => string
  dueNow: string
  trainLine: string
  showNames: string
  showComments: string
  commentTitle: (move: string) => string
  commentPlaceholder: string
  commentHint: string
  saveComment: string
  deleteComment: string
  cancel: string
  editLines: string
  doneEditing: string
  editHint: string
  deleteMove: string
  confirmDeleteMove: string
  alternativeNoContinuation: string
  makeAlternative: string
  makeLine: string
  endsWithOpponent: string
  copyToEdit: string
  copyName: (name: string) => string
  rename: string
  renameSave: string
  editError: string
  learn: string
  learnLine: string
  learnIntro: string
  playMove: (move: string) => string
  followArrow: (move: string) => string
  playForMe: string
  lineLearned: string
  learnNext: string
  repeatLearn: string
  allLearned: string
  allLearnedReview: string
  lineOf: (n: number, total: number) => string
  toLearn: (n: number) => string
  alternativeLabel: string
  alternativePlayed: (played: string, main: string) => string
  fastForward: string
  sessionLine: (n: number, total: number) => string
  repeatPhase: (n: number, total: number) => string
  continueRepeat: string
  showSummary: string
  sessionDone: string
  sessionSummary: (lines: number, correct: number, total: number) => string
  repeatedLines: (n: number) => string
  newSession: string
  cycles: string
  cyclesTitle: string
  cyclesIntro: string
  startCycle: (n: number) => string
  cycleProgress: (cycle: number, line: number, total: number) => string
  previousCycle: (time: string) => string
  cycleDone: (n: number) => string
  cycleResult: (time: string, correct: number, total: number) => string
  faster: (delta: string) => string
  slower: (delta: string) => string
  noCycles: string
  cycleColumns: { cycle: string; date: string; time: string; accuracy: string }
  importPgn: string
  importTitle: string
  importIntro: string
  pgnLabel: string
  pgnPlaceholder: string
  fileLabel: string
  nameLabel: string
  colorLabel: string
  previewTitle: string
  previewLines: (lines: number, moves: number) => string
  previewAlternatives: (n: number) => string
  previewTrimmed: (n: number) => string
  previewSkipped: (n: number) => string
  previewEmpty: string
  illegalMove: (line: number, move: string) => string
  previewTooBig: (max: number) => string
  importButton: string
  importError: string
  ecoButton: string
  ecoTitle: string
  ecoIntro: string
  ecoSearchLabel: string
  ecoSearchPlaceholder: string
  ecoLoading: string
  ecoNoResults: string
  ecoLines: (n: number) => string
  ecoChange: string
  ecoBranches: string
  ecoBranchesHint: string
  ecoOpponentEnds: string
  ecoOpponentEndsHint: string
  previewOpenEnds: (n: number) => string
  ecoCreate: string
  ecoCredit: string
  personal: string
  deleteRepertoire: string
  confirmDelete: string
  scratchButton: string
  scratchTitle: string
  scratchIntro: string
  scratchCreate: string
  hideRepertoire: string
  hiddenTitle: (n: number) => string
  showHidden: string
  restoreRepertoire: string
  cancelDelete: string
  noLinesYet: string
  addLines: string
  /** Nomi dei repertori di catalogo, per slug (altrimenti il nome inglese). */
  names: Record<string, string>
}

const it: OpeningsTranslations = {
  navLabel: 'Aperture',
  title: 'Aperture',
  subtitle:
    'Allena i tuoi repertori una linea alla volta, finché le mosse diventano automatiche.',
  dashboardTitle: 'Aperture',
  dashboardSummary: (r, l) =>
    `${r} ${r === 1 ? 'repertorio' : 'repertori'} · ${l} ${l === 1 ? 'linea' : 'linee'}`,
  dashboardReview: (name) => `Ripassa ${name}`,
  dashboardLearn: (name) => `Studia ${name}`,
  dashboardOpen: 'Tutte le aperture',
  dashboardEmpty:
    'Nessun repertorio nella tua libreria: creane uno o rimetti quelli del catalogo.',
  statsTab: 'Aperture',
  statsSubtitle:
    'Le tue risposte sulle aperture in Allena e nei Cicli: per ogni mossa conta il primo tentativo.',
  statsEmpty:
    'Nessuna mossa allenata ancora: comincia da Studia o Allena in un repertorio.',
  statsTiles: {
    firstTries: 'Mosse allenate',
    accuracy: 'Giuste al primo colpo',
    averageTime: 'Tempo medio di risposta',
    mastered: 'Mosse consolidate',
    linesMastered: 'Linee padroneggiate',
    cycles: 'Cicli completati',
  },
  statsByRepertoire: 'Per repertorio',
  statsColumns: {
    repertoire: 'Repertorio',
    moves: 'Mosse',
    mastered: 'Consolidate',
    due: 'Da ripassare',
    tries: 'Tentativi',
    accuracy: 'Al primo colpo',
    time: 'Tempo medio',
    cycles: 'Cicli',
  },
  statsHardest: 'Le mosse più difficili',
  statsHardestNote: (min) =>
    `Le tue mosse con più errori al primo tentativo, tra quelle allenate almeno ${min} volte.`,
  statsHardestEmpty: (min) => `Ancora nessuna mossa allenata almeno ${min} volte.`,
  statsHardestLine: (accuracy, tries) =>
    `${accuracy}% al primo colpo · ${tries} tentativi`,
  statsActivity: 'Attività negli ultimi 30 giorni',
  statsActivityNote: (days, moves) =>
    `${days} ${days === 1 ? 'giorno' : 'giorni'} di allenamento, ${moves} ${moves === 1 ? 'mossa' : 'mosse'}`,
  statsDay: (date, moves, correct) =>
    `${date}: ${moves} ${moves === 1 ? 'mossa' : 'mosse'}, ${correct} giuste`,
  faqTitle: 'Aperture',
  faqItems: [
    {
      question: 'Come funziona l’allenamento sulle aperture?',
      answer:
        'Un repertorio è un albero di mosse: le tue e le risposte dell’avversario. Lo alleni una linea alla volta, contro l’avversario che risponde da solo.\n\nStudia ti mostra le mosse nuove con una freccia. Allena te le chiede senza aiuto, partendo dalle linee da ripassare e ripetendo subito quelle sbagliate. Consulta mostra l’albero con lo stato di ogni mossa, i nomi delle varianti, i tuoi commenti e l’analisi di Stockfish. Cicli ti fa giocare tutte le linee di fila, a tempo, come il metodo Woodpecker.',
    },
    {
      question: 'Come creo un repertorio?',
      answer:
        'In cinque modi: usi uno di quelli già pronti, lo crei da zero giocando le mosse sulla scacchiera, lo crei da un codice ECO o dal nome di un’apertura, importi un PGN (anche uno studio di Lichess) oppure copi un repertorio esistente per modificarlo.\n\nI repertori personali si modificano in Consulta con “Modifica le linee”: aggiungi o togli mosse, tue e dell’avversario, e rinomini il repertorio dalla matita accanto al nome.',
    },
    {
      question: 'Quando una mossa è consolidata?',
      answer:
        'Dopo tre risposte giuste di fila al primo tentativo. Ogni mossa torna a ripasso a intervalli crescenti: 4 ore, poi 1, 3, 7, 21 e 60 giorni. Un errore la rimette all’inizio.\n\nLe mosse già consolidate in testa a una linea si possono giocare da sole (“Salta le mosse già note”), così ti alleni dove serve.',
    },
    {
      question: 'Cosa sono le alternative accettate?',
      answer:
        'Mosse buone che non vuoi allenare: se le giochi non è un errore, ma poi ti viene chiesta la mossa della linea. Una tua mossa diversa nella stessa posizione può anche aprire una linea nuova, con il suo seguito: lo scegli tu in Consulta.',
    },
    {
      question: 'Da dove vengono i nomi delle aperture?',
      answer:
        'Dal dataset pubblico delle aperture di Lichess (codici ECO e nomi delle varianti, di pubblico dominio). Lo stesso dataset serve per creare un repertorio da ECO.',
    },
  ],
  creditsTitle: 'Aperture',
  creditsBody:
    'Nomi delle aperture, codici ECO e linee per creare un repertorio da ECO vengono dal dataset lichess-org/chess-openings, di pubblico dominio (CC0). Chess Hammer non è affiliato a Lichess.',
  empty: 'Nessun repertorio disponibile.',
  notFound: 'Repertorio non trovato.',
  back: 'Tutte le aperture',
  color: { w: 'Col Bianco', b: 'Col Nero' },
  runs: (n) => `${n} ${n === 1 ? 'linea' : 'linee'}`,
  mastered: (m, total) => `${m}/${total} mosse consolidate`,
  due: (n) => `${n} da ripassare`,
  newMoves: (n) => `${n} ${n === 1 ? 'nuova' : 'nuove'}`,
  runsMastered: (m, total) => `${m}/${total} linee consolidate`,
  train: 'Allena',
  yourMove: 'Tocca a te',
  opponentMoving: 'L’avversario risponde…',
  correct: 'Giusto',
  wrong: (san) => `Nel repertorio la mossa è ${san}: giocala per continuare.`,
  runDone: 'Linea completata',
  runResult: (ok, total) => `${ok} su ${total} al primo colpo`,
  nextRun: 'Prossima linea',
  repeatRun: 'Ripeti questa linea',
  movesTitle: 'Mosse della linea',
  progressTitle: 'Progressi',
  saveError: 'La mossa non è stata salvata: controlla la connessione.',
  browse: 'Consulta',
  treeTitle: 'Albero delle varianti',
  linesTitle: 'Linee',
  startPosition: 'Posizione iniziale',
  legendTitle: 'Le tue mosse',
  legend: {
    new: 'Nuova',
    learning: 'In apprendimento',
    due: 'Da ripassare',
    mastered: 'Consolidata',
  },
  collapse: 'Comprimi il ramo',
  expand: 'Espandi il ramo',
  expandAll: 'Espandi tutto',
  collapseAll: 'Comprimi tutto',
  opponentMove: 'Mossa dell’avversario',
  neverPlayed: 'Non ancora allenata',
  moveStats: (attempts, pct) =>
    `${attempts} ${attempts === 1 ? 'tentativo' : 'tentativi'} · ${pct}% al primo colpo`,
  nextReview: (date) => `Prossimo ripasso: ${date}`,
  dueNow: 'Da ripassare ora',
  trainLine: 'Allena questa linea',
  showNames: 'Nomi delle varianti',
  showComments: 'Commenti',
  commentTitle: (move) => `Commento su ${move}`,
  commentPlaceholder: 'Scrivi un commento su questa mossa…',
  commentHint: 'Tasto destro (o tocco lungo) su una mossa per commentarla.',
  saveComment: 'Salva',
  deleteComment: 'Elimina il commento',
  cancel: 'Annulla',
  editLines: 'Modifica le linee',
  doneEditing: 'Fine modifiche',
  editHint:
    'Gioca una mossa sulla scacchiera per aggiungerla dopo quella selezionata (o all’inizio, se non ne hai selezionata nessuna): le tue e quelle dell’avversario, per allungare una linea o aprirne una nuova.',
  deleteMove: 'Elimina la mossa e il seguito',
  confirmDeleteMove: 'Conferma: elimina',
  alternativeNoContinuation:
    'Dopo un’alternativa non si aggiungono mosse: rendila una linea per continuare.',
  makeAlternative: 'Rendi alternativa accettata',
  makeLine: 'Rendi una linea',
  endsWithOpponent:
    'La linea finisce con una mossa dell’avversario: aggiungi la tua risposta.',
  copyToEdit: 'Crea una copia personale per modificarla',
  copyName: (name) => `${name} (mia)`,
  rename: 'Rinomina il repertorio',
  renameSave: 'Salva',
  editError: 'Modifica non riuscita',
  learn: 'Studia',
  learnLine: 'Studia questa linea',
  learnIntro:
    'Segui la freccia e gioca le mosse nuove: poi le ripasserai nell’allenamento.',
  playMove: (move) => `Gioca ${move}`,
  followArrow: (move) => `Non è questa: segui la freccia e gioca ${move}.`,
  playForMe: 'Gioca la mossa',
  lineLearned: 'Linea studiata: le sue mosse torneranno da ripassare nell’allenamento.',
  learnNext: 'Studia la prossima linea',
  repeatLearn: 'Rivedi questa linea',
  allLearned: 'Hai già studiato tutte le linee di questo repertorio: ora allenale.',
  allLearnedReview: 'Hai già studiato tutte le linee: le stai ripassando.',
  lineOf: (n, total) => `Linea ${n} di ${total}`,
  toLearn: (n) => (n === 0 ? 'tutte studiate' : `${n} da studiare`),
  alternativeLabel: 'Alternativa accettata',
  alternativePlayed: (played, main) =>
    `${played} è una buona mossa, ma in questa linea alleniamo ${main}.`,
  fastForward: 'Salta le mosse già note',
  sessionLine: (n, total) => `Linea ${n} di ${total}`,
  repeatPhase: (n, total) => `Ripasso degli errori: ${n} di ${total}`,
  continueRepeat: 'Ripassa gli errori',
  showSummary: 'Vedi il riepilogo',
  sessionDone: 'Sessione completata',
  sessionSummary: (lines, ok, total) =>
    `${lines} ${lines === 1 ? 'linea' : 'linee'} · ${ok} su ${total} al primo colpo`,
  repeatedLines: (n) =>
    n === 0
      ? 'Nessun errore da ripassare.'
      : `${n} ${n === 1 ? 'linea ripassata' : 'linee ripassate'} alla fine.`,
  newSession: 'Nuova sessione',
  cycles: 'Cicli',
  cyclesTitle: 'Cicli Woodpecker',
  cyclesIntro:
    'Tutte le linee del repertorio di fila, a tempo. Ripeti il ciclo per completarlo ogni volta più in fretta, senza perdere precisione.',
  startCycle: (n) => `Inizia il ciclo ${n}`,
  cycleProgress: (cycle, line, total) => `Ciclo ${cycle} · linea ${line} di ${total}`,
  previousCycle: (time) => `Ciclo precedente: ${time}`,
  cycleDone: (n) => `Ciclo ${n} completato`,
  cycleResult: (time, ok, total) => `${time} · ${ok} su ${total} al primo colpo`,
  faster: (delta) => `${delta} più veloce del ciclo precedente`,
  slower: (delta) => `${delta} più lento del ciclo precedente`,
  noCycles: 'Nessun ciclo completato.',
  cycleColumns: { cycle: 'Ciclo', date: 'Data', time: 'Tempo', accuracy: 'Precisione' },
  importPgn: 'Importa un PGN',
  importTitle: 'Importa un repertorio',
  importIntro:
    'Incolla un PGN o carica un file .pgn: varianti e capitoli (per esempio di uno studio Lichess) diventano le linee del tuo repertorio.',
  pgnLabel: 'PGN',
  pgnPlaceholder: '1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 *',
  fileLabel: 'Carica un file .pgn',
  nameLabel: 'Nome',
  colorLabel: 'Giochi',
  previewTitle: 'Anteprima',
  previewLines: (lines, moves) =>
    `${lines} ${lines === 1 ? 'linea' : 'linee'}, ${moves} mosse`,
  previewAlternatives: (n) =>
    `${n} ${n === 1 ? 'mossa tua' : 'mosse tue'} in una posizione dove ne avevi già una: ${n === 1 ? 'tenuta' : 'tenute'} come alternativa accettata, senza seguito`,
  previewTrimmed: (n) =>
    `${n} ${n === 1 ? 'linea finiva' : 'linee finivano'} con una mossa dell’avversario: tolta`,
  previewSkipped: (n) =>
    `${n} ${n === 1 ? 'partita non parte' : 'partite non partono'} dalla posizione iniziale: ${n === 1 ? 'saltata' : 'saltate'}`,
  previewEmpty: 'Nessuna mossa trovata.',
  illegalMove: (line, move) =>
    `Linea ${line}: ${move} non è una mossa legale. Controlla il PGN.`,
  previewTooBig: (max) =>
    `Troppe mosse: un repertorio importato ne ha al massimo ${max}.`,
  importButton: 'Importa',
  importError: 'Importazione non riuscita',
  ecoButton: 'Crea da ECO',
  ecoTitle: 'Crea un repertorio da ECO',
  ecoIntro:
    'Cerca un codice ECO (es. C50, o C5 per C50-C59) o il nome di un’apertura: le sue varianti con nome diventano le linee di un repertorio personale, da modificare come vuoi.',
  ecoSearchLabel: 'Codice ECO o apertura',
  ecoSearchPlaceholder: 'C50, Italian, Caro-Kann…',
  ecoLoading: 'Caricamento delle aperture…',
  ecoNoResults: 'Nessuna apertura trovata.',
  ecoLines: (n) => `${n} ${n === 1 ? 'variante' : 'varianti'}`,
  ecoChange: 'Cambia',
  ecoBranches: 'Tutte le varianti come linee',
  ecoBranchesHint:
    'Spento: una sola tua mossa per posizione (quella della variante più generale), le altre restano alternative accettate.',
  ecoOpponentEnds: 'Tieni le varianti che finiscono con una mossa dell’avversario',
  ecoOpponentEndsHint:
    'Molte varianti prendono il nome dalla mossa dell’avversario: tenendole, la tua risposta la aggiungi tu in Consulta (Modifica le linee). Spento, quella mossa si toglie.',
  previewOpenEnds: (n) =>
    `${n} ${n === 1 ? 'linea finisce' : 'linee finiscono'} con una mossa dell’avversario: aggiungi la tua risposta in Consulta`,
  ecoCreate: 'Crea il repertorio',
  ecoCredit: 'Aperture e nomi: lichess-org/chess-openings (CC0).',
  personal: 'Personale',
  deleteRepertoire: 'Elimina',
  confirmDelete: 'Conferma: elimina il repertorio e i suoi progressi',
  scratchButton: 'Crea da zero',
  scratchTitle: 'Crea un repertorio da zero',
  scratchIntro:
    'Scegli nome e colore: il repertorio parte vuoto e lo costruisci mossa per mossa sulla scacchiera, le tue e quelle dell’avversario.',
  scratchCreate: 'Crea e inizia a costruire',
  hideRepertoire: 'Togli dalla libreria',
  hiddenTitle: (n) =>
    `${n} ${n === 1 ? 'repertorio tolto' : 'repertori tolti'} dalla libreria`,
  showHidden: 'Mostra',
  restoreRepertoire: 'Rimetti nella libreria',
  cancelDelete: 'Annulla',
  noLinesYet: 'Questo repertorio non ha ancora linee.',
  addLines: 'Aggiungile in Consulta',
  names: {
    'italian-game': 'Partita Italiana',
    'queens-gambit': 'Gambetto di Donna',
    'caro-kann': 'Difesa Caro-Kann',
  },
}

const en: OpeningsTranslations = {
  navLabel: 'Openings',
  title: 'Openings',
  subtitle: 'Train your repertoires one line at a time, until the moves come naturally.',
  dashboardTitle: 'Openings',
  dashboardSummary: (r, l) =>
    `${r} ${r === 1 ? 'repertoire' : 'repertoires'} · ${l} ${l === 1 ? 'line' : 'lines'}`,
  dashboardReview: (name) => `Review ${name}`,
  dashboardLearn: (name) => `Learn ${name}`,
  dashboardOpen: 'All openings',
  dashboardEmpty:
    'No repertoire in your library: create one or put back the catalog ones.',
  statsTab: 'Openings',
  statsSubtitle:
    'Your answers on the openings in Train and Cycles: for each move the first try counts.',
  statsEmpty: 'No move trained yet: start from Learn or Train in a repertoire.',
  statsTiles: {
    firstTries: 'Moves trained',
    accuracy: 'Right on the first try',
    averageTime: 'Average answer time',
    mastered: 'Moves mastered',
    linesMastered: 'Lines mastered',
    cycles: 'Cycles completed',
  },
  statsByRepertoire: 'By repertoire',
  statsColumns: {
    repertoire: 'Repertoire',
    moves: 'Moves',
    mastered: 'Mastered',
    due: 'Due',
    tries: 'Tries',
    accuracy: 'First try',
    time: 'Average time',
    cycles: 'Cycles',
  },
  statsHardest: 'The hardest moves',
  statsHardestNote: (min) =>
    `Your moves with the most mistakes on the first try, among those trained at least ${min} times.`,
  statsHardestEmpty: (min) => `No move trained at least ${min} times yet.`,
  statsHardestLine: (accuracy, tries) => `${accuracy}% on the first try · ${tries} tries`,
  statsActivity: 'Activity in the last 30 days',
  statsActivityNote: (days, moves) =>
    `${days} ${days === 1 ? 'day' : 'days'} of training, ${moves} ${moves === 1 ? 'move' : 'moves'}`,
  statsDay: (date, moves, correct) =>
    `${date}: ${moves} ${moves === 1 ? 'move' : 'moves'}, ${correct} right`,
  faqTitle: 'Openings',
  faqItems: [
    {
      question: 'How does opening training work?',
      answer:
        'A repertoire is a tree of moves: yours and your opponent’s replies. You train it one line at a time, against an opponent who replies on its own.\n\nLearn shows you the new moves with an arrow. Train asks for them without help, starting from the lines due for review and repeating the ones you got wrong right away. Browse shows the tree with the state of each move, the variation names, your comments and Stockfish analysis. Cycles has you play every line in a row, against the clock, like the Woodpecker Method.',
    },
    {
      question: 'How do I create a repertoire?',
      answer:
        'In five ways: use one of the ready-made ones, create it from scratch by playing the moves on the board, create it from an ECO code or an opening name, import a PGN (a Lichess study too) or copy an existing repertoire to edit it.\n\nPersonal repertoires are edited in Browse with “Edit the lines”: add or remove moves, yours and your opponent’s, and rename the repertoire with the pencil next to its name.',
    },
    {
      question: 'When is a move mastered?',
      answer:
        'After three right answers in a row on the first try. Each move comes back for review at growing intervals: 4 hours, then 1, 3, 7, 21 and 60 days. A mistake sends it back to the start.\n\nThe mastered moves at the start of a line can be played for you (“Skip the moves you know”), so you train where it matters.',
    },
    {
      question: 'What are accepted alternatives?',
      answer:
        'Good moves you don’t want to train: playing one is not a mistake, but then you’re asked for the move of the line. A different move of yours in the same position can also open a new line, with its own continuation: you choose in Browse.',
    },
    {
      question: 'Where do the opening names come from?',
      answer:
        'From the public Lichess openings dataset (ECO codes and variation names, in the public domain). The same dataset is used to create a repertoire from ECO.',
    },
  ],
  creditsTitle: 'Openings',
  creditsBody:
    'Opening names, ECO codes and the lines used to create a repertoire from ECO come from the lichess-org/chess-openings dataset, in the public domain (CC0). Chess Hammer is not affiliated with Lichess.',
  empty: 'No repertoire available.',
  notFound: 'Repertoire not found.',
  back: 'All openings',
  color: { w: 'As White', b: 'As Black' },
  runs: (n) => `${n} ${n === 1 ? 'line' : 'lines'}`,
  mastered: (m, total) => `${m}/${total} moves mastered`,
  due: (n) => `${n} due`,
  newMoves: (n) => `${n} new`,
  runsMastered: (m, total) => `${m}/${total} lines mastered`,
  train: 'Train',
  yourMove: 'Your move',
  opponentMoving: 'Opponent is replying…',
  correct: 'Correct',
  wrong: (san) => `The repertoire move is ${san}: play it to continue.`,
  runDone: 'Line complete',
  runResult: (ok, total) => `${ok} of ${total} on the first try`,
  nextRun: 'Next line',
  repeatRun: 'Repeat this line',
  movesTitle: 'Moves of the line',
  progressTitle: 'Progress',
  saveError: 'The move was not saved: check your connection.',
  browse: 'Browse',
  treeTitle: 'Variation tree',
  linesTitle: 'Lines',
  startPosition: 'Starting position',
  legendTitle: 'Your moves',
  legend: { new: 'New', learning: 'Learning', due: 'Due', mastered: 'Mastered' },
  collapse: 'Collapse branch',
  expand: 'Expand branch',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  opponentMove: 'Opponent move',
  neverPlayed: 'Not trained yet',
  moveStats: (attempts, pct) =>
    `${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} · ${pct}% on the first try`,
  nextReview: (date) => `Next review: ${date}`,
  dueNow: 'Due now',
  trainLine: 'Train this line',
  showNames: 'Variation names',
  showComments: 'Comments',
  commentTitle: (move) => `Comment on ${move}`,
  commentPlaceholder: 'Write a comment on this move…',
  commentHint: 'Right-click (or long-press) a move to comment on it.',
  saveComment: 'Save',
  deleteComment: 'Delete the comment',
  cancel: 'Cancel',
  editLines: 'Edit the lines',
  doneEditing: 'Done editing',
  editHint:
    'Play a move on the board to add it after the selected one (or at the start, if none is selected): yours and your opponent’s, to extend a line or start a new one.',
  deleteMove: 'Delete the move and what follows',
  confirmDeleteMove: 'Confirm: delete',
  alternativeNoContinuation:
    'No moves can follow an alternative: make it a line to continue.',
  makeAlternative: 'Make it an accepted alternative',
  makeLine: 'Make it a line',
  endsWithOpponent: 'The line ends with an opponent move: add your reply.',
  copyToEdit: 'Make a personal copy to edit it',
  copyName: (name) => `${name} (mine)`,
  rename: 'Rename the repertoire',
  renameSave: 'Save',
  editError: 'Edit failed',
  learn: 'Learn',
  learnLine: 'Learn this line',
  learnIntro:
    'Follow the arrow and play the new moves: you will review them in training.',
  playMove: (move) => `Play ${move}`,
  followArrow: (move) => `Not that one: follow the arrow and play ${move}.`,
  playForMe: 'Play the move',
  lineLearned: 'Line learned: its moves will come back for review in training.',
  learnNext: 'Learn the next line',
  repeatLearn: 'Go through this line again',
  allLearned: 'You have learned every line of this repertoire: now train them.',
  allLearnedReview: 'You have learned every line: you are going through them again.',
  lineOf: (n, total) => `Line ${n} of ${total}`,
  toLearn: (n) => (n === 0 ? 'all learned' : `${n} to learn`),
  alternativeLabel: 'Accepted alternative',
  alternativePlayed: (played, main) =>
    `${played} is a good move, but in this line we train ${main}.`,
  fastForward: 'Skip moves you know',
  sessionLine: (n, total) => `Line ${n} of ${total}`,
  repeatPhase: (n, total) => `Reviewing mistakes: ${n} of ${total}`,
  continueRepeat: 'Review the mistakes',
  showSummary: 'See the summary',
  sessionDone: 'Session complete',
  sessionSummary: (lines, ok, total) =>
    `${lines} ${lines === 1 ? 'line' : 'lines'} · ${ok} of ${total} on the first try`,
  repeatedLines: (n) =>
    n === 0
      ? 'No mistakes to review.'
      : `${n} ${n === 1 ? 'line' : 'lines'} reviewed at the end.`,
  newSession: 'New session',
  cycles: 'Cycles',
  cyclesTitle: 'Woodpecker cycles',
  cyclesIntro:
    'Every line of the repertoire in a row, against the clock. Repeat the cycle to finish it faster each time, without losing accuracy.',
  startCycle: (n) => `Start cycle ${n}`,
  cycleProgress: (cycle, line, total) => `Cycle ${cycle} · line ${line} of ${total}`,
  previousCycle: (time) => `Previous cycle: ${time}`,
  cycleDone: (n) => `Cycle ${n} complete`,
  cycleResult: (time, ok, total) => `${time} · ${ok} of ${total} on the first try`,
  faster: (delta) => `${delta} faster than the previous cycle`,
  slower: (delta) => `${delta} slower than the previous cycle`,
  noCycles: 'No cycles completed yet.',
  cycleColumns: { cycle: 'Cycle', date: 'Date', time: 'Time', accuracy: 'Accuracy' },
  importPgn: 'Import a PGN',
  importTitle: 'Import a repertoire',
  importIntro:
    'Paste a PGN or upload a .pgn file: variations and chapters (for instance of a Lichess study) become the lines of your repertoire.',
  pgnLabel: 'PGN',
  pgnPlaceholder: '1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 *',
  fileLabel: 'Upload a .pgn file',
  nameLabel: 'Name',
  colorLabel: 'You play',
  previewTitle: 'Preview',
  previewLines: (lines, moves) =>
    `${lines} ${lines === 1 ? 'line' : 'lines'}, ${moves} moves`,
  previewAlternatives: (n) =>
    `${n} ${n === 1 ? 'move' : 'moves'} of yours in a position where you already had one: kept as accepted ${n === 1 ? 'alternative' : 'alternatives'}, without continuation`,
  previewTrimmed: (n) =>
    `${n} ${n === 1 ? 'line ended' : 'lines ended'} with an opponent move: removed`,
  previewSkipped: (n) =>
    `${n} ${n === 1 ? 'game does not start' : 'games do not start'} from the initial position: skipped`,
  previewEmpty: 'No moves found.',
  illegalMove: (line, move) =>
    `Line ${line}: ${move} is not a legal move. Check the PGN.`,
  previewTooBig: (max) => `Too many moves: an imported repertoire has at most ${max}.`,
  importButton: 'Import',
  importError: 'Import failed',
  ecoButton: 'Create from ECO',
  ecoTitle: 'Create a repertoire from ECO',
  ecoIntro:
    'Search an ECO code (e.g. C50, or C5 for C50-C59) or an opening name: its named variations become the lines of a personal repertoire, which you can edit as you like.',
  ecoSearchLabel: 'ECO code or opening',
  ecoSearchPlaceholder: 'C50, Italian, Caro-Kann…',
  ecoLoading: 'Loading the openings…',
  ecoNoResults: 'No opening found.',
  ecoLines: (n) => `${n} ${n === 1 ? 'variation' : 'variations'}`,
  ecoChange: 'Change',
  ecoBranches: 'Every variation as a line',
  ecoBranchesHint:
    'Off: one move of yours per position (the one of the most general variation), the others stay accepted alternatives.',
  ecoOpponentEnds: 'Keep the variations ending with an opponent move',
  ecoOpponentEndsHint:
    'Many variations are named after the opponent’s move: if you keep them, you add your reply in Browse (Edit the lines). Off, that move is removed.',
  previewOpenEnds: (n) =>
    `${n} ${n === 1 ? 'line ends' : 'lines end'} with an opponent move: add your reply in Browse`,
  ecoCreate: 'Create the repertoire',
  ecoCredit: 'Openings and names: lichess-org/chess-openings (CC0).',
  personal: 'Personal',
  deleteRepertoire: 'Delete',
  confirmDelete: 'Confirm: delete the repertoire and its progress',
  scratchButton: 'Create from scratch',
  scratchTitle: 'Create a repertoire from scratch',
  scratchIntro:
    'Choose a name and a color: the repertoire starts empty and you build it move by move on the board, yours and your opponent’s.',
  scratchCreate: 'Create and start building',
  hideRepertoire: 'Remove from library',
  hiddenTitle: (n) =>
    `${n} ${n === 1 ? 'repertoire' : 'repertoires'} removed from the library`,
  showHidden: 'Show',
  restoreRepertoire: 'Put back in the library',
  cancelDelete: 'Cancel',
  noLinesYet: 'This repertoire has no lines yet.',
  addLines: 'Add them in Browse',
  names: {},
}

const fr: OpeningsTranslations = {
  navLabel: 'Ouvertures',
  title: 'Ouvertures',
  subtitle:
    'Entraînez vos répertoires une ligne à la fois, jusqu’à ce que les coups deviennent automatiques.',
  dashboardTitle: 'Ouvertures',
  dashboardSummary: (r, l) =>
    `${r} ${r === 1 ? 'répertoire' : 'répertoires'} · ${l} ${l === 1 ? 'ligne' : 'lignes'}`,
  dashboardReview: (name) => `Réviser ${name}`,
  dashboardLearn: (name) => `Étudier ${name}`,
  dashboardOpen: 'Toutes les ouvertures',
  dashboardEmpty:
    'Aucun répertoire dans votre bibliothèque : créez-en un ou remettez ceux du catalogue.',
  statsTab: 'Ouvertures',
  statsSubtitle:
    'Vos réponses sur les ouvertures dans S’entraîner et dans les Cycles : pour chaque coup compte le premier essai.',
  statsEmpty:
    'Aucun coup entraîné pour l’instant : commencez par Étudier ou S’entraîner dans un répertoire.',
  statsTiles: {
    firstTries: 'Coups entraînés',
    accuracy: 'Justes du premier coup',
    averageTime: 'Temps moyen de réponse',
    mastered: 'Coups maîtrisés',
    linesMastered: 'Lignes maîtrisées',
    cycles: 'Cycles terminés',
  },
  statsByRepertoire: 'Par répertoire',
  statsColumns: {
    repertoire: 'Répertoire',
    moves: 'Coups',
    mastered: 'Maîtrisés',
    due: 'À réviser',
    tries: 'Essais',
    accuracy: 'Premier essai',
    time: 'Temps moyen',
    cycles: 'Cycles',
  },
  statsHardest: 'Les coups les plus difficiles',
  statsHardestNote: (min) =>
    `Vos coups avec le plus d’erreurs au premier essai, parmi ceux entraînés au moins ${min} fois.`,
  statsHardestEmpty: (min) => `Aucun coup entraîné au moins ${min} fois pour l’instant.`,
  statsHardestLine: (accuracy, tries) =>
    `${accuracy} % au premier essai · ${tries} essais`,
  statsActivity: 'Activité des 30 derniers jours',
  statsActivityNote: (days, moves) =>
    `${days} ${days === 1 ? 'jour' : 'jours'} d’entraînement, ${moves} ${moves === 1 ? 'coup' : 'coups'}`,
  statsDay: (date, moves, correct) =>
    `${date} : ${moves} ${moves === 1 ? 'coup' : 'coups'}, ${correct} justes`,
  faqTitle: 'Ouvertures',
  faqItems: [
    {
      question: 'Comment fonctionne l’entraînement sur les ouvertures ?',
      answer:
        'Un répertoire est un arbre de coups : les vôtres et les réponses de l’adversaire. Vous l’entraînez une ligne à la fois, contre un adversaire qui répond tout seul.\n\nÉtudier vous montre les nouveaux coups avec une flèche. S’entraîner vous les demande sans aide, en partant des lignes à réviser et en répétant tout de suite celles ratées. Consulter montre l’arbre avec l’état de chaque coup, les noms des variantes, vos commentaires et l’analyse de Stockfish. Cycles vous fait jouer toutes les lignes d’affilée, chronométrées, comme la méthode Woodpecker.',
    },
    {
      question: 'Comment créer un répertoire ?',
      answer:
        'De cinq façons : utilisez un répertoire prêt à l’emploi, créez-le de zéro en jouant les coups sur l’échiquier, créez-le depuis un code ECO ou le nom d’une ouverture, importez un PGN (aussi une étude Lichess) ou copiez un répertoire existant pour le modifier.\n\nLes répertoires personnels se modifient dans Consulter avec « Modifier les lignes » : ajoutez ou retirez des coups, les vôtres et ceux de l’adversaire, et renommez le répertoire avec le crayon à côté de son nom.',
    },
    {
      question: 'Quand un coup est-il maîtrisé ?',
      answer:
        'Après trois bonnes réponses d’affilée au premier essai. Chaque coup revient en révision à des intervalles croissants : 4 heures, puis 1, 3, 7, 21 et 60 jours. Une erreur le remet au début.\n\nLes coups maîtrisés au début d’une ligne peuvent être joués pour vous (« Passer les coups déjà connus »), pour vous entraîner là où c’est utile.',
    },
    {
      question: 'Que sont les alternatives acceptées ?',
      answer:
        'De bons coups que vous ne voulez pas entraîner : les jouer n’est pas une erreur, mais ensuite le coup de la ligne vous est demandé. Un autre de vos coups dans la même position peut aussi ouvrir une nouvelle ligne, avec sa suite : vous choisissez dans Consulter.',
    },
    {
      question: 'D’où viennent les noms des ouvertures ?',
      answer:
        'Du jeu de données public des ouvertures de Lichess (codes ECO et noms des variantes, dans le domaine public). Le même jeu de données sert à créer un répertoire depuis l’ECO.',
    },
  ],
  creditsTitle: 'Ouvertures',
  creditsBody:
    'Les noms des ouvertures, les codes ECO et les lignes pour créer un répertoire depuis l’ECO viennent du jeu de données lichess-org/chess-openings, dans le domaine public (CC0). Chess Hammer n’est pas affilié à Lichess.',
  empty: 'Aucun répertoire disponible.',
  notFound: 'Répertoire introuvable.',
  back: 'Toutes les ouvertures',
  color: { w: 'Avec les Blancs', b: 'Avec les Noirs' },
  runs: (n) => `${n} ${n === 1 ? 'ligne' : 'lignes'}`,
  mastered: (m, total) => `${m}/${total} coups maîtrisés`,
  due: (n) => `${n} à revoir`,
  newMoves: (n) => `${n} ${n === 1 ? 'nouveau' : 'nouveaux'}`,
  runsMastered: (m, total) => `${m}/${total} lignes maîtrisées`,
  train: 'S’entraîner',
  yourMove: 'À vous de jouer',
  opponentMoving: 'L’adversaire répond…',
  correct: 'Correct',
  wrong: (san) => `Le coup du répertoire est ${san} : jouez-le pour continuer.`,
  runDone: 'Ligne terminée',
  runResult: (ok, total) => `${ok} sur ${total} du premier coup`,
  nextRun: 'Ligne suivante',
  repeatRun: 'Refaire cette ligne',
  movesTitle: 'Coups de la ligne',
  progressTitle: 'Progrès',
  saveError: 'Le coup n’a pas été enregistré : vérifiez la connexion.',
  browse: 'Consulter',
  treeTitle: 'Arbre des variantes',
  linesTitle: 'Lignes',
  startPosition: 'Position initiale',
  legendTitle: 'Vos coups',
  legend: { new: 'Nouveau', learning: 'En cours', due: 'À revoir', mastered: 'Maîtrisé' },
  collapse: 'Replier la branche',
  expand: 'Déplier la branche',
  expandAll: 'Tout déplier',
  collapseAll: 'Tout replier',
  opponentMove: 'Coup de l’adversaire',
  neverPlayed: 'Pas encore entraîné',
  moveStats: (attempts, pct) =>
    `${attempts} ${attempts === 1 ? 'essai' : 'essais'} · ${pct} % du premier coup`,
  nextReview: (date) => `Prochaine révision : ${date}`,
  dueNow: 'À revoir maintenant',
  trainLine: 'Entraîner cette ligne',
  showNames: 'Noms des variantes',
  showComments: 'Commentaires',
  commentTitle: (move) => `Commentaire sur ${move}`,
  commentPlaceholder: 'Écrivez un commentaire sur ce coup…',
  commentHint: 'Clic droit (ou appui long) sur un coup pour le commenter.',
  saveComment: 'Enregistrer',
  deleteComment: 'Supprimer le commentaire',
  cancel: 'Annuler',
  editLines: 'Modifier les lignes',
  doneEditing: 'Terminer',
  editHint:
    'Jouez un coup sur l’échiquier pour l’ajouter après le coup sélectionné (ou au début, si aucun n’est sélectionné) : les vôtres et ceux de l’adversaire, pour prolonger une ligne ou en ouvrir une nouvelle.',
  deleteMove: 'Supprimer le coup et la suite',
  confirmDeleteMove: 'Confirmer : supprimer',
  alternativeNoContinuation:
    'Aucun coup ne peut suivre une alternative : faites-en une ligne pour continuer.',
  makeAlternative: 'En faire une alternative acceptée',
  makeLine: 'En faire une ligne',
  endsWithOpponent:
    'La ligne se termine par un coup de l’adversaire : ajoutez votre réponse.',
  copyToEdit: 'Créer une copie personnelle pour la modifier',
  copyName: (name) => `${name} (à moi)`,
  rename: 'Renommer le répertoire',
  renameSave: 'Enregistrer',
  editError: 'Modification échouée',
  learn: 'Apprendre',
  learnLine: 'Apprendre cette ligne',
  learnIntro:
    'Suivez la flèche et jouez les nouveaux coups : vous les réviserez à l’entraînement.',
  playMove: (move) => `Jouez ${move}`,
  followArrow: (move) => `Pas celui-ci : suivez la flèche et jouez ${move}.`,
  playForMe: 'Jouer le coup',
  lineLearned: 'Ligne apprise : ses coups reviendront à réviser à l’entraînement.',
  learnNext: 'Apprendre la ligne suivante',
  repeatLearn: 'Revoir cette ligne',
  allLearned:
    'Vous avez appris toutes les lignes de ce répertoire : entraînez-les maintenant.',
  allLearnedReview: 'Vous avez appris toutes les lignes : vous les révisez.',
  lineOf: (n, total) => `Ligne ${n} sur ${total}`,
  toLearn: (n) => (n === 0 ? 'toutes apprises' : `${n} à apprendre`),
  alternativeLabel: 'Alternative acceptée',
  alternativePlayed: (played, main) =>
    `${played} est un bon coup, mais dans cette ligne on entraîne ${main}.`,
  fastForward: 'Passer les coups déjà connus',
  sessionLine: (n, total) => `Ligne ${n} sur ${total}`,
  repeatPhase: (n, total) => `Révision des erreurs : ${n} sur ${total}`,
  continueRepeat: 'Revoir les erreurs',
  showSummary: 'Voir le bilan',
  sessionDone: 'Session terminée',
  sessionSummary: (lines, ok, total) =>
    `${lines} ${lines === 1 ? 'ligne' : 'lignes'} · ${ok} sur ${total} du premier coup`,
  repeatedLines: (n) =>
    n === 0
      ? 'Aucune erreur à revoir.'
      : `${n} ${n === 1 ? 'ligne revue' : 'lignes revues'} à la fin.`,
  newSession: 'Nouvelle session',
  cycles: 'Cycles',
  cyclesTitle: 'Cycles Woodpecker',
  cyclesIntro:
    'Toutes les lignes du répertoire à la suite, chronométrées. Répétez le cycle pour le terminer chaque fois plus vite, sans perdre en précision.',
  startCycle: (n) => `Commencer le cycle ${n}`,
  cycleProgress: (cycle, line, total) => `Cycle ${cycle} · ligne ${line} sur ${total}`,
  previousCycle: (time) => `Cycle précédent : ${time}`,
  cycleDone: (n) => `Cycle ${n} terminé`,
  cycleResult: (time, ok, total) => `${time} · ${ok} sur ${total} du premier coup`,
  faster: (delta) => `${delta} plus rapide que le cycle précédent`,
  slower: (delta) => `${delta} plus lent que le cycle précédent`,
  noCycles: 'Aucun cycle terminé.',
  cycleColumns: { cycle: 'Cycle', date: 'Date', time: 'Temps', accuracy: 'Précision' },
  importPgn: 'Importer un PGN',
  importTitle: 'Importer un répertoire',
  importIntro:
    'Collez un PGN ou chargez un fichier .pgn : variantes et chapitres (par exemple d’une étude Lichess) deviennent les lignes de votre répertoire.',
  pgnLabel: 'PGN',
  pgnPlaceholder: '1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 *',
  fileLabel: 'Charger un fichier .pgn',
  nameLabel: 'Nom',
  colorLabel: 'Vous jouez',
  previewTitle: 'Aperçu',
  previewLines: (lines, moves) =>
    `${lines} ${lines === 1 ? 'ligne' : 'lignes'}, ${moves} coups`,
  previewAlternatives: (n) =>
    `${n} ${n === 1 ? 'coup' : 'coups'} de votre part dans une position où vous en aviez déjà un : ${n === 1 ? 'gardé' : 'gardés'} comme alternative acceptée, sans suite`,
  previewTrimmed: (n) =>
    `${n} ${n === 1 ? 'ligne finissait' : 'lignes finissaient'} par un coup de l’adversaire : retiré`,
  previewSkipped: (n) =>
    `${n} ${n === 1 ? 'partie ne part pas' : 'parties ne partent pas'} de la position initiale : ${n === 1 ? 'ignorée' : 'ignorées'}`,
  previewEmpty: 'Aucun coup trouvé.',
  illegalMove: (line, move) =>
    `Ligne ${line} : ${move} n’est pas un coup légal. Vérifiez le PGN.`,
  previewTooBig: (max) => `Trop de coups : un répertoire importé en a au maximum ${max}.`,
  importButton: 'Importer',
  importError: 'Import échoué',
  ecoButton: 'Créer depuis l’ECO',
  ecoTitle: 'Créer un répertoire depuis l’ECO',
  ecoIntro:
    'Cherchez un code ECO (ex. C50, ou C5 pour C50-C59) ou le nom d’une ouverture : ses variantes nommées deviennent les lignes d’un répertoire personnel, à modifier comme vous voulez.',
  ecoSearchLabel: 'Code ECO ou ouverture',
  ecoSearchPlaceholder: 'C50, Italian, Caro-Kann…',
  ecoLoading: 'Chargement des ouvertures…',
  ecoNoResults: 'Aucune ouverture trouvée.',
  ecoLines: (n) => `${n} ${n === 1 ? 'variante' : 'variantes'}`,
  ecoChange: 'Changer',
  ecoBranches: 'Toutes les variantes comme lignes',
  ecoBranchesHint:
    'Désactivé : un seul de vos coups par position (celui de la variante la plus générale), les autres restent des alternatives acceptées.',
  ecoOpponentEnds: 'Garder les variantes qui finissent par un coup adverse',
  ecoOpponentEndsHint:
    'Beaucoup de variantes portent le nom du coup adverse : en les gardant, vous ajoutez votre réponse dans Consulter (Modifier les lignes). Désactivé, ce coup est retiré.',
  previewOpenEnds: (n) =>
    `${n} ${n === 1 ? 'ligne finit' : 'lignes finissent'} par un coup adverse : ajoutez votre réponse dans Consulter`,
  ecoCreate: 'Créer le répertoire',
  ecoCredit: 'Ouvertures et noms : lichess-org/chess-openings (CC0).',
  personal: 'Personnel',
  deleteRepertoire: 'Supprimer',
  confirmDelete: 'Confirmer : supprimer le répertoire et ses progrès',
  scratchButton: 'Créer de zéro',
  scratchTitle: 'Créer un répertoire de zéro',
  scratchIntro:
    'Choisissez un nom et une couleur : le répertoire part vide et vous le construisez coup par coup sur l’échiquier, les vôtres et ceux de l’adversaire.',
  scratchCreate: 'Créer et commencer',
  hideRepertoire: 'Retirer de la bibliothèque',
  hiddenTitle: (n) =>
    `${n} ${n === 1 ? 'répertoire retiré' : 'répertoires retirés'} de la bibliothèque`,
  showHidden: 'Afficher',
  restoreRepertoire: 'Remettre dans la bibliothèque',
  cancelDelete: 'Annuler',
  noLinesYet: 'Ce répertoire n’a pas encore de lignes.',
  addLines: 'Ajoutez-les dans Consulter',
  names: {
    'italian-game': 'Partie italienne',
    'queens-gambit': 'Gambit dame',
    'caro-kann': 'Défense Caro-Kann',
  },
}

const es: OpeningsTranslations = {
  navLabel: 'Aperturas',
  title: 'Aperturas',
  subtitle: 'Entrena tus repertorios línea a línea, hasta que las jugadas salgan solas.',
  dashboardTitle: 'Aperturas',
  dashboardSummary: (r, l) =>
    `${r} ${r === 1 ? 'repertorio' : 'repertorios'} · ${l} ${l === 1 ? 'línea' : 'líneas'}`,
  dashboardReview: (name) => `Repasar ${name}`,
  dashboardLearn: (name) => `Estudiar ${name}`,
  dashboardOpen: 'Todas las aperturas',
  dashboardEmpty:
    'No hay repertorios en tu biblioteca: crea uno o vuelve a poner los del catálogo.',
  statsTab: 'Aperturas',
  statsSubtitle:
    'Tus respuestas en las aperturas en Entrenar y en los Ciclos: para cada jugada cuenta el primer intento.',
  statsEmpty:
    'Todavía no has entrenado ninguna jugada: empieza por Estudiar o Entrenar en un repertorio.',
  statsTiles: {
    firstTries: 'Jugadas entrenadas',
    accuracy: 'Acertadas a la primera',
    averageTime: 'Tiempo medio de respuesta',
    mastered: 'Jugadas dominadas',
    linesMastered: 'Líneas dominadas',
    cycles: 'Ciclos completados',
  },
  statsByRepertoire: 'Por repertorio',
  statsColumns: {
    repertoire: 'Repertorio',
    moves: 'Jugadas',
    mastered: 'Dominadas',
    due: 'Por repasar',
    tries: 'Intentos',
    accuracy: 'A la primera',
    time: 'Tiempo medio',
    cycles: 'Ciclos',
  },
  statsHardest: 'Las jugadas más difíciles',
  statsHardestNote: (min) =>
    `Tus jugadas con más errores en el primer intento, entre las entrenadas al menos ${min} veces.`,
  statsHardestEmpty: (min) => `Todavía ninguna jugada entrenada al menos ${min} veces.`,
  statsHardestLine: (accuracy, tries) => `${accuracy} % a la primera · ${tries} intentos`,
  statsActivity: 'Actividad en los últimos 30 días',
  statsActivityNote: (days, moves) =>
    `${days} ${days === 1 ? 'día' : 'días'} de entrenamiento, ${moves} ${moves === 1 ? 'jugada' : 'jugadas'}`,
  statsDay: (date, moves, correct) =>
    `${date}: ${moves} ${moves === 1 ? 'jugada' : 'jugadas'}, ${correct} acertadas`,
  faqTitle: 'Aperturas',
  faqItems: [
    {
      question: '¿Cómo funciona el entrenamiento de aperturas?',
      answer:
        'Un repertorio es un árbol de jugadas: las tuyas y las respuestas del rival. Lo entrenas línea a línea, contra un rival que responde solo.\n\nEstudiar te muestra las jugadas nuevas con una flecha. Entrenar te las pide sin ayuda, empezando por las líneas por repasar y repitiendo enseguida las falladas. Consultar muestra el árbol con el estado de cada jugada, los nombres de las variantes, tus comentarios y el análisis de Stockfish. Ciclos te hace jugar todas las líneas seguidas, con reloj, como el método Woodpecker.',
    },
    {
      question: '¿Cómo creo un repertorio?',
      answer:
        'De cinco maneras: usas uno ya preparado, lo creas desde cero jugando las jugadas en el tablero, lo creas desde un código ECO o el nombre de una apertura, importas un PGN (también un estudio de Lichess) o copias un repertorio existente para editarlo.\n\nLos repertorios personales se editan en Consultar con «Editar las líneas»: añades o quitas jugadas, tuyas y del rival, y cambias el nombre con el lápiz junto al nombre.',
    },
    {
      question: '¿Cuándo se domina una jugada?',
      answer:
        'Tras tres respuestas correctas seguidas al primer intento. Cada jugada vuelve a repaso a intervalos crecientes: 4 horas, luego 1, 3, 7, 21 y 60 días. Un error la devuelve al principio.\n\nLas jugadas dominadas al inicio de una línea se pueden jugar solas («Saltar las jugadas ya conocidas»), así entrenas donde hace falta.',
    },
    {
      question: '¿Qué son las alternativas aceptadas?',
      answer:
        'Buenas jugadas que no quieres entrenar: jugarlas no es un error, pero luego se te pide la jugada de la línea. Otra jugada tuya en la misma posición también puede abrir una línea nueva, con su continuación: lo eliges en Consultar.',
    },
    {
      question: '¿De dónde vienen los nombres de las aperturas?',
      answer:
        'Del conjunto de datos público de aperturas de Lichess (códigos ECO y nombres de las variantes, de dominio público). El mismo conjunto sirve para crear un repertorio desde ECO.',
    },
  ],
  creditsTitle: 'Aperturas',
  creditsBody:
    'Los nombres de las aperturas, los códigos ECO y las líneas para crear un repertorio desde ECO vienen del conjunto de datos lichess-org/chess-openings, de dominio público (CC0). Chess Hammer no está afiliado a Lichess.',
  empty: 'No hay repertorios disponibles.',
  notFound: 'Repertorio no encontrado.',
  back: 'Todas las aperturas',
  color: { w: 'Con blancas', b: 'Con negras' },
  runs: (n) => `${n} ${n === 1 ? 'línea' : 'líneas'}`,
  mastered: (m, total) => `${m}/${total} jugadas dominadas`,
  due: (n) => `${n} para repasar`,
  newMoves: (n) => `${n} ${n === 1 ? 'nueva' : 'nuevas'}`,
  runsMastered: (m, total) => `${m}/${total} líneas dominadas`,
  train: 'Entrenar',
  yourMove: 'Te toca',
  opponentMoving: 'El rival responde…',
  correct: 'Correcto',
  wrong: (san) => `La jugada del repertorio es ${san}: juégala para continuar.`,
  runDone: 'Línea completada',
  runResult: (ok, total) => `${ok} de ${total} a la primera`,
  nextRun: 'Siguiente línea',
  repeatRun: 'Repetir esta línea',
  movesTitle: 'Jugadas de la línea',
  progressTitle: 'Progreso',
  saveError: 'La jugada no se ha guardado: comprueba la conexión.',
  browse: 'Consultar',
  treeTitle: 'Árbol de variantes',
  linesTitle: 'Líneas',
  startPosition: 'Posición inicial',
  legendTitle: 'Tus jugadas',
  legend: {
    new: 'Nueva',
    learning: 'Aprendiendo',
    due: 'Para repasar',
    mastered: 'Dominada',
  },
  collapse: 'Contraer la rama',
  expand: 'Expandir la rama',
  expandAll: 'Expandir todo',
  collapseAll: 'Contraer todo',
  opponentMove: 'Jugada del rival',
  neverPlayed: 'Aún sin entrenar',
  moveStats: (attempts, pct) =>
    `${attempts} ${attempts === 1 ? 'intento' : 'intentos'} · ${pct} % a la primera`,
  nextReview: (date) => `Próximo repaso: ${date}`,
  dueNow: 'Para repasar ahora',
  trainLine: 'Entrenar esta línea',
  showNames: 'Nombres de las variantes',
  showComments: 'Comentarios',
  commentTitle: (move) => `Comentario sobre ${move}`,
  commentPlaceholder: 'Escribe un comentario sobre esta jugada…',
  commentHint: 'Clic derecho (o pulsación larga) en una jugada para comentarla.',
  saveComment: 'Guardar',
  deleteComment: 'Eliminar el comentario',
  cancel: 'Cancelar',
  editLines: 'Editar las líneas',
  doneEditing: 'Terminar',
  editHint:
    'Juega una jugada en el tablero para añadirla tras la seleccionada (o al principio, si no hay ninguna seleccionada): las tuyas y las del rival, para alargar una línea o abrir una nueva.',
  deleteMove: 'Eliminar la jugada y lo que sigue',
  confirmDeleteMove: 'Confirmar: eliminar',
  alternativeNoContinuation:
    'Tras una alternativa no se añaden jugadas: conviértela en una línea para continuar.',
  makeAlternative: 'Convertir en alternativa aceptada',
  makeLine: 'Convertir en una línea',
  endsWithOpponent: 'La línea termina con una jugada del rival: añade tu respuesta.',
  copyToEdit: 'Crear una copia personal para editarla',
  copyName: (name) => `${name} (mía)`,
  rename: 'Renombrar el repertorio',
  renameSave: 'Guardar',
  editError: 'Edición fallida',
  learn: 'Aprender',
  learnLine: 'Aprender esta línea',
  learnIntro:
    'Sigue la flecha y juega las jugadas nuevas: luego las repasarás en el entrenamiento.',
  playMove: (move) => `Juega ${move}`,
  followArrow: (move) => `Esa no: sigue la flecha y juega ${move}.`,
  playForMe: 'Jugar la jugada',
  lineLearned: 'Línea aprendida: sus jugadas volverán para repasar en el entrenamiento.',
  learnNext: 'Aprender la siguiente línea',
  repeatLearn: 'Repasar esta línea',
  allLearned: 'Ya has aprendido todas las líneas de este repertorio: ahora entrénalas.',
  allLearnedReview: 'Ya has aprendido todas las líneas: las estás repasando.',
  lineOf: (n, total) => `Línea ${n} de ${total}`,
  toLearn: (n) => (n === 0 ? 'todas aprendidas' : `${n} por aprender`),
  alternativeLabel: 'Alternativa aceptada',
  alternativePlayed: (played, main) =>
    `${played} es una buena jugada, pero en esta línea entrenamos ${main}.`,
  fastForward: 'Saltar las jugadas ya conocidas',
  sessionLine: (n, total) => `Línea ${n} de ${total}`,
  repeatPhase: (n, total) => `Repaso de errores: ${n} de ${total}`,
  continueRepeat: 'Repasar los errores',
  showSummary: 'Ver el resumen',
  sessionDone: 'Sesión completada',
  sessionSummary: (lines, ok, total) =>
    `${lines} ${lines === 1 ? 'línea' : 'líneas'} · ${ok} de ${total} a la primera`,
  repeatedLines: (n) =>
    n === 0
      ? 'Ningún error que repasar.'
      : `${n} ${n === 1 ? 'línea repasada' : 'líneas repasadas'} al final.`,
  newSession: 'Nueva sesión',
  cycles: 'Ciclos',
  cyclesTitle: 'Ciclos Woodpecker',
  cyclesIntro:
    'Todas las líneas del repertorio seguidas, con cronómetro. Repite el ciclo para terminarlo cada vez más rápido, sin perder precisión.',
  startCycle: (n) => `Empezar el ciclo ${n}`,
  cycleProgress: (cycle, line, total) => `Ciclo ${cycle} · línea ${line} de ${total}`,
  previousCycle: (time) => `Ciclo anterior: ${time}`,
  cycleDone: (n) => `Ciclo ${n} completado`,
  cycleResult: (time, ok, total) => `${time} · ${ok} de ${total} a la primera`,
  faster: (delta) => `${delta} más rápido que el ciclo anterior`,
  slower: (delta) => `${delta} más lento que el ciclo anterior`,
  noCycles: 'Ningún ciclo completado.',
  cycleColumns: { cycle: 'Ciclo', date: 'Fecha', time: 'Tiempo', accuracy: 'Precisión' },
  importPgn: 'Importar un PGN',
  importTitle: 'Importar un repertorio',
  importIntro:
    'Pega un PGN o sube un archivo .pgn: variantes y capítulos (por ejemplo de un estudio de Lichess) se convierten en las líneas de tu repertorio.',
  pgnLabel: 'PGN',
  pgnPlaceholder: '1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 *',
  fileLabel: 'Subir un archivo .pgn',
  nameLabel: 'Nombre',
  colorLabel: 'Juegas',
  previewTitle: 'Vista previa',
  previewLines: (lines, moves) =>
    `${lines} ${lines === 1 ? 'línea' : 'líneas'}, ${moves} jugadas`,
  previewAlternatives: (n) =>
    `${n} ${n === 1 ? 'jugada tuya' : 'jugadas tuyas'} en una posición donde ya tenías una: ${n === 1 ? 'guardada' : 'guardadas'} como alternativa aceptada, sin continuación`,
  previewTrimmed: (n) =>
    `${n} ${n === 1 ? 'línea terminaba' : 'líneas terminaban'} con una jugada del rival: quitada`,
  previewSkipped: (n) =>
    `${n} ${n === 1 ? 'partida no empieza' : 'partidas no empiezan'} desde la posición inicial: ${n === 1 ? 'omitida' : 'omitidas'}`,
  previewEmpty: 'No se han encontrado jugadas.',
  illegalMove: (line, move) =>
    `Línea ${line}: ${move} no es una jugada legal. Revisa el PGN.`,
  previewTooBig: (max) =>
    `Demasiadas jugadas: un repertorio importado tiene como máximo ${max}.`,
  importButton: 'Importar',
  importError: 'Importación fallida',
  ecoButton: 'Crear desde ECO',
  ecoTitle: 'Crear un repertorio desde ECO',
  ecoIntro:
    'Busca un código ECO (p. ej. C50, o C5 para C50-C59) o el nombre de una apertura: sus variantes con nombre se convierten en las líneas de un repertorio personal, que puedes editar como quieras.',
  ecoSearchLabel: 'Código ECO o apertura',
  ecoSearchPlaceholder: 'C50, Italian, Caro-Kann…',
  ecoLoading: 'Cargando las aperturas…',
  ecoNoResults: 'No se encontró ninguna apertura.',
  ecoLines: (n) => `${n} ${n === 1 ? 'variante' : 'variantes'}`,
  ecoChange: 'Cambiar',
  ecoBranches: 'Todas las variantes como líneas',
  ecoBranchesHint:
    'Desactivado: una sola jugada tuya por posición (la de la variante más general), las demás quedan como alternativas aceptadas.',
  ecoOpponentEnds: 'Mantener las variantes que terminan con una jugada del rival',
  ecoOpponentEndsHint:
    'Muchas variantes llevan el nombre de la jugada del rival: si las mantienes, añades tu respuesta en Consultar (Editar las líneas). Desactivado, esa jugada se quita.',
  previewOpenEnds: (n) =>
    `${n} ${n === 1 ? 'línea termina' : 'líneas terminan'} con una jugada del rival: añade tu respuesta en Consultar`,
  ecoCreate: 'Crear el repertorio',
  ecoCredit: 'Aperturas y nombres: lichess-org/chess-openings (CC0).',
  personal: 'Personal',
  deleteRepertoire: 'Eliminar',
  confirmDelete: 'Confirmar: eliminar el repertorio y su progreso',
  scratchButton: 'Crear desde cero',
  scratchTitle: 'Crear un repertorio desde cero',
  scratchIntro:
    'Elige nombre y color: el repertorio empieza vacío y lo construyes jugada a jugada en el tablero, las tuyas y las del rival.',
  scratchCreate: 'Crear y empezar',
  hideRepertoire: 'Quitar de la biblioteca',
  hiddenTitle: (n) =>
    `${n} ${n === 1 ? 'repertorio quitado' : 'repertorios quitados'} de la biblioteca`,
  showHidden: 'Mostrar',
  restoreRepertoire: 'Volver a la biblioteca',
  cancelDelete: 'Cancelar',
  noLinesYet: 'Este repertorio aún no tiene líneas.',
  addLines: 'Añádelas en Consultar',
  names: {
    'italian-game': 'Apertura italiana',
    'queens-gambit': 'Gambito de dama',
    'caro-kann': 'Defensa Caro-Kann',
  },
}

const de: OpeningsTranslations = {
  navLabel: 'Eröffnungen',
  title: 'Eröffnungen',
  subtitle:
    'Trainiere deine Repertoires Linie für Linie, bis die Züge von selbst kommen.',
  dashboardTitle: 'Eröffnungen',
  dashboardSummary: (r, l) =>
    `${r} ${r === 1 ? 'Repertoire' : 'Repertoires'} · ${l} ${l === 1 ? 'Linie' : 'Linien'}`,
  dashboardReview: (name) => `${name} wiederholen`,
  dashboardLearn: (name) => `${name} lernen`,
  dashboardOpen: 'Alle Eröffnungen',
  dashboardEmpty:
    'Kein Repertoire in deiner Bibliothek: Erstelle eines oder hole die aus dem Katalog zurück.',
  statsTab: 'Eröffnungen',
  statsSubtitle:
    'Deine Antworten bei den Eröffnungen in Trainieren und in den Zyklen: Für jeden Zug zählt der erste Versuch.',
  statsEmpty:
    'Noch kein Zug trainiert: Beginne mit Lernen oder Trainieren in einem Repertoire.',
  statsTiles: {
    firstTries: 'Trainierte Züge',
    accuracy: 'Beim ersten Versuch richtig',
    averageTime: 'Mittlere Antwortzeit',
    mastered: 'Beherrschte Züge',
    linesMastered: 'Beherrschte Linien',
    cycles: 'Abgeschlossene Zyklen',
  },
  statsByRepertoire: 'Nach Repertoire',
  statsColumns: {
    repertoire: 'Repertoire',
    moves: 'Züge',
    mastered: 'Beherrscht',
    due: 'Fällig',
    tries: 'Versuche',
    accuracy: 'Erster Versuch',
    time: 'Mittlere Zeit',
    cycles: 'Zyklen',
  },
  statsHardest: 'Die schwierigsten Züge',
  statsHardestNote: (min) =>
    `Deine Züge mit den meisten Fehlern beim ersten Versuch, unter denen, die mindestens ${min}-mal trainiert wurden.`,
  statsHardestEmpty: (min) => `Noch kein Zug mindestens ${min}-mal trainiert.`,
  statsHardestLine: (accuracy, tries) =>
    `${accuracy} % beim ersten Versuch · ${tries} Versuche`,
  statsActivity: 'Aktivität der letzten 30 Tage',
  statsActivityNote: (days, moves) =>
    `${days} ${days === 1 ? 'Trainingstag' : 'Trainingstage'}, ${moves} ${moves === 1 ? 'Zug' : 'Züge'}`,
  statsDay: (date, moves, correct) =>
    `${date}: ${moves} ${moves === 1 ? 'Zug' : 'Züge'}, ${correct} richtig`,
  faqTitle: 'Eröffnungen',
  faqItems: [
    {
      question: 'Wie funktioniert das Eröffnungstraining?',
      answer:
        'Ein Repertoire ist ein Baum aus Zügen: deinen und den Antworten des Gegners. Du trainierst es Linie für Linie gegen einen Gegner, der von selbst antwortet.\n\nLernen zeigt dir die neuen Züge mit einem Pfeil. Trainieren fragt sie ohne Hilfe ab, beginnend mit den fälligen Linien, und wiederholt die falschen sofort. Ansehen zeigt den Baum mit dem Stand jedes Zuges, den Variantennamen, deinen Kommentaren und der Stockfish-Analyse. Zyklen lässt dich alle Linien hintereinander auf Zeit spielen, wie bei der Woodpecker-Methode.',
    },
    {
      question: 'Wie erstelle ich ein Repertoire?',
      answer:
        'Auf fünf Arten: Du nutzt ein fertiges, erstellst es neu, indem du die Züge auf dem Brett spielst, erstellst es aus einem ECO-Code oder dem Namen einer Eröffnung, importierst ein PGN (auch eine Lichess-Studie) oder kopierst ein bestehendes Repertoire, um es zu bearbeiten.\n\nPersönliche Repertoires bearbeitest du unter Ansehen mit „Linien bearbeiten“: Züge hinzufügen oder entfernen, deine und die des Gegners, und das Repertoire mit dem Stift neben dem Namen umbenennen.',
    },
    {
      question: 'Wann ist ein Zug beherrscht?',
      answer:
        'Nach drei richtigen Antworten in Folge beim ersten Versuch. Jeder Zug kommt in wachsenden Abständen zur Wiederholung: 4 Stunden, dann 1, 3, 7, 21 und 60 Tage. Ein Fehler setzt ihn auf den Anfang zurück.\n\nDie beherrschten Züge am Anfang einer Linie können automatisch gespielt werden („Bekannte Züge überspringen“), damit du dort trainierst, wo es nötig ist.',
    },
    {
      question: 'Was sind akzeptierte Alternativen?',
      answer:
        'Gute Züge, die du nicht trainieren willst: Sie zu spielen ist kein Fehler, danach wird aber der Zug der Linie abgefragt. Ein anderer Zug von dir in derselben Stellung kann auch eine neue Linie mit eigener Fortsetzung eröffnen: Das entscheidest du unter Ansehen.',
    },
    {
      question: 'Woher kommen die Namen der Eröffnungen?',
      answer:
        'Aus dem öffentlichen Eröffnungs-Datensatz von Lichess (ECO-Codes und Variantennamen, gemeinfrei). Derselbe Datensatz dient zum Erstellen eines Repertoires aus ECO.',
    },
  ],
  creditsTitle: 'Eröffnungen',
  creditsBody:
    'Eröffnungsnamen, ECO-Codes und die Linien zum Erstellen eines Repertoires aus ECO stammen aus dem Datensatz lichess-org/chess-openings, gemeinfrei (CC0). Chess Hammer ist nicht mit Lichess verbunden.',
  empty: 'Kein Repertoire verfügbar.',
  notFound: 'Repertoire nicht gefunden.',
  back: 'Alle Eröffnungen',
  color: { w: 'Mit Weiß', b: 'Mit Schwarz' },
  runs: (n) => `${n} ${n === 1 ? 'Linie' : 'Linien'}`,
  mastered: (m, total) => `${m}/${total} Züge gefestigt`,
  due: (n) => `${n} fällig`,
  newMoves: (n) => `${n} neu`,
  runsMastered: (m, total) => `${m}/${total} Linien gefestigt`,
  train: 'Trainieren',
  yourMove: 'Du bist am Zug',
  opponentMoving: 'Der Gegner antwortet…',
  correct: 'Richtig',
  wrong: (san) => `Der Repertoire-Zug ist ${san}: spiele ihn, um weiterzumachen.`,
  runDone: 'Linie abgeschlossen',
  runResult: (ok, total) => `${ok} von ${total} im ersten Versuch`,
  nextRun: 'Nächste Linie',
  repeatRun: 'Diese Linie wiederholen',
  movesTitle: 'Züge der Linie',
  progressTitle: 'Fortschritt',
  saveError: 'Der Zug wurde nicht gespeichert: prüfe die Verbindung.',
  browse: 'Ansehen',
  treeTitle: 'Variantenbaum',
  linesTitle: 'Linien',
  startPosition: 'Ausgangsstellung',
  legendTitle: 'Deine Züge',
  legend: { new: 'Neu', learning: 'Im Lernen', due: 'Fällig', mastered: 'Gefestigt' },
  collapse: 'Zweig einklappen',
  expand: 'Zweig ausklappen',
  expandAll: 'Alle ausklappen',
  collapseAll: 'Alle einklappen',
  opponentMove: 'Zug des Gegners',
  neverPlayed: 'Noch nicht trainiert',
  moveStats: (attempts, pct) =>
    `${attempts} ${attempts === 1 ? 'Versuch' : 'Versuche'} · ${pct} % im ersten Versuch`,
  nextReview: (date) => `Nächste Wiederholung: ${date}`,
  dueNow: 'Jetzt fällig',
  trainLine: 'Diese Linie trainieren',
  showNames: 'Namen der Varianten',
  showComments: 'Kommentare',
  commentTitle: (move) => `Kommentar zu ${move}`,
  commentPlaceholder: 'Schreibe einen Kommentar zu diesem Zug…',
  commentHint: 'Rechtsklick (oder langes Tippen) auf einen Zug, um ihn zu kommentieren.',
  saveComment: 'Speichern',
  deleteComment: 'Kommentar löschen',
  cancel: 'Abbrechen',
  editLines: 'Linien bearbeiten',
  doneEditing: 'Fertig',
  editHint:
    'Spiele einen Zug auf dem Brett, um ihn nach dem ausgewählten hinzuzufügen (oder am Anfang, wenn keiner ausgewählt ist): deine und die des Gegners, um eine Linie zu verlängern oder eine neue zu beginnen.',
  deleteMove: 'Zug und Fortsetzung löschen',
  confirmDeleteMove: 'Bestätigen: löschen',
  alternativeNoContinuation:
    'Nach einer Alternative folgen keine Züge: Mach sie zu einer Linie, um fortzufahren.',
  makeAlternative: 'Zur akzeptierten Alternative machen',
  makeLine: 'Zu einer Linie machen',
  endsWithOpponent:
    'Die Linie endet mit einem Zug des Gegners: Füge deine Antwort hinzu.',
  copyToEdit: 'Persönliche Kopie zum Bearbeiten erstellen',
  copyName: (name) => `${name} (meine)`,
  rename: 'Repertoire umbenennen',
  renameSave: 'Speichern',
  editError: 'Bearbeitung fehlgeschlagen',
  learn: 'Lernen',
  learnLine: 'Diese Linie lernen',
  learnIntro:
    'Folge dem Pfeil und spiele die neuen Züge: Du wiederholst sie danach im Training.',
  playMove: (move) => `Spiele ${move}`,
  followArrow: (move) => `Nicht dieser: Folge dem Pfeil und spiele ${move}.`,
  playForMe: 'Zug spielen',
  lineLearned: 'Linie gelernt: Ihre Züge kommen im Training zur Wiederholung.',
  learnNext: 'Nächste Linie lernen',
  repeatLearn: 'Diese Linie noch einmal ansehen',
  allLearned: 'Du hast alle Linien dieses Repertoires gelernt: Trainiere sie jetzt.',
  allLearnedReview: 'Du hast alle Linien gelernt: Du wiederholst sie.',
  lineOf: (n, total) => `Linie ${n} von ${total}`,
  toLearn: (n) => (n === 0 ? 'alle gelernt' : `${n} zu lernen`),
  alternativeLabel: 'Akzeptierte Alternative',
  alternativePlayed: (played, main) =>
    `${played} ist ein guter Zug, aber in dieser Linie trainieren wir ${main}.`,
  fastForward: 'Bekannte Züge überspringen',
  sessionLine: (n, total) => `Linie ${n} von ${total}`,
  repeatPhase: (n, total) => `Fehler wiederholen: ${n} von ${total}`,
  continueRepeat: 'Fehler wiederholen',
  showSummary: 'Zur Zusammenfassung',
  sessionDone: 'Sitzung abgeschlossen',
  sessionSummary: (lines, ok, total) =>
    `${lines} ${lines === 1 ? 'Linie' : 'Linien'} · ${ok} von ${total} im ersten Versuch`,
  repeatedLines: (n) =>
    n === 0
      ? 'Keine Fehler zu wiederholen.'
      : `${n} ${n === 1 ? 'Linie' : 'Linien'} am Ende wiederholt.`,
  newSession: 'Neue Sitzung',
  cycles: 'Zyklen',
  cyclesTitle: 'Woodpecker-Zyklen',
  cyclesIntro:
    'Alle Linien des Repertoires am Stück, auf Zeit. Wiederhole den Zyklus, um ihn jedes Mal schneller zu schaffen, ohne an Genauigkeit zu verlieren.',
  startCycle: (n) => `Zyklus ${n} starten`,
  cycleProgress: (cycle, line, total) => `Zyklus ${cycle} · Linie ${line} von ${total}`,
  previousCycle: (time) => `Vorheriger Zyklus: ${time}`,
  cycleDone: (n) => `Zyklus ${n} abgeschlossen`,
  cycleResult: (time, ok, total) => `${time} · ${ok} von ${total} im ersten Versuch`,
  faster: (delta) => `${delta} schneller als der vorherige Zyklus`,
  slower: (delta) => `${delta} langsamer als der vorherige Zyklus`,
  noCycles: 'Noch kein Zyklus abgeschlossen.',
  cycleColumns: { cycle: 'Zyklus', date: 'Datum', time: 'Zeit', accuracy: 'Genauigkeit' },
  importPgn: 'PGN importieren',
  importTitle: 'Repertoire importieren',
  importIntro:
    'Füge ein PGN ein oder lade eine .pgn-Datei hoch: Varianten und Kapitel (zum Beispiel einer Lichess-Studie) werden zu den Linien deines Repertoires.',
  pgnLabel: 'PGN',
  pgnPlaceholder: '1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 *',
  fileLabel: '.pgn-Datei hochladen',
  nameLabel: 'Name',
  colorLabel: 'Du spielst',
  previewTitle: 'Vorschau',
  previewLines: (lines, moves) =>
    `${lines} ${lines === 1 ? 'Linie' : 'Linien'}, ${moves} Züge`,
  previewAlternatives: (n) =>
    `${n} ${n === 1 ? 'Zug' : 'Züge'} von dir in einer Stellung, in der du schon einen hattest: als akzeptierte ${n === 1 ? 'Alternative' : 'Alternativen'} behalten, ohne Fortsetzung`,
  previewTrimmed: (n) =>
    `${n} ${n === 1 ? 'Linie endete' : 'Linien endeten'} mit einem Zug des Gegners: entfernt`,
  previewSkipped: (n) =>
    `${n} ${n === 1 ? 'Partie beginnt' : 'Partien beginnen'} nicht in der Ausgangsstellung: übersprungen`,
  previewEmpty: 'Keine Züge gefunden.',
  illegalMove: (line, move) =>
    `Linie ${line}: ${move} ist kein legaler Zug. Prüfe das PGN.`,
  previewTooBig: (max) =>
    `Zu viele Züge: ein importiertes Repertoire hat höchstens ${max}.`,
  importButton: 'Importieren',
  importError: 'Import fehlgeschlagen',
  ecoButton: 'Aus ECO erstellen',
  ecoTitle: 'Repertoire aus ECO erstellen',
  ecoIntro:
    'Suche einen ECO-Code (z. B. C50, oder C5 für C50-C59) oder den Namen einer Eröffnung: Ihre benannten Varianten werden zu den Linien eines persönlichen Repertoires, das du beliebig bearbeiten kannst.',
  ecoSearchLabel: 'ECO-Code oder Eröffnung',
  ecoSearchPlaceholder: 'C50, Italian, Caro-Kann…',
  ecoLoading: 'Eröffnungen werden geladen…',
  ecoNoResults: 'Keine Eröffnung gefunden.',
  ecoLines: (n) => `${n} ${n === 1 ? 'Variante' : 'Varianten'}`,
  ecoChange: 'Ändern',
  ecoBranches: 'Jede Variante als Linie',
  ecoBranchesHint:
    'Aus: ein Zug von dir pro Stellung (der der allgemeinsten Variante), die anderen bleiben akzeptierte Alternativen.',
  ecoOpponentEnds: 'Varianten behalten, die mit einem gegnerischen Zug enden',
  ecoOpponentEndsHint:
    'Viele Varianten sind nach dem Zug des Gegners benannt: Behältst du sie, fügst du deine Antwort unter Ansehen hinzu (Linien bearbeiten). Aus: Dieser Zug wird entfernt.',
  previewOpenEnds: (n) =>
    `${n} ${n === 1 ? 'Linie endet' : 'Linien enden'} mit einem gegnerischen Zug: Füge deine Antwort unter Ansehen hinzu`,
  ecoCreate: 'Repertoire erstellen',
  ecoCredit: 'Eröffnungen und Namen: lichess-org/chess-openings (CC0).',
  personal: 'Persönlich',
  deleteRepertoire: 'Löschen',
  confirmDelete: 'Bestätigen: Repertoire und Fortschritt löschen',
  scratchButton: 'Neu erstellen',
  scratchTitle: 'Repertoire neu erstellen',
  scratchIntro:
    'Wähle Name und Farbe: Das Repertoire beginnt leer und du baust es Zug für Zug auf dem Brett auf, deine und die des Gegners.',
  scratchCreate: 'Erstellen und loslegen',
  hideRepertoire: 'Aus der Bibliothek entfernen',
  hiddenTitle: (n) =>
    `${n} ${n === 1 ? 'Repertoire' : 'Repertoires'} aus der Bibliothek entfernt`,
  showHidden: 'Anzeigen',
  restoreRepertoire: 'Zurück in die Bibliothek',
  cancelDelete: 'Abbrechen',
  noLinesYet: 'Dieses Repertoire hat noch keine Linien.',
  addLines: 'Füge sie unter Ansehen hinzu',
  names: {
    'italian-game': 'Italienische Partie',
    'queens-gambit': 'Damengambit',
    'caro-kann': 'Caro-Kann-Verteidigung',
  },
}

export const openingsTranslations: Record<Language, OpeningsTranslations> = {
  it,
  en,
  fr,
  es,
  de,
}
