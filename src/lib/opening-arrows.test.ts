import { describe, expect, it } from 'vitest'
import { ARROW_COLORS, arrowColorOf, arrowsToPgn, toggleArrow } from './opening-arrows'

describe('opening arrows', () => {
  it('adds a new arrow, changes its colour, and removes it when drawn again', () => {
    const g = { from: 'e2', to: 'e4', color: 'G' } as const
    const r = { from: 'e2', to: 'e4', color: 'R' } as const
    expect(toggleArrow([], g)).toEqual([g])
    expect(toggleArrow([g], r)).toEqual([r])
    expect(toggleArrow([g], g)).toEqual([])
  })

  it('reads the board colours and writes the Lichess [%cal] annotation', () => {
    expect(arrowColorOf(ARROW_COLORS.B)).toBe('B')
    expect(arrowColorOf('pink')).toBe('G')
    expect(
      arrowsToPgn([
        { from: 'e2', to: 'e4', color: 'G' },
        { from: 'd1', to: 'h5', color: 'R' },
      ]),
    ).toBe('[%cal Ge2e4,Rd1h5]')
    expect(arrowsToPgn([])).toBe('')
  })
})
