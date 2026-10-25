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
