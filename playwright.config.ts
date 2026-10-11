import { defineConfig } from '@playwright/test'

// Test end-to-end nel browser vero (il Chrome installato, nessun download),
// contro `npm run dev` sul progetto Supabase di SVILUPPO: e2e/global-setup.ts
// si ferma se .env.development.local puntasse alla produzione. Ogni esecuzione
// crea il proprio account di prova e lo elimina alla fine.
const PORT = 5190

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  globalSetup: './e2e/global-setup.ts',
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    locale: 'it-IT',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
