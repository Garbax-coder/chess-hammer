import { describe, expect, it } from 'vitest'
import { makeSession } from '@/test/fixtures'
import {
  NEW_PUZZLE_PREFIX,
  planScenario,
  startOfQuotaDay,
  type DebugScenario,
  type ScenarioAttempt,
  type ScenarioState,
} from './dev-scenarios'

const NOW = new Date('2026-10-18T15:00:00Z')
const today = (minutes: number) =>
  new Date(NOW.getTime() - minutes * 60_000).toISOString()
const daysAgo = (days: number) =>
  new Date(NOW.getTime() - days * 24 * 3_600_000).toISOString()

function pool(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: `sp-${i + 1}`, order_index: i + 1 }))
}

let attemptId = 0
function attempt(
  sessionPuzzleId: string,
  round: 1 | 2 | 3,
  attemptedAt: string,
): ScenarioAttempt {
  attemptId += 1
  return {
    id: `a-${attemptId}`,
    session_puzzle_id: sessionPuzzleId,
    round_number: round,
    result: 'solved',
    time_seconds: 20,
    elo_before: 1500,
    elo_after: 1510,
    attempted_at: attemptedAt,
  }
}

// Stato dopo il piano, come lo vedrebbe il database.
function apply(scenario: DebugScenario, state: ScenarioState) {
  const plan = planScenario(scenario, state)
  const newPool = Array.from({ length: plan.newPuzzles }, (_, i) => ({
    id: `${NEW_PUZZLE_PREFIX}${i}`,
    order_index: 1000 + i,
  }))
  const attempts = [
    ...state.attempts.filter((a) => !plan.deleteAttemptIds.includes(a.id)),
    ...plan.insertAttempts,
  ]
  const todayStart = startOfQuotaDay(state.now)
  const inRound = (r: number) => attempts.filter((a) => a.round_number === r)
  return {
    plan,
    pool: [...state.pool, ...newPool],
    attempts,
    inRound,
    todayInRound: (r: number) =>
      inRound(r).filter((a) => Date.parse(a.attempted_at) >= todayStart),
  }
}

function expectNoDuplicates(
  attempts: { session_puzzle_id: string; round_number: number }[],
) {
  const keys = attempts.map((a) => `${a.session_puzzle_id}/${a.round_number}`)
  expect(new Set(keys).size).toBe(keys.length)
}

describe('debug scenario: last puzzle of today', () => {
  it('round 1: fills today up to target - 1, adding puzzles to the pool', () => {
    const session = makeSession({ total_puzzles: 50, daily_target_round1: 10 })
    const state: ScenarioState = {
      session,
      pool: pool(3),
      attempts: [attempt('sp-1', 1, daysAgo(2)), attempt('sp-2', 1, today(30))],
      elo: 1600,
      now: NOW,
    }
    const r = apply('lastOfDay', state)

    expect(r.todayInRound(1)).toHaveLength(9)
    expect(r.plan.quotaEndsRound).toBe(false)
    expect(r.inRound(1).length).toBeLessThan(50)
    expect(r.plan.newPuzzles).toBe(7)
    expect(r.plan.deleteAttemptIds).toEqual([])
    expect(r.plan.session.current_round).toBe(1)
    expect(r.plan.insertAttempts.every((a) => a.elo_after === 1600)).toBe(true)
    expectNoDuplicates(r.attempts)
  })

  it('removes the most recent attempts when the quota is already used up', () => {
    const session = makeSession({
      current_round: 2,
      total_puzzles: 30,
      daily_target_round2: 4,
    })
    const state: ScenarioState = {
      session,
      pool: pool(30),
      attempts: [
        ...pool(30).map((p) => attempt(p.id, 1, daysAgo(5))),
        ...['sp-1', 'sp-2', 'sp-3', 'sp-4', 'sp-5'].map((id, i) =>
          attempt(id, 2, today(50 - i)),
        ),
      ],
      elo: 1500,
      now: NOW,
    }
    const r = apply('lastOfDay', state)

    expect(r.todayInRound(2)).toHaveLength(3)
    // Tolti i due piu' recenti (sp-4 e sp-5): il prossimo e' sp-4.
    expect(
      r
        .inRound(2)
        .map((a) => a.session_puzzle_id)
        .sort(),
    ).toEqual(['sp-1', 'sp-2', 'sp-3'])
    expect(r.plan.newPuzzles).toBe(0)
  })

  it("keeps the round open after today's last puzzle, freeing older attempts", () => {
    const session = makeSession({
      current_round: 3,
      total_puzzles: 5,
      daily_target_round3: 4,
    })
    const state: ScenarioState = {
      session,
      pool: pool(5),
      attempts: [
        ...pool(5).flatMap((p) => [
          attempt(p.id, 1, daysAgo(9)),
          attempt(p.id, 2, daysAgo(5)),
        ]),
        ...['sp-1', 'sp-2', 'sp-3', 'sp-4'].map((id) => attempt(id, 3, daysAgo(1))),
      ],
      elo: 1500,
      now: NOW,
    }
    const r = apply('lastOfDay', state)

    expect(r.todayInRound(3)).toHaveLength(3)
    // Due puzzle da fare: l'ultimo di oggi e almeno un altro, il giro non si chiude.
    expect(r.inRound(3)).toHaveLength(3)
    expectNoDuplicates(r.attempts)
  })

  it('flags a daily quota that covers the whole rest of the round', () => {
    const session = makeSession({
      current_round: 3,
      total_puzzles: 40,
      daily_target_round3: 40,
    })
    const r = apply('lastOfDay', {
      session,
      pool: pool(40),
      attempts: [],
      elo: 1500,
      now: NOW,
    })

    expect(r.plan.quotaEndsRound).toBe(true)
    // Resta solo l'ultimo puzzle del giro.
    expect(r.inRound(3)).toHaveLength(39)
  })

  it('clears the rest period', () => {
    const session = makeSession({ current_round: 2, resting_until: daysAgo(-2) })
    const r = apply('lastOfDay', {
      session,
      pool: pool(10),
      attempts: [],
      elo: 1500,
      now: NOW,
    })
    expect(r.plan.session.resting_until).toBeNull()
  })
})

