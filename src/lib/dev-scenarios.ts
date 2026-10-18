import { dailyTargetForRound } from '@/lib/puzzle-engine'
import { clearSnapshots } from '@/lib/session-puzzles-snapshot'
import { supabase } from '@/lib/supabase'
import type { AttemptResult, TrainingSession } from '@/types/training'

// Scenari del pannello di debug: portano la sessione attiva a un passo da un
// traguardo (fine della quota di oggi, fine del giro 1, fine della sessione)
// aggiungendo, togliendo o retrodatando tentativi, cosi' il traguardo si prova
// risolvendo un solo puzzle invece di giocarne decine.

export type DebugScenario = 'lastOfDay' | 'lastOfRound1' | 'lastOfSession'
type Round = 1 | 2 | 3

export interface ScenarioAttempt {
  id: string
  session_puzzle_id: string
  round_number: Round
  result: AttemptResult
  time_seconds: number
  elo_before: number
  elo_after: number
  attempted_at: string
}

export interface ScenarioPoolPuzzle {
  id: string
  order_index: number
}

export interface ScenarioState {
  session: TrainingSession
  pool: ScenarioPoolPuzzle[]
  attempts: ScenarioAttempt[]
  elo: number
  now: Date
}

/** Puzzle da aggiungere al pool: `new:0`, `new:1`, ... nell'ordine in cui vanno inseriti. */
export const NEW_PUZZLE_PREFIX = 'new:'

export interface PlannedAttempt {
  session_puzzle_id: string
  round_number: Round
  result: AttemptResult
  time_seconds: number
  elo_before: number
  elo_after: number
  attempted_at: string
}

export interface ScenarioPlan {
  /** La quota del giro copre tutti i puzzle rimasti: l'ultimo di oggi chiude anche il giro. */
  quotaEndsRound: boolean
  newPuzzles: number
  deleteAttemptIds: string[]
  insertAttempts: PlannedAttempt[]
  session: {
    current_round: Round
    resting_until: null
    status: 'in_progress'
    completed_at: null
  }
}

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

/**
 * Inizio di "oggi" per la quota giornaliera. Il client conta da mezzanotte
 * locale, il database (record_attempt_and_get_next_puzzle) da mezzanotte UTC:
 * si prende la piu' vecchia delle due, cosi' un tentativo retrodatato prima di
 * questo istante non conta come "oggi" per nessuno dei due.
 */
export function startOfQuotaDay(now: Date): number {
  const local = new Date(now)
  local.setHours(0, 0, 0, 0)
  const utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.min(local.getTime(), utc)
}

