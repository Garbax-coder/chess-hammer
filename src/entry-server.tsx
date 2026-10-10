import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-context'
import { loadLanguage } from '@/lib/i18n/load-language'
import { LANGUAGES } from '@/lib/i18n/translations'
import { MARKETING_PAGES } from '@/lib/marketing'
import { marketingMeta, renderHeadTags } from '@/lib/seo'

// Punto d'ingresso usato solo alla build (scripts/prerender.mjs) per scrivere
// l'HTML delle pagine pubbliche: stessi provider di main.tsx, ma senza
// sessione (si rende da visitatore non autenticato).
await Promise.all(LANGUAGES.map(loadLanguage))

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        <StaticRouter location={url}>
          <AuthProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </AuthProvider>
        </StaticRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
}

export const pages = MARKETING_PAGES.map((page) => {
  const meta = marketingMeta(page.id, page.lang)
  return { ...page, meta, head: renderHeadTags(meta) }
})