describe('debug scenario: last puzzle of round 1', () => {
  it('leaves exactly one round-1 puzzle, none today, and drops rounds 2 and 3', () => {
    const session = makeSession({
      current_round: 2,
      total_puzzles: 12,
      daily_target_round1: 5,
    })
    const state: ScenarioState = {
      session,
      pool: pool(12),
      attempts: [
        ...pool(12).map((p, i) => attempt(p.id, 1, i < 10 ? daysAgo(3) : today(10 + i))),
        attempt('sp-1', 2, today(5)),
        attempt('sp-2', 2, today(4)),
      ],
      elo: 1500,
      now: NOW,
    }
    const r = apply('lastOfRound1', state)

    expect(r.inRound(1)).toHaveLength(11)
    expect(r.todayInRound(1)).toHaveLength(0)
    expect(r.inRound(2)).toHaveLength(0)
    expect(r.inRound(3)).toHaveLength(0)
    expect(r.plan.session).toMatchObject({ current_round: 1, status: 'in_progress' })
    expectNoDuplicates(r.attempts)
  })

  it('builds the pool when the session has just started', () => {
    const session = makeSession({ total_puzzles: 20 })
    const r = apply('lastOfRound1', {
      session,
      pool: pool(1),
      attempts: [],
      elo: 1500,
      now: NOW,
    })
    expect(r.inRound(1)).toHaveLength(19)
    expect(r.plan.newPuzzles).toBe(18)
  })
})

describe('debug scenario: last puzzle of the session', () => {
  it('completes rounds 1 and 2 and leaves the last pool puzzle of round 3', () => {
    const session = makeSession({ total_puzzles: 8, daily_target_round3: 5 })
    const state: ScenarioState = {
      session,
      pool: pool(4),
      attempts: [attempt('sp-1', 1, today(20)), attempt('sp-2', 1, today(10))],
      elo: 1500,
      now: NOW,
    }
    const r = apply('lastOfSession', state)

    expect(r.pool).toHaveLength(8)
    expect(r.inRound(1)).toHaveLength(8)
    expect(r.inRound(2)).toHaveLength(8)
    expect(r.inRound(3)).toHaveLength(7)
    expect(r.todayInRound(3)).toHaveLength(0)
    const done = new Set(r.inRound(3).map((a) => a.session_puzzle_id))
    expect(r.pool.filter((p) => !done.has(p.id)).map((p) => p.id)).toEqual([
      `${NEW_PUZZLE_PREFIX}3`,
    ])
    expect(r.plan.session).toMatchObject({ current_round: 3, completed_at: null })
    expectNoDuplicates(r.attempts)
  })

  it('reopens a session whose round 3 is already complete', () => {
    const session = makeSession({ current_round: 3, total_puzzles: 3 })
    const state: ScenarioState = {
      session,
      pool: pool(3),
      attempts: pool(3).flatMap((p) => [
        attempt(p.id, 1, daysAgo(9)),
        attempt(p.id, 2, daysAgo(5)),
        attempt(p.id, 3, today(30)),
      ]),
      elo: 1500,
      now: NOW,
    }
    const r = apply('lastOfSession', state)

    expect(r.inRound(3)).toHaveLength(2)
    expect(r.todayInRound(3)).toHaveLength(0)
    expectNoDuplicates(r.attempts)
  })
})

describe('startOfQuotaDay', () => {
  it('is the earlier of local and UTC midnight', () => {
    const local = new Date(NOW)
    local.setHours(0, 0, 0, 0)
    const utc = Date.UTC(2026, 9, 18)
    expect(startOfQuotaDay(NOW)).toBe(Math.min(local.getTime(), utc))
  })
})
