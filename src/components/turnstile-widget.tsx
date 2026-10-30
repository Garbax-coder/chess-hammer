import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { useTranslations } from '@/lib/language-context'

// Supabase (Authentication -> Attack Protection) applica la protezione
// CAPTCHA in blocco a signup, signin con password e reset password: non si
// puo' limitarla al solo signup lato server, quindi il widget compare su
// tutti e tre i form (vedi src/lib/auth.ts). Senza VITE_TURNSTILE_SITE_KEY
// configurata (dev locale, o finche' non e' stato creato il sito su
// Cloudflare) il componente non renderizza nulla e i form restano
// utilizzabili senza richiedere un token: vedi captchaRequired nei form.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

let scriptLoadPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      // Senza questo il fallimento resterebbe in memoria e nessun tentativo
      // successivo riscaricherebbe lo script.
      scriptLoadPromise = null
      script.remove()
      reject(new Error('Turnstile script failed to load'))
    }
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          theme?: 'light' | 'dark' | 'auto'
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        },
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  // Cambiando questo valore (es. dopo un submit fallito, un token Turnstile
  // e' utilizzabile una sola volta) il widget si rimonta da zero.
  resetKey?: unknown
}

export function TurnstileWidget(props: TurnstileWidgetProps) {
  if (!SITE_KEY) return null
  return <TurnstileChallenge {...props} siteKey={SITE_KEY} />
}

function TurnstileChallenge({
  onVerify,
  onExpire,
  resetKey,
  siteKey,
}: TurnstileWidgetProps & { siteKey: string }) {
  const t = useTranslations()
  const containerId = useId()
  const widgetIdRef = useRef<string | null>(null)
  const { theme } = useTheme()
  // Lo script di Cloudflare non si e' caricato (ad blocker, VPN, rete): senza
  // token il form non parte, quindi lo si dice e si puo' riprovare.
  const [loadFailed, setLoadFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    const container = document.getElementById(containerId)

    loadTurnstileScript().then(
      () => {
        if (cancelled || !container || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: siteKey,
          theme,
          callback: onVerify,
          'expired-callback': onExpire,
        })
      },
      (error: unknown) => {
        if (cancelled) return
        setLoadFailed(true)
        // Gestito qui, ma deve arrivare comunque a Sentry: dice quante
        // persone restano bloccate.
        reportError(error)
      },
    )

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, theme, resetKey, attempt])

  if (loadFailed) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 text-sm">
        <p className="text-destructive">{t.turnstile.loadError}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setLoadFailed(false)
            setAttempt((n) => n + 1)
          }}
        >
          {t.turnstile.retry}
        </Button>
      </div>
    )
  }
  return <div id={containerId} />
}

export const captchaRequired = Boolean(SITE_KEY)
