import pg from 'pg'
import { E2E_EMAIL_PREFIX, readEnv } from './dev-env'

// Prima di ogni esecuzione: si verifica di essere sul progetto di sviluppo e si
// eliminano gli account rimasti da esecuzioni interrotte.
export default async function globalSetup() {
  const devUrl = readEnv('.env.development.local', 'VITE_SUPABASE_URL')
  const prodUrl = readEnv('.env.local', 'VITE_SUPABASE_URL')
  const dbUrl = readEnv('.env.development.local', 'DEV_SUPABASE_DB_URL')
  if (!devUrl || !dbUrl) {
    throw new Error(
      'Manca .env.development.local con il progetto Supabase di sviluppo (vedi README).',
    )
  }
  if (devUrl === prodUrl) {
    throw new Error(
      '.env.development.local punta alla produzione: i test end-to-end girano solo in sviluppo.',
    )
  }
  if (readEnv('.env.development.local', 'VITE_TURNSTILE_SITE_KEY')) {
    throw new Error(
      'In sviluppo VITE_TURNSTILE_SITE_KEY deve essere vuota (niente CAPTCHA).',
    )
  }
  const ref = new URL(devUrl).hostname.split('.')[0]
  if (!dbUrl.includes(ref)) {
    throw new Error('DEV_SUPABASE_DB_URL non corrisponde al progetto di sviluppo.')
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  await client.query(`delete from auth.users where email like $1`, [
    `${E2E_EMAIL_PREFIX}%`,
  ])
  await client.end()
}
