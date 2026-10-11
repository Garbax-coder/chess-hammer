import { afterEach, describe, expect, it } from 'vitest'
import { isStaleChunkNoise, shouldReloadForStaleChunk } from './stale-chunk-reload'

describe('shouldReloadForStaleChunk', () => {
  it('reloads the first time', () => {
    expect(shouldReloadForStaleChunk(1_000_000, null)).toBe(true)
  })

  it('does not reload again within a minute, to avoid a loop', () => {
    expect(shouldReloadForStaleChunk(1_030_000, 1_000_000)).toBe(false)
  })

  it('reloads again after a minute', () => {
    expect(shouldReloadForStaleChunk(1_070_000, 1_000_000)).toBe(true)
  })
})

describe('isStaleChunkNoise', () => {
  afterEach(() => sessionStorage.clear())
  const missing =
    'Failed to fetch dynamically imported module: https://chesshammer.com/assets/TrainPage-x.js'

  it('hides missing-chunk errors only while the automatic reload is under way', () => {
    sessionStorage.setItem('chess-hammer-stale-chunk-reload', '1000000')
    expect(isStaleChunkNoise(missing, 1_003_000)).toBe(true)
    expect(
      isStaleChunkNoise(
        "Cannot read properties of undefined (reading 'default')",
        1_003_000,
      ),
    ).toBe(true)
    expect(isStaleChunkNoise(missing, 1_020_000)).toBe(false)
  })

  it('never hides other errors, or chunk errors without a reload', () => {
    sessionStorage.setItem('chess-hammer-stale-chunk-reload', '1000000')
    expect(isStaleChunkNoise('TypeError: x is not a function', 1_003_000)).toBe(false)
    sessionStorage.clear()
    expect(isStaleChunkNoise(missing, 1_003_000)).toBe(false)
  })
})
