import { describe, expect, it } from 'vitest'
import { isOpeningBoardPath } from './opening-routes'

describe('isOpeningBoardPath', () => {
  it('matches the pages with the opening board', () => {
    for (const path of [
      '/openings/caro-kann',
      '/openings/caro-kann/learn',
      '/openings/u-abc/lines',
      '/openings/italian-game/cycles',
    ]) {
      expect(isOpeningBoardPath(path)).toBe(true)
    }
  })

  it('leaves out the list, the creation pages and the rest of the app', () => {
    for (const path of [
      '/openings',
      '/openings/import',
      '/openings/eco',
      '/openings/new',
      '/train',
      '/openings/x/other',
    ]) {
      expect(isOpeningBoardPath(path)).toBe(false)
    }
  })
})
