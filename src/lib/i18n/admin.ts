import type { AdminMetric, AdminPeriod } from '@/lib/admin'
import { useLanguage } from '@/lib/language-context'

// Testi della dashboard di amministrazione. La usa solo chi gestisce il
// sito, quindi solo italiano e inglese (inglese per le altre lingue) e fuori
// dalle traduzioni dell'app, che restano complete nelle cinque lingue.
export interface AdminTranslations {
  navLabel: string
  title: string
  subtitle: string
  error: string
  periodLabel: string
  period: Record<AdminPeriod, string>
  totalLabel: string
  metrics: Record<AdminMetric, string>
  bucketTitle: (when: string, value: number) => string
  users: {
    title: string
    count: (n: number) => string
    search: string
    sortLabel: string
    sort: { created: string; last_sign_in: string }
    email: string
    registered: string
    lastLogin: string
    lastActivity: string
    elo: string
    sessions: string
    never: string
    unconfirmed: string
    admin: string
    activeRound: (round: number) => string
    open: string
    empty: string
  }
  user: {
    back: string
    readOnly: (email: string) => string
    notFound: string
    account: string
    providers: string
    confirmed: string
    preferences: string
    language: string
    boardTheme: string
    pieceSet: string
    appStyle: string
    autoAdvance: string
    practiceFilter: string
    practiceOnlyFailed: (scope: string) => string
    practiceAll: string
    practiceSaved: string
    legalVersion: string
    yes: string
    no: string
    none: string
    stats: string
    rating: (elo: number, rd: number) => string
    solvedFailed: (solved: number, failed: number) => string
    eloHistory: string
    eloEmpty: string
    sessions: string
    sessionsEmpty: string
    unnamedSession: (total: number) => string
    createdOn: (date: string) => string
    completedOn: (date: string) => string
    restingUntil: (date: string) => string
    roundProgress: (
      round: number,
      attempted: number,
      of: number,
      solved: number,
    ) => string
    showPuzzles: string
    hidePuzzles: string
    puzzle: string
    rating_: string
    round: (round: number) => string
    practice: string
    practiceSummary: (attempted: number, solved: number) => string
    practiceEmpty: string
    recentPractice: string
    when: string
    result: string
    time: string
    solved: string
    failed: string
    seconds: (s: number) => string
  }
}

const it: AdminTranslations = {
  navLabel: 'Admin',
  title: 'Amministrazione',
  subtitle: 'Andamento della piattaforma e utenti registrati.',
  error: 'Impossibile caricare i dati. Riprova tra poco.',
  periodLabel: 'Periodo dei grafici',
  period: { day: 'Ultime 24 ore', week: 'Ultimi 7 giorni', month: 'Ultimi 30 giorni' },
  totalLabel: 'Totale',
  metrics: {
    signups: 'Registrazioni',
    session_attempts: 'Tentativi sui puzzle delle sessioni',
    practice_attempts: 'Tentativi in pratica libera',
    rounds_completed: 'Giri di sessione conclusi',
    sessions_completed: 'Sessioni concluse',
  },
  bucketTitle: (when, value) => `${when}: ${value}`,
  users: {
    title: 'Utenti registrati',
    count: (n) => (n === 1 ? '1 utente' : `${n} utenti`),
    search: 'Cerca per email',
    sortLabel: 'Ordina per',
    sort: { created: 'Registrazione', last_sign_in: 'Ultimo login' },
    email: 'Email',
    registered: 'Registrato',
    lastLogin: 'Ultimo login',
    lastActivity: 'Ultima attività',
    elo: 'ELO',
    sessions: 'Sessioni',
    never: 'Mai',
    unconfirmed: 'Non confermato',
    admin: 'Admin',
    activeRound: (round) => `giro ${round} in corso`,
    open: 'Apri scheda',
    empty: 'Nessun utente corrisponde alla ricerca.',
  },
  user: {
    back: 'Torna all’amministrazione',
    readOnly: (email) => `Stai guardando l’account di ${email} in sola lettura.`,
    notFound: 'Utente non trovato.',
    account: 'Account',
    providers: 'Accesso con',
    confirmed: 'Email confermata',
    preferences: 'Preferenze',
    language: 'Lingua',
    boardTheme: 'Scacchiera',
    pieceSet: 'Pezzi',
    appStyle: 'Stile',
    autoAdvance: 'Avanzamento automatico',
    practiceFilter: 'Pratica libera',
    practiceOnlyFailed: (scope) => `solo i puzzle sbagliati (${scope})`,
    practiceAll: 'tutti i puzzle',
    practiceSaved: 'i puzzle problematici',
    legalVersion: 'Termini accettati',
    yes: 'Sì',
    no: 'No',
    none: '—',
    stats: 'Statistiche',
    rating: (elo, rd) => `ELO ${elo} (±${Math.round(rd)})`,
    solvedFailed: (solved, failed) => `${solved} risolti · ${failed} sbagliati`,
    eloHistory: 'Andamento ELO',
    eloEmpty: 'Nessun puzzle giocato.',
    sessions: 'Sessioni',
    sessionsEmpty: 'Nessuna sessione.',
    unnamedSession: (total) => `Sessione da ${total} puzzle`,
    createdOn: (date) => `creata il ${date}`,
    completedOn: (date) => `conclusa il ${date}`,
    restingUntil: (date) => `in pausa fino al ${date}`,
    roundProgress: (round, attempted, of, solved) =>
      `Giro ${round}: ${attempted}/${of} · ${solved} risolti`,
    showPuzzles: 'Mostra i puzzle',
    hidePuzzles: 'Nascondi i puzzle',
    puzzle: 'Puzzle',
    rating_: 'Rating',
    round: (round) => `Giro ${round}`,
    practice: 'Pratica libera',
    practiceSummary: (attempted, solved) => `${attempted} tentativi · ${solved} risolti`,
    practiceEmpty: 'Nessun tentativo in pratica libera.',
    recentPractice: 'Ultimi tentativi',
    when: 'Quando',
    result: 'Esito',
    time: 'Tempo',
    solved: 'Risolto',
    failed: 'Sbagliato',
    seconds: (s) => `${Math.round(s)} s`,
  },
}

