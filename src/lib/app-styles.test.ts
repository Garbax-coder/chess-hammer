import { describe, expect, it } from 'vitest'
import { appStyleById, DEFAULT_APP_STYLE, resolveAppStyle } from './app-styles'

describe('resolveAppStyle', () => {
  it('uses the default style (Salvia) when nobody is logged in, whatever was saved', () => {
    expect(DEFAULT_APP_STYLE).toBe('sage')
    expect(resolveAppStyle(false, 'ochre')).toBe('sage')
  })

  it("uses the user's saved style once logged in", () => {
    expect(resolveAppStyle(true, 'slatewood')).toBe('slatewood')
    expect(resolveAppStyle(true, 'ochre')).toBe('ochre')
  })

  it('falls back to the default while the preference is loading or unknown', () => {
    expect(resolveAppStyle(true, undefined)).toBe('sage')
    expect(resolveAppStyle(true, 'neon')).toBe('sage')
  })
})

describe('appStyleById', () => {
  it('returns the default style for an unknown id', () => {
    expect(appStyleById('neon').id).toBe('sage')
  })
})
