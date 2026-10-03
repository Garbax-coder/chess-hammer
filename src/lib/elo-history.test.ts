import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sinceIsoFor } from './elo-history'

describe('sinceIsoFor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-20T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null for "all" (no lower bound)', () => {
    expect(sinceIsoFor('all')).toBeNull()
  })

  it('returns 7 days ago for "week"', () => {
    expect(sinceIsoFor('week')).toBe(new Date('2026-09-13T12:00:00.000Z').toISOString())
  })

  it('returns 30 days ago for "month"', () => {
    expect(sinceIsoFor('month')).toBe(new Date('2026-08-21T12:00:00.000Z').toISOString())
  })

  it('returns 365 days ago for "year"', () => {
    expect(sinceIsoFor('year')).toBe(new Date('2025-09-20T12:00:00.000Z').toISOString())
  })
})
