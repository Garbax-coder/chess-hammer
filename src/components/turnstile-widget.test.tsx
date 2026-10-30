import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { captchaRequired, TurnstileWidget } from './turnstile-widget'

vi.mock('@/lib/language-context', () => ({ useTranslations: () => itTranslations }))
vi.mock('@/hooks/use-theme', () => ({ useTheme: () => ({ theme: 'dark' }) }))

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

describe('TurnstileWidget with a site key', () => {
  const t = itTranslations.turnstile
  const report = vi.fn()
  const scriptTag = () =>
    document.head.querySelector<HTMLScriptElement>('script[src*="turnstile"]')

  async function renderWidget() {
    // La chiave si legge al caricamento del modulo.
    vi.resetModules()
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-key')
    const { TurnstileWidget: Widget } = await import('./turnstile-widget')
    render(<Widget onVerify={() => {}} />)
  }

  beforeEach(() => {
    report.mockReset()
    vi.stubGlobal('reportError', report)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    scriptTag()?.remove()
    delete window.turnstile
  })

  it('says when the script fails to load, reports it and lets the user retry', async () => {
    await renderWidget()
    await act(async () => {
      fireEvent.error(scriptTag()!)
    })
    expect(screen.getByRole('alert')).toHaveTextContent(t.loadError)
    expect(report).toHaveBeenCalledWith(new Error('Turnstile script failed to load'))
    expect(scriptTag()).toBeNull()

    // Riprova: si riscarica lo script e la verifica compare.
    fireEvent.click(screen.getByRole('button', { name: t.retry }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    const renderChallenge = vi.fn(() => 'widget-1')
    window.turnstile = { render: renderChallenge, reset: vi.fn(), remove: vi.fn() }
    await act(async () => {
      fireEvent.load(scriptTag()!)
    })
    expect(renderChallenge).toHaveBeenCalledOnce()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
