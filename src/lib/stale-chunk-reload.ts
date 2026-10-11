// Dopo una pubblicazione, chi aveva gia' il sito aperto chiede i pezzi di
// codice della versione precedente, che non esistono piu': "Failed to fetch
// dynamically imported module" (visto su Sentry). Vite lo segnala con
// l'evento vite:preloadError; si ricarica la pagina, che prende la versione
// nuova. Al massimo una volta ogni minuto, per non entrare in un ciclo se il
// problema e' un altro (ad esempio la rete assente).
const KEY = 'chess-hammer-stale-chunk-reload'
const MIN_INTERVAL_MS = 60_000

export function shouldReloadForStaleChunk(
  now: number,
  lastReload: number | null,
): boolean {
  return lastReload === null || now - lastReload > MIN_INTERVAL_MS
}

export function installStaleChunkReload() {
  window.addEventListener('vite:preloadError', (event) => {
    let last: number | null = null
    try {
      const stored = sessionStorage.getItem(KEY)
      last = stored ? Number(stored) : null
    } catch {
      // memoria di sessione non disponibile: si ricarica comunque una volta
    }
    const now = Date.now()
    if (!shouldReloadForStaleChunk(now, last)) return
    try {
      sessionStorage.setItem(KEY, String(now))
    } catch {
      // idem
    }
    event.preventDefault()
    window.location.reload()
  })
}

// Errori che accompagnano un pezzo di codice mancante: il fallimento
// dell'import e, se l'evento e' stato intercettato, React.lazy che riceve un
// modulo vuoto.
const STALE_CHUNK_MESSAGE =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|reading 'default'/

// Vero subito dopo una ricarica avviata qui: Sentry non deve segnalare
// l'errore che la ricarica sta gia' risolvendo. Se persiste dopo la ricarica
// (oltre i 10 secondi), viene segnalato.
export function isStaleChunkNoise(message: string, now = Date.now()): boolean {
  if (!STALE_CHUNK_MESSAGE.test(message)) return false
  try {
    const stored = sessionStorage.getItem(KEY)
    return stored !== null && now - Number(stored) < 10_000
  } catch {
    return false
  }
}
