import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { positionCommand, StockfishEngine } from './stockfish-engine'

const START = '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1'

describe('positionCommand', () => {
  it('sends the moves played from the start position', () => {
    expect(positionCommand({ fen: START, moves: ['d1d8', 'g8h7'] })).toBe(
      `position fen ${START} moves d1d8 g8h7`,
    )
  })

  it('sends only the position when no move was played', () => {
    expect(positionCommand({ fen: START, moves: [] })).toBe(`position fen ${START}`)
  })
})

// Worker finto: registra i comandi UCI e risponde al protocollo di avvio.
class FakeWorker {
  static last: FakeWorker
  sent: string[] = []
  private listener: ((e: { data: string }) => void) | null = null
  constructor() {
    FakeWorker.last = this
  }
  addEventListener(_type: string, listener: (e: { data: string }) => void) {
    this.listener = listener
  }
  postMessage(command: string) {
    this.sent.push(command)
    if (command === 'uci') queueMicrotask(() => this.emit('uciok'))
    if (command === 'isready') queueMicrotask(() => this.emit('readyok'))
  }
  emit(line: string) {
    this.listener?.({ data: line })
  }
  terminate() {}
}

describe('StockfishEngine', () => {
  beforeEach(() => vi.stubGlobal('Worker', FakeWorker))
  afterEach(() => vi.unstubAllGlobals())

  it('analyses the position together with its move history', async () => {
    const engine = new StockfishEngine()
    await engine.analyze(
      { fen: START, moves: ['d1d8', 'g8h7'] },
      { multiPv: 2, depth: 12 },
      () => {},
    )

    expect(FakeWorker.last.sent.slice(-3)).toEqual([
      'setoption name MultiPV value 2',
      `position fen ${START} moves d1d8 g8h7`,
      'go depth 12',
    ])
  })

  it('restarts with the new history once the running search stops', async () => {
    const engine = new StockfishEngine()
    await engine.analyze({ fen: START, moves: [] }, { multiPv: 1, depth: 12 }, () => {})
    await engine.analyze(
      { fen: START, moves: ['d1d8'] },
      { multiPv: 1, depth: 12 },
      () => {},
    )
    expect(FakeWorker.last.sent.at(-1)).toBe('stop')

    FakeWorker.last.emit('bestmove d1d8')
    expect(FakeWorker.last.sent.slice(-2)).toEqual([
      `position fen ${START} moves d1d8`,
      'go depth 12',
    ])
  })
})
