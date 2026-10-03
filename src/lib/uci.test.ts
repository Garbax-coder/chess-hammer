import { describe, expect, it } from 'vitest'
import { parseUci } from './uci'

describe('parseUci', () => {
  it('parses a plain move', () => {
    expect(parseUci('e2e4')).toEqual({ from: 'e2', to: 'e4', promotion: undefined })
  })

  it('parses a promotion move', () => {
    expect(parseUci('e7e8q')).toEqual({ from: 'e7', to: 'e8', promotion: 'q' })
  })
})
