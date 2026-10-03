import { describe, expect, it } from 'vitest'
import { makePuzzleResult, withAttempt } from '@/test/fixtures'
import {
  dayGroupsForRound,
  dayKeyOf,
  dayKeyToLocalDate,
  entriesForDay,
  lastAttemptDay,
  puzzleIdsForDay,
  todayKey,
} from './session-days'

describe('dayKeyOf', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(dayKeyOf(new Date(2026, 8, 5))).toBe('2026-09-05')
  })

  it('pads single-digit month and day', () => {
    expect(dayKeyOf(new Date(2026, 0, 3))).toBe('2026-01-03')
  })

  it('accepts an ISO string', () => {
    // Costruita come Date locale e poi riconvertita: dayKeyOf deve leggere
    // lo stesso giorno di calendario, non spostarlo in UTC.
    const d = new Date(2026, 5, 15, 23, 30)
    expect(dayKeyOf(d.toISOString())).toBe(dayKeyOf(d))
  })
})

describe('dayKeyToLocalDate / dayKeyOf roundtrip', () => {
  it('is the inverse of dayKeyOf', () => {
    const day = '2026-03-20'
    expect(dayKeyOf(dayKeyToLocalDate(day))).toBe(day)
  })
})

describe('todayKey', () => {
  it('matches dayKeyOf(new Date())', () => {
    expect(todayKey()).toBe(dayKeyOf(new Date()))
  })
})

describe('dayGroupsForRound', () => {
  it('groups consecutive puzzles attempted the same day', () => {
    const puzzles = [
      withAttempt(makePuzzleResult({ orderIndex: 1 }), 1, 'solved', '2026-09-20T10:00:00Z'),
      withAttempt(makePuzzleResult({ orderIndex: 2 }), 1, 'failed', '2026-09-20T10:05:00Z'),
      withAttempt(makePuzzleResult({ orderIndex: 3 }), 1, 'solved', '2026-09-21T10:00:00Z'),
    ]
    const groups = dayGroupsForRound(puzzles, 1)
    expect(groups).toHaveLength(2)
    expect(groups[0]).toMatchObject({ startIndex: 0, endIndex: 1 })
    expect(groups[1]).toMatchObject({ startIndex: 2, endIndex: 2 })
  })

  it('breaks the current group on an unattempted puzzle', () => {
    const puzzles = [
      withAttempt(makePuzzleResult({ orderIndex: 1 }), 1, 'solved', '2026-09-20T10:00:00Z'),
      makePuzzleResult({ orderIndex: 2 }), // not attempted in round 1
      withAttempt(makePuzzleResult({ orderIndex: 3 }), 1, 'solved', '2026-09-20T10:10:00Z'),
    ]
    const groups = dayGroupsForRound(puzzles, 1)
    // Stesso giorno ma separati dal puzzle non tentato: due gruppi, non uno.
    expect(groups).toHaveLength(2)
    expect(groups[0].endIndex).toBe(0)
    expect(groups[1].startIndex).toBe(2)
  })

  it('only looks at the given round', () => {
    const p = withAttempt(makePuzzleResult({ orderIndex: 1 }), 1, 'solved', '2026-09-20T10:00:00Z')
    expect(dayGroupsForRound([p], 2)).toHaveLength(0)
  })

  it('returns no groups when nothing was attempted', () => {
    expect(dayGroupsForRound([makePuzzleResult()], 1)).toHaveLength(0)
  })
})

describe('lastAttemptDay', () => {
  it('returns the most recent day across all rounds', () => {
    const puzzles = [
      withAttempt(makePuzzleResult({ orderIndex: 1 }), 1, 'solved', '2026-09-18T10:00:00Z'),
      withAttempt(makePuzzleResult({ orderIndex: 2 }), 3, 'failed', '2026-09-25T10:00:00Z'),
      withAttempt(makePuzzleResult({ orderIndex: 3 }), 2, 'solved', '2026-09-20T10:00:00Z'),
    ]
    expect(lastAttemptDay(puzzles)).toBe('2026-09-25')
  })

  it('returns null when there are no attempts', () => {
    expect(lastAttemptDay([makePuzzleResult(), makePuzzleResult()])).toBeNull()
  })
})

describe('puzzleIdsForDay', () => {
  it('includes a puzzle attempted that day in any round', () => {
    const a = makePuzzleResult({ sessionPuzzleId: 'a' })
    const b = makePuzzleResult({ sessionPuzzleId: 'b' })
    const withA = withAttempt(a, 1, 'solved', '2026-09-20T09:00:00Z')
    const withB = withAttempt(b, 2, 'failed', '2026-09-21T09:00:00Z')
    const ids = puzzleIdsForDay([withA, withB], '2026-09-20')
    expect(ids.has('a')).toBe(true)
    expect(ids.has('b')).toBe(false)
  })

  it('counts a puzzle once even with attempts in two rounds the same day', () => {
    let p = makePuzzleResult({ sessionPuzzleId: 'a' })
    p = withAttempt(p, 1, 'solved', '2026-09-20T09:00:00Z')
    p = withAttempt(p, 2, 'solved', '2026-09-20T15:00:00Z')
    const ids = puzzleIdsForDay([p], '2026-09-20')
    expect(ids.size).toBe(1)
  })
})

describe('entriesForDay', () => {
  it('collects every attempt (any round) made that day, in chronological order', () => {
    const a = withAttempt(
      makePuzzleResult({ sessionPuzzleId: 'a', orderIndex: 1 }),
      1,
      'solved',
      '2026-09-20T15:00:00Z',
    )
    const b = withAttempt(
      makePuzzleResult({ sessionPuzzleId: 'b', orderIndex: 2 }),
      2,
      'failed',
      '2026-09-20T09:00:00Z',
    )
    const c = withAttempt(
      makePuzzleResult({ sessionPuzzleId: 'c', orderIndex: 3 }),
      1,
      'solved',
      '2026-09-21T09:00:00Z',
    )
    const entries = entriesForDay([a, b, c], '2026-09-20')
    expect(entries).toHaveLength(2)
    expect(entries[0].puzzle.sessionPuzzleId).toBe('b')
    expect(entries[1].puzzle.sessionPuzzleId).toBe('a')
  })

  it('returns an empty list for a day with no attempts', () => {
    expect(entriesForDay([makePuzzleResult()], '2026-01-01')).toEqual([])
  })
})
