// Wrapper attorno alla build "lite single-threaded" di Stockfish (WASM, Web
// Worker): non richiede gli header COOP/COEP necessari per la variante
// multi-thread (SharedArrayBuffer), quindi funziona su hosting statico
// standard (Vercel) senza configurazione aggiuntiva. Il worker viene creato
// solo alla prima analisi richiesta (non appesantisce il caricamento
// iniziale della pagina: il file .wasm pesa ~7MB).

// Servito con cache immutabile di un anno (vercel.json): una nuova versione
// del motore deve avere un nome di file nuovo, non sovrascrivere questo.
const WORKER_URL = '/stockfish/stockfish-18-lite-single.js'

export interface EngineLine {
  multiPv: number
  depth: number
  scoreCp: number | null
  scoreMate: number | null
  /** Mosse della linea principale, in UCI (es. "e2e4"). */
  pvUci: string[]
}

export type EngineListener = (lines: EngineLine[], done: boolean) => void

/**
 * Posizione da analizzare: la posizione di partenza e le mosse (UCI) giocate
 * da li'. Con le mosse Stockfish conosce le posizioni gia' viste e conta le
 * ripetizioni come in una partita: chi e' in vantaggio non torna su una
 * posizione gia' ripetuta (sarebbe patta), mentre con la sola posizione
 * finale ogni posizione gli sembrerebbe nuova.
 */
export interface EnginePosition {
  fen: string
  moves: string[]
}

/** Comando UCI "position" per una posizione con la sua cronologia. */
export function positionCommand({ fen, moves }: EnginePosition): string {
  return moves.length > 0
    ? `position fen ${fen} moves ${moves.join(' ')}`
    : `position fen ${fen}`
}

interface PendingRequest {
  position: EnginePosition
  multiPv: number
  depth: number
}

function parseInfoLine(line: string): EngineLine | null {
  if (!line.startsWith('info') || !line.includes(' pv ')) return null
  const depthMatch = line.match(/\bdepth (\d+)/)
  const multiPvMatch = line.match(/\bmultipv (\d+)/)
  const pvMatch = line.match(/\bpv (.+)$/)
  if (!depthMatch || !pvMatch) return null
  const cpMatch = line.match(/\bscore cp (-?\d+)/)
  const mateMatch = line.match(/\bscore mate (-?\d+)/)
  return {
    depth: Number(depthMatch[1]),
    multiPv: multiPvMatch ? Number(multiPvMatch[1]) : 1,
    scoreCp: cpMatch ? Number(cpMatch[1]) : null,
    scoreMate: mateMatch ? Number(mateMatch[1]) : null,
    pvUci: pvMatch[1].trim().split(/\s+/),
  }
}

class StockfishEngine {
  private worker: Worker | null = null
  private initialized = false
  private initResolvers: (() => void)[] = []
  private currentLines = new Map<number, EngineLine>()
  private listener: EngineListener | null = null
  private busy = false
  private pendingRequest: PendingRequest | null = null

  private ensureWorker(): Worker {
    if (this.worker) return this.worker
    const worker = new Worker(WORKER_URL)
    worker.addEventListener('message', (e) => this.handleMessage(String(e.data)))
    worker.postMessage('uci')
    this.worker = worker
    return worker
  }

  private waitUntilReady(): Promise<void> {
    this.ensureWorker()
    if (this.initialized) return Promise.resolve()
    return new Promise((resolve) => this.initResolvers.push(resolve))
  }

  private handleMessage(line: string) {
    if (line === 'uciok') {
      this.ensureWorker().postMessage('isready')
      return
    }
    if (line === 'readyok') {
      if (!this.initialized) {
        this.initialized = true
        this.initResolvers.forEach((resolve) => resolve())
        this.initResolvers = []
      }
      return
    }
    const parsed = parseInfoLine(line)
    if (parsed) {
      this.currentLines.set(parsed.multiPv, parsed)
      this.listener?.(this.sortedLines(), false)
      return
    }
    if (line.startsWith('bestmove')) {
      this.busy = false
      if (this.pendingRequest) {
        const req = this.pendingRequest
        this.pendingRequest = null
        this.startAnalysis(req.position, req.multiPv, req.depth)
      } else {
        this.listener?.(this.sortedLines(), true)
      }
    }
  }

  private sortedLines(): EngineLine[] {
    return Array.from(this.currentLines.values()).sort((a, b) => a.multiPv - b.multiPv)
  }

  private startAnalysis(position: EnginePosition, multiPv: number, depth: number) {
    this.busy = true
    const worker = this.ensureWorker()
    worker.postMessage(`setoption name MultiPV value ${multiPv}`)
    worker.postMessage(positionCommand(position))
    worker.postMessage(`go depth ${depth}`)
  }

  /**
   * Avvia (o riavvia) l'analisi della posizione raggiunta giocando `moves`
   * da `fen`; onUpdate riceve le linee correnti ad ogni aggiornamento.
   */
  async analyze(
    position: EnginePosition,
    options: { multiPv: number; depth: number },
    onUpdate: EngineListener,
  ) {
    this.listener = onUpdate
    this.currentLines.clear()
    await this.waitUntilReady()
    if (this.busy) {
      this.pendingRequest = { position, ...options }
      this.ensureWorker().postMessage('stop')
    } else {
      this.startAnalysis(position, options.multiPv, options.depth)
    }
  }

  /** Smette di notificare il chiamante corrente (l'engine puo' restare in esecuzione finche' non arriva bestmove). */
  stopListening() {
    this.listener = null
  }

  terminate() {
    this.worker?.terminate()
    this.worker = null
    this.initialized = false
    this.busy = false
    this.pendingRequest = null
    this.listener = null
    this.currentLines.clear()
  }
}

export { StockfishEngine }
export const stockfishEngine = new StockfishEngine()
