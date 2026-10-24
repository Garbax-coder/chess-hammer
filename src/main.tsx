import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/lib/auth-context'
import { preferredLanguage } from '@/lib/i18n/detect-language'
import { startErrorMonitoring } from '@/lib/error-monitoring'
import { loadLanguage } from '@/lib/i18n/load-language'
import { LanguageProvider } from '@/lib/language-context'
import { marketingPageForPath } from '@/lib/marketing'
import { installStaleChunkReload } from '@/lib/stale-chunk-reload'

// I dati dell'utente cambiano solo per le sue azioni, e ogni azione aggiorna
// o segna come vecchi i dati che tocca. Con il default (staleTime 0) ogni
// pagina aperta e ogni ritorno sulla scheda riscaricavano tutto di nuovo:
// per un minuto si riusa quello che c'e' gia'.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
})

// Prima di montare l'app si caricano i testi della lingua con cui partira'
// (quella dell'URL sulle pagine pubbliche, altrimenti quella scelta in questo
// browser o, in mancanza, quella del browser):
// cosi' l'HTML pre-generato non viene sostituito da una pagina vuota.
startErrorMonitoring()
installStaleChunkReload()

const initialLanguage =
  marketingPageForPath(window.location.pathname)?.lang ?? preferredLanguage()

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
