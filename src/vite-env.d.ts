/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Opzionale: senza, i form di login/registrazione/recupero password
  // funzionano normalmente ma senza CAPTCHA (vedi turnstile-widget.tsx).
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
