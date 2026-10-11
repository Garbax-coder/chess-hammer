import { readFileSync } from 'node:fs'

// Legge una variabile da un file .env del progetto (senza dipendenze).
export function readEnv(file: string, key: string): string | undefined {
  try {
    const match = readFileSync(file, 'utf8').match(new RegExp(`^${key}=(.*)$`, 'm'))
    return match?.[1].trim().replace(/^"|"$/g, '')
  } catch {
    return undefined
  }
}

// Gli indirizzi email degli account creati dai test: riconoscibili, per la pulizia.
export const E2E_EMAIL_PREFIX = 'marco.garbarino.1986+e2e-'