export function planScenario(
  scenario: DebugScenario,
  state: ScenarioState,
): ScenarioPlan {
  const { session, elo, now } = state
  const todayStart = startOfQuotaDay(now)
  const pool = [...state.pool].sort((a, b) => a.order_index - b.order_index)
  let attempts = state.attempts.map((a) => ({ ...a, existing: true }))
  const deleteAttemptIds: string[] = []
  let newPuzzles = 0
  let fakeCount = 0
  const maxOrder = () => pool.reduce((m, p) => Math.max(m, p.order_index), 0)

  const inRound = (round: Round) => attempts.filter((a) => a.round_number === round)
  const byTime = (a: { attempted_at: string }, b: { attempted_at: string }) =>
    Date.parse(a.attempted_at) - Date.parse(b.attempted_at)

  function remove(a: (typeof attempts)[number]) {
    attempts = attempts.filter((x) => x !== a)
    if (a.existing) deleteAttemptIds.push(a.id)
  }

  // Un tentativo spostato a un altro istante: per il database e' una
  // cancellazione seguita da un nuovo inserimento con gli stessi dati.
  function redate(a: (typeof attempts)[number], at: number) {
    remove(a)
    attempts.push({
      ...a,
      id: '',
      existing: false,
      attempted_at: new Date(at).toISOString(),
    })
  }

  function addAttempt(sessionPuzzleId: string, round: Round, at: number) {
    const i = fakeCount++
    attempts.push({
      id: '',
      existing: false,
      session_puzzle_id: sessionPuzzleId,
      round_number: round,
      // Tre risolti e uno sbagliato, tempi diversi: grafici e liste restano
      // leggibili senza sembrare tutti uguali.
      result: i % 4 === 3 ? 'failed' : 'solved',
      time_seconds: 15 + ((i * 7) % 45),
      elo_before: elo,
      elo_after: elo,
      attempted_at: new Date(at).toISOString(),
    })
  }

  /**
   * Porta il giro a esattamente `target` tentativi: toglie i piu' recenti
   * oppure aggiunge tentativi ai puzzle ancora da fare, nell'ordine del pool
   * (al giro 1, se il pool non basta, con puzzle nuovi). `at(i)` e' l'istante
   * dell'i-esimo tentativo aggiunto.
   */
  function fillRound(
    round: Round,
    target: number,
    at: (i: number, of: number) => number,
  ) {
    const current = inRound(round).sort(byTime)
    for (const a of current.slice(target).reverse()) remove(a)
    const need = target - Math.min(current.length, target)
    if (need <= 0) return

    const done = new Set(inRound(round).map((a) => a.session_puzzle_id))
    const free = pool.filter((p) => !done.has(p.id)).map((p) => p.id)
    if (round === 1) {
      while (free.length < need) {
        const id = `${NEW_PUZZLE_PREFIX}${newPuzzles++}`
        pool.push({ id, order_index: maxOrder() + 1 })
        free.push(id)
      }
    }
    free
      .slice(0, need)
      .forEach((id, i, list) => addAttempt(id, round, at(i, list.length)))
  }

  const pastDay = (daysAgo: number) => (i: number) =>
    todayStart - daysAgo * DAY + i * MINUTE
  const moveTodayToPast = (round: Round, daysAgo: number) =>
    inRound(round)
      .filter((a) => Date.parse(a.attempted_at) >= todayStart)
      .sort(byTime)
      .forEach((a, i) => redate(a, pastDay(daysAgo)(i)))

  let round: Round = session.current_round
  let quotaEndsRound = false

  if (scenario === 'lastOfDay') {
    // Al giro corrente: oggi target - 1 tentativi, e dopo l'ultimo di oggi
    // almeno un altro puzzle ancora da fare nel giro (altrimenti l'ultimo di
    // oggi chiuderebbe anche il giro).
    const target = dailyTargetForRound(session, round)
    const roundSize = round === 1 ? session.total_puzzles : pool.length
    const today = () =>
      inRound(round)
        .filter((a) => Date.parse(a.attempted_at) >= todayStart)
        .sort(byTime)
    for (const a of today()
      .slice(target - 1)
      .reverse())
      remove(a)

    let need = target - 1 - today().length
    const left = () => roundSize - inRound(round).length - 2
    // Pochi puzzle rimasti nel giro: si liberano i tentativi piu' vecchi
    // (non di oggi) per lasciare spazio a quelli di oggi.
    const older = inRound(round)
      .filter((a) => Date.parse(a.attempted_at) < todayStart)
      .sort(byTime)
    while (need > left() && older.length > 0) remove(older.shift()!)
    // Quota piu' grande dei puzzle rimasti: si lascia solo l'ultimo del giro,
    // che e' anche l'ultimo giocabile oggi (e il pannello lo segnala).
    quotaEndsRound = need > left()
    if (quotaEndsRound) need = roundSize - inRound(round).length - 1
    need = Math.max(0, need)

    const now0 = now.getTime()
    fillRound(round, inRound(round).length + need, (i, of) => now0 - (of - i) * 1000)
  } else if (scenario === 'lastOfRound1') {
    // Giro 1 con total_puzzles - 1 tentativi, nessuno oggi (quota libera),
    // nessun tentativo dei giri 2 e 3.
    round = 1
    for (const a of [...inRound(2), ...inRound(3)]) remove(a)
    fillRound(1, session.total_puzzles - 1, pastDay(1))
    moveTodayToPast(1, 1)
  } else {
    // Giri 1 e 2 conclusi, giro 3 con tutti i puzzle del pool tranne l'ultimo.
    round = 3
    fillRound(1, Math.max(session.total_puzzles, inRound(1).length), pastDay(3))
    fillRound(2, pool.length, pastDay(2))
    fillRound(3, pool.length - 1, pastDay(1))
    moveTodayToPast(3, 1)
  }

  return {
    quotaEndsRound,
    newPuzzles,
    deleteAttemptIds,
    insertAttempts: attempts
      .filter((a) => !a.existing)
      .map(({ id: _id, existing: _existing, ...a }) => a),
    session: {
      current_round: round,
      resting_until: null,
      status: 'in_progress',
      completed_at: null,
    },
  }
}

