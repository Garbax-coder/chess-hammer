import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/lib/auth-context'
import { detectBrowserLanguage } from '@/lib/i18n/detect-language'
import { startErrorMonitoring } from '@/lib/error-monitoring'
import { loadLanguage } from '@/lib/i18n/load-language'
import { LanguageProvider } from '@/lib/language-context'
import { marketingPageForPath } from '@/lib/marketing'

const queryClient = new QueryClient()

// Prima di montare l'app si caricano i testi della lingua con cui partira'
// (quella dell'URL sulle pagine pubbliche, altrimenti quella del browser):
// cosi' l'HTML pre-generato non viene sostituito da una pagina vuota.
startErrorMonitoring()

const initialLanguage =
  marketingPageForPath(window.location.pathname)?.lang ?? detectBrowserLanguage()

void loadLanguage(initialLanguage)
  .catch((error: unknown) => console.error(error))
  .finally(renderApp)

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
}
