/// <reference types="node" />
// Questo file gira in Node (Vitest), non nel browser che jsdom emula: il
// resto di src/ resta volutamente senza i tipi Node (tsconfig.app.json ha
// "types": ["vite/client"]), questo riferimento vale solo per questo file.
import { webcrypto } from 'node:crypto'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Senza test.globals:true in vitest.config.ts, @testing-library/react non
// rileva un afterEach globale e non smonta da solo i componenti renderizzati
// da un test: senza questa riga il DOM di un test resta visibile al
// successivo nello stesso file.
afterEach(() => cleanup())

// jsdom non implementa SubtleCrypto: src/lib/password-policy.ts lo usa
// (SHA-1 per l'hash k-anonymity di Have I Been Pwned) anche nei test.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto })
}
