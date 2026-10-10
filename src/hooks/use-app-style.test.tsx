import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppLogo } from '@/components/app-logo'
import { useApplyAppStyle } from './use-app-style'

let user: { id: string } | null
let savedStyle: string | undefined

vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user }) }))
vi.mock('@/hooks/use-user-stats', () => ({
  useUserStats: () => ({ data: savedStyle ? { app_style: savedStyle } : undefined }),
}))

function Probe() {
  useApplyAppStyle()
  return null
}

beforeEach(() => {
  document.head.innerHTML =
    '<link rel="icon" type="image/svg+xml" href="/favicon-sage.svg" />'
})
afterEach(() => {
  delete document.documentElement.dataset.style
})

function favicon() {
  return document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.getAttribute('href')
}

describe('useApplyAppStyle', () => {
  it("applies the logged-in user's style to the colors and the tab icon", () => {
    user = { id: 'u1' }
    savedStyle = 'ochre'
    render(<Probe />)

    expect(document.documentElement.dataset.style).toBe('ochre')
    expect(favicon()).toBe('/favicon-ochre.svg')
  })

  it('keeps the default style (Salvia) on public pages, before login', () => {
    user = null
    savedStyle = 'ochre'
    render(<Probe />)

    expect(document.documentElement.dataset.style).toBe('sage')
    expect(favicon()).toBe('/favicon-sage.svg')
  })
})

describe('AppLogo', () => {
  it('draws the checkerboard and the hammer in the colors of the chosen style', () => {
    const { container } = render(<AppLogo styleId="slatewood" />)
    const fills = [...container.querySelectorAll('[fill]')].map((el) =>
      el.getAttribute('fill'),
    )

    expect(fills).toEqual(expect.arrayContaining(['#F8EEB0', '#B08D57', '#24394A']))
  })
})
