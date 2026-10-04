import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { captchaRequired, TurnstileWidget } from './turnstile-widget'

// .env.test non definisce VITE_TURNSTILE_SITE_KEY (come in produzione finche'
// non viene configurata Cloudflare Turnstile): questo e' il percorso che
// deve restare sicuro di default, altrimenti login/signup/recupero password
// resterebbero bloccati ovunque la chiave non sia impostata.
describe('captchaRequired', () => {
  it('is false when no site key is configured', () => {
    expect(captchaRequired).toBe(false)
  })
})

describe('TurnstileWidget', () => {
  it('renders nothing without a site key, instead of a broken/empty widget', () => {
    const { container } = render(<TurnstileWidget onVerify={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