async function loadState(
  session: TrainingSession,
  userId: string,
): Promise<ScenarioState> {
  const { data: pool, error: poolError } = await supabase
    .from('session_puzzles')
    .select('id, order_index')
    .eq('session_id', session.id)
  if (poolError) throw poolError

  let attempts: ScenarioAttempt[] = []
  if (pool.length > 0) {
    const { data, error } = await supabase
      .from('puzzle_attempts')
      .select(
        'id, session_puzzle_id, round_number, result, time_seconds, elo_before, elo_after, attempted_at',
      )
      .in(
        'session_puzzle_id',
        pool.map((p) => p.id),
      )
    if (error) throw error
    attempts = data
  }

  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('current_elo')
    .eq('user_id', userId)
    .single()
  if (statsError) throw statsError

  return { session, pool, attempts, elo: stats.current_elo, now: new Date() }
}

// Puzzle nuovi per il giro 1: stessa scelta dell'app (vicino all'ELO, nei
// temi della sessione, mai gia' nel pool).
async function addPoolPuzzles(state: ScenarioState, count: number): Promise<string[]> {
  const ids: string[] = []
  let order = state.pool.reduce((m, p) => Math.max(m, p.order_index), 0)
  for (let i = 0; i < count; i++) {
    let puzzleId: string | null = null
    for (const window of [100, 250, 500, 1000, 3000]) {
      const { data, error } = await supabase.rpc('pick_next_round1_puzzle', {
        p_session_id: state.session.id,
        p_target_rating: state.elo,
        p_window: window,
        p_themes: state.session.puzzle_themes,
      })
      if (error) throw error
      if (data && data.length > 0) {
        puzzleId = data[0].puzzle_id
        break
      }
    }
    if (!puzzleId) throw new Error('Nessun puzzle disponibile per completare il pool.')
    order += 1
    const { data, error } = await supabase
      .from('session_puzzles')
      .insert({ session_id: state.session.id, puzzle_id: puzzleId, order_index: order })
      .select('id')
      .single()
    if (error) throw error
    ids.push(data.id)
  }
  return ids
}

export async function applyScenario(
  scenario: DebugScenario,
  session: TrainingSession,
  userId: string,
) {
  const state = await loadState(session, userId)
  const plan = planScenario(scenario, state)

  const newIds = await addPoolPuzzles(state, plan.newPuzzles)
  const resolveId = (id: string) =>
    id.startsWith(NEW_PUZZLE_PREFIX)
      ? newIds[Number(id.slice(NEW_PUZZLE_PREFIX.length))]
      : id

  if (plan.deleteAttemptIds.length > 0) {
    const { error } = await supabase
      .from('puzzle_attempts')
      .delete()
      .in('id', plan.deleteAttemptIds)
    if (error) throw error
  }
  if (plan.insertAttempts.length > 0) {
    const { error } = await supabase.from('puzzle_attempts').insert(
      plan.insertAttempts.map((a) => ({
        ...a,
        session_puzzle_id: resolveId(a.session_puzzle_id),
      })),
    )
    if (error) throw error
  }

  const { error } = await supabase
    .from('training_sessions')
    .update(plan.session)
    .eq('id', session.id)
  if (error) throw error

  // La copia locale della lista puzzle si aggiorna solo coi tentativi piu'
  // recenti: quelli retrodatati non li vedrebbe.
  clearSnapshots()
  return { quotaEndsRound: plan.quotaEndsRound }
}
