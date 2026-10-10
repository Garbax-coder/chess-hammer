import type { Breadcrumb, ErrorEvent } from '@sentry/react'

// Segnalazione degli errori con Sentry (regione UE), attiva solo in
// produzione e solo se VITE_SENTRY_DSN e' impostata. Il pacchetto si scarica
// dopo il caricamento della pagina, per non pesare sul primo avvio: un errore
// nei primissimi istanti puo' sfuggire, gli altri arrivano tutti.
//
// Niente dati personali (vedi l'informativa privacy): nessun utente, nessun
// IP inviato dall'SDK, niente testi cliccati o digitati, e dagli indirizzi si
// tolgono query string e frammento (il link di recupero password e il ritorno
// dal login con Google portano i token di accesso dopo il #).

const DSN = import.meta.env.VITE_SENTRY_DSN

export function scrubUrl(url: string): string {
  return url.replace(/[?#].*$/, '')
}

const DROPPED_BREADCRUMBS = new Set(['ui.click', 'ui.input', 'console'])

export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category && DROPPED_BREADCRUMBS.has(breadcrumb.category)) return null
  const data = breadcrumb.data
  if (!data) return breadcrumb
  const scrubbed = { ...data }
  for (const key of ['url', 'from', 'to']) {
    if (typeof scrubbed[key] === 'string') scrubbed[key] = scrubUrl(scrubbed[key])
  }
  return { ...breadcrumb, data: scrubbed }
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.url) event.request.url = scrubUrl(event.request.url)
  if (event.request) delete event.request.cookies
  delete event.user
  return event
}

export function startErrorMonitoring() {
  if (!import.meta.env.PROD || !DSN) return
  const start = () => {
    import('@sentry/react')
      .then((Sentry) =>
        Sentry.init({
          dsn: DSN,
          release: __APP_RELEASE__,
          environment: 'production',
          // Il minimo indispensabile: niente dati utente, cookie, header, corpi
          // delle richieste, parametri degli indirizzi o variabili locali.
          dataCollection: {
            userInfo: false,
            cookies: false,
            httpHeaders: false,
            httpBodies: [],
            urlQueryParams: false,
            databaseQueryData: false,
            stackFrameVariables: false,
          },
          // Le sessioni ("release health") manderebbero una richiesta a ogni
          // visita: servono solo gli errori.
          integrations: (defaults) => defaults.filter((i) => i.name !== 'BrowserSession'),
          beforeBreadcrumb: scrubBreadcrumb,
          beforeSend: scrubEvent,
        }),
      )
      .catch(() => {})
  }
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}
