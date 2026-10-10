import { describe, expect, it } from 'vitest'
import { makeAttempt, makePuzzleResult } from '@/test/fixtures'
import {
  attemptsByRound,
  countAttempts,
  latestAttemptAt,
  maxOrderIndex,
  mergeChangedAttempts,
  mergeSessionPuzzlesDelta,
} from './session-puzzles-merge'

describe('attemptsByRound', () => {
  it('indexes attempts by round number', () => {
    const a1 = makeAttempt({ round_number: 1 })
    const a2 = makeAttempt({ round_number: 2 })
    expect(attemptsByRound([a1, a2])).toEqual({ 1: a1, 2: a2 })
  })

  it('keeps the last attempt when the same round appears twice', () => {
    const first = makeAttempt({ round_number: 1, result: 'failed' })
    const second = makeAttempt({ round_number: 1, result: 'solved' })
    expect(attemptsByRound([first, second])[1]).toBe(second)
  })

  it('returns an empty object for no attempts', () => {
    expect(attemptsByRound([])).toEqual({})
  })
})

describe('maxOrderIndex', () => {
  it('returns the highest order_index', () => {
    const puzzles = [
      makePuzzleResult({ orderIndex: 3 }),
      makePuzzleResult({ orderIndex: 7 }),
      makePuzzleResult({ orderIndex: 5 }),
    ]
    expect(maxOrderIndex(puzzles)).toBe(7)
  })

  it('returns 0 for an empty list', () => {
    expect(maxOrderIndex([])).toBe(0)
  })
})

describe('mergeSessionPuzzlesDelta', () => {
  it('applies updated attempts to the matching puzzle only', () => {
    const target = makePuzzleResult({ sessionPuzzleId: 'a' })
    const other = makePuzzleResult({ sessionPuzzleId: 'b' })
    const newAttempt = makeAttempt({ round_number: 1, result: 'solved' })

    const result = mergeSessionPuzzlesDelta([target, other], {
      newPuzzles: [],
      changedSessionPuzzleId: 'a',
      changedAttempts: [newAttempt],
    })

    expect(result.find((p) => p.sessionPuzzleId === 'a')?.attempts).toEqual({ 1: newAttempt })
    expect(result.find((p) => p.sessionPuzzleId === 'b')?.attempts).toEqual({})
  })

  it('appends new puzzles sorted by order_index', () => {
    const current = [makePuzzleResult({ sessionPuzzleId: 'a', orderIndex: 1 })]
    const added = makePuzzleResult({ sessionPuzzleId: 'b', orderIndex: 2 })

    const result = mergeSessionPuzzlesDelta(current, { newPuzzles: [added] })

    expect(result.map((p) => p.sessionPuzzleId)).toEqual(['a', 'b'])
  })

  it('dedupes new puzzles already present (two syncs racing)', () => {
    const current = [makePuzzleResult({ sessionPuzzleId: 'a', orderIndex: 1 })]
    const duplicate = makePuzzleResult({ sessionPuzzleId: 'a', orderIndex: 1 })

    const result = mergeSessionPuzzlesDelta(current, { newPuzzles: [duplicate] })

    expect(result).toHaveLength(1)
  })

  it('is a no-op when the delta is empty', () => {
    const current = [makePuzzleResult({ sessionPuzzleId: 'a' })]
    const result = mergeSessionPuzzlesDelta(current, { newPuzzles: [] })
    expect(result).toBe(current)
  })

  it('applies both an attempt update and new puzzles in one call', () => {
    const target = makePuzzleResult({ sessionPuzzleId: 'a', orderIndex: 1 })
    const newAttempt = makeAttempt({ round_number: 1, result: 'solved' })
    const added = makePuzzleResult({ sessionPuzzleId: 'b', orderIndex: 2 })

    const result = mergeSessionPuzzlesDelta([target], {
      newPuzzles: [added],
      changedSessionPuzzleId: 'a',
      changedAttempts: [newAttempt],
    })

    expect(result).toHaveLength(2)
    expect(result[0].attempts).toEqual({ 1: newAttempt })
  })
})

describe('countAttempts and latestAttemptAt', () => {
  const p1 = makePuzzleResult({
    sessionPuzzleId: 'sp-1',
    attempts: {
      1: makeAttempt({
        session_puzzle_id: 'sp-1',
        attempted_at: '2026-09-10T10:00:00.000Z',
      }),
      2: makeAttempt({
        session_puzzle_id: 'sp-1',
        round_number: 2,
        attempted_at: '2026-09-12T10:00:00.000Z',
      }),
    },
  })
  const p2 = makePuzzleResult({
    sessionPuzzleId: 'sp-2',
    attempts: {
      1: makeAttempt({
        session_puzzle_id: 'sp-2',
        attempted_at: '2026-09-11T10:00:00.000Z',
      }),
    },
  })

  it('counts every attempt across puzzles and rounds', () => {
    expect(countAttempts([p1, p2])).toBe(3)
  })

  it('returns the most recent attempt time, or null with no attempts', () => {
    expect(latestAttemptAt([p1, p2])).toBe('2026-09-12T10:00:00.000Z')
    expect(latestAttemptAt([makePuzzleResult()])).toBeNull()
  })
})

describe('mergeChangedAttempts', () => {
  it('adds a new round to a puzzle and keeps the rounds already there', () => {
    const r1 = makeAttempt({ session_puzzle_id: 'sp-1', round_number: 1 })
    const r2 = makeAttempt({ session_puzzle_id: 'sp-1', round_number: 2 })
    const current = [makePuzzleResult({ sessionPuzzleId: 'sp-1', attempts: { 1: r1 } })]

    const merged = mergeChangedAttempts(current, [r2])

    expect(merged[0].attempts).toEqual({ 1: r1, 2: r2 })
  })

  it('is idempotent and ignores attempts of puzzles not in the list', () => {
    const r1 = makeAttempt({ session_puzzle_id: 'sp-1', round_number: 1 })
    const current = [makePuzzleResult({ sessionPuzzleId: 'sp-1', attempts: { 1: r1 } })]
    const other = makeAttempt({ session_puzzle_id: 'sp-9', round_number: 1 })

    const merged = mergeChangedAttempts(current, [r1, other])

    expect(merged).toEqual(current)
  })
})
