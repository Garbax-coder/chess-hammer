/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Opzionale: senza, i form di login/registrazione/recupero password
  // funzionano normalmente ma senza CAPTCHA (vedi turnstile-widget.tsx).
  readonly VITE_TURNSTILE_SITE_KEY?: string
  // Opzionale: DSN del progetto Sentry (regione UE). Senza, nessuna
  // segnalazione degli errori (vedi src/lib/error-monitoring.ts).
  readonly VITE_SENTRY_DSN?: string
}

// Commit pubblicato (Vercel), per collegare gli errori alla versione: vedi
// define in vite.config.ts.
declare const __APP_RELEASE__: string

interface ImportMeta {
  readonly env: ImportMetaEnv
}