const en: AdminTranslations = {
  navLabel: 'Admin',
  title: 'Administration',
  subtitle: 'Platform activity and registered users.',
  error: 'Could not load the data. Try again shortly.',
  periodLabel: 'Chart period',
  period: { day: 'Last 24 hours', week: 'Last 7 days', month: 'Last 30 days' },
  totalLabel: 'Total',
  metrics: {
    signups: 'Sign-ups',
    session_attempts: 'Session puzzle attempts',
    practice_attempts: 'Free practice attempts',
    rounds_completed: 'Session rounds completed',
    sessions_completed: 'Sessions completed',
  },
  bucketTitle: (when, value) => `${when}: ${value}`,
  users: {
    title: 'Registered users',
    count: (n) => (n === 1 ? '1 user' : `${n} users`),
    search: 'Search by email',
    sortLabel: 'Sort by',
    sort: { created: 'Sign-up', last_sign_in: 'Last login' },
    email: 'Email',
    registered: 'Signed up',
    lastLogin: 'Last login',
    lastActivity: 'Last activity',
    elo: 'ELO',
    sessions: 'Sessions',
    never: 'Never',
    unconfirmed: 'Unconfirmed',
    admin: 'Admin',
    activeRound: (round) => `round ${round} in progress`,
    open: 'Open profile',
    empty: 'No user matches the search.',
  },
  user: {
    back: 'Back to administration',
    readOnly: (email) => `You are viewing ${email}’s account in read-only mode.`,
    notFound: 'User not found.',
    account: 'Account',
    providers: 'Signs in with',
    confirmed: 'Email confirmed',
    preferences: 'Preferences',
    language: 'Language',
    boardTheme: 'Board',
    pieceSet: 'Pieces',
    appStyle: 'Style',
    autoAdvance: 'Auto-advance',
    practiceFilter: 'Free practice',
    practiceOnlyFailed: (scope) => `failed puzzles only (${scope})`,
    practiceAll: 'all puzzles',
    practiceSaved: 'problem puzzles',
    legalVersion: 'Terms accepted',
    yes: 'Yes',
    no: 'No',
    none: '—',
    stats: 'Statistics',
    rating: (elo, rd) => `ELO ${elo} (±${Math.round(rd)})`,
    solvedFailed: (solved, failed) => `${solved} solved · ${failed} failed`,
    eloHistory: 'ELO history',
    eloEmpty: 'No puzzles played.',
    sessions: 'Sessions',
    sessionsEmpty: 'No sessions.',
    unnamedSession: (total) => `${total}-puzzle session`,
    createdOn: (date) => `created on ${date}`,
    completedOn: (date) => `completed on ${date}`,
    restingUntil: (date) => `resting until ${date}`,
    roundProgress: (round, attempted, of, solved) =>
      `Round ${round}: ${attempted}/${of} · ${solved} solved`,
    showPuzzles: 'Show puzzles',
    hidePuzzles: 'Hide puzzles',
    puzzle: 'Puzzle',
    rating_: 'Rating',
    round: (round) => `Round ${round}`,
    practice: 'Free practice',
    practiceSummary: (attempted, solved) => `${attempted} attempts · ${solved} solved`,
    practiceEmpty: 'No free practice attempts.',
    recentPractice: 'Latest attempts',
    when: 'When',
    result: 'Result',
    time: 'Time',
    solved: 'Solved',
    failed: 'Failed',
    seconds: (s) => `${Math.round(s)} s`,
  },
}

export const adminTranslations = { it, en }

export function useAdminTranslations(): AdminTranslations {
  const { language } = useLanguage()
  return language === 'it' ? it : en
}
