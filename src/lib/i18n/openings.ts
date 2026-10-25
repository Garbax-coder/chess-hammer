import { useLanguage } from '@/lib/language-context'
import type { Language } from '@/lib/i18n/translations'

// Testi dell'allenamento sulle aperture (branch feature/opening-training).
// Fuori da translations.ts finche' la funzionalita' e' in sviluppo: cosi' le
// modifiche ai file condivisi con la manutenzione restano minime.
export interface OpeningsTranslations {
  navLabel: string
  title: string
  subtitle: string
  draftBadge: string
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
  personal: string
  deleteRepertoire: string
  confirmDelete: string
  /** Nomi dei repertori di catalogo, per slug (altrimenti il nome inglese). */
  names: Record<string, string>
}

const it: OpeningsTranslations = {
  navLabel: 'Aperture',
  title: 'Aperture',
  subtitle:
    'Allena i tuoi repertori una linea alla volta, finché le mosse diventano automatiche.',
  draftBadge: 'Bozza',
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
  personal: 'Personale',
  deleteRepertoire: 'Elimina',
  confirmDelete: 'Conferma: elimina il repertorio e i suoi progressi',
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
  draftBadge: 'Draft',
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
  personal: 'Personal',
  deleteRepertoire: 'Delete',
  confirmDelete: 'Confirm: delete the repertoire and its progress',
  names: {},
}

const fr: OpeningsTranslations = {
  navLabel: 'Ouvertures',
  title: 'Ouvertures',
  subtitle:
    'Entraînez vos répertoires une ligne à la fois, jusqu’à ce que les coups deviennent automatiques.',
  draftBadge: 'Brouillon',
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
  personal: 'Personnel',
  deleteRepertoire: 'Supprimer',
  confirmDelete: 'Confirmer : supprimer le répertoire et ses progrès',
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
  draftBadge: 'Borrador',
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
  personal: 'Personal',
  deleteRepertoire: 'Eliminar',
  confirmDelete: 'Confirmar: eliminar el repertorio y su progreso',
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
  draftBadge: 'Entwurf',
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
  personal: 'Persönlich',
  deleteRepertoire: 'Löschen',
  confirmDelete: 'Bestätigen: Repertoire und Fortschritt löschen',
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

export function useOpeningsTranslations(): OpeningsTranslations {
  const { language } = useLanguage()
  return openingsTranslations[language] ?? en
}
