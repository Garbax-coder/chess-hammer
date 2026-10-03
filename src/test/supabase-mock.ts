import { vi } from 'vitest'

export interface QueryResult<T = unknown> {
  data: T | null
  error: { message: string } | null
}

/**
 * Mock minimale del client Supabase per testare la logica di puzzle-engine.ts
 * (e simili) senza rete ne' DB reale. Ogni metodo della query-builder
 * (select/eq/in/order/update/insert/range) ritorna se stesso (e' "chainable"
 * come il client vero), ed e' anche thenable cosi' sia `await query` sia
 * `await query.single()` risolvono allo stesso risultato configurato.
 *
 * I risultati si accodano per tabella/rpc con `queueFrom`/`queueRpc`: ogni
 * chiamata successiva a `.from(table)` o `.rpc(name)` consuma il prossimo
 * risultato in coda per quella tabella/funzione, nello stesso ordine in cui
 * il codice sotto test le invoca (es. la prima select su session_puzzles e
 * la insert successiva sulla stessa tabella sono due voci separate in coda).
 */
export function createSupabaseMock() {
  const fromQueues = new Map<string, QueryResult[]>()
  const rpcQueues = new Map<string, QueryResult[]>()

  function queueFrom<T>(table: string, result: QueryResult<T>) {
    const queue = fromQueues.get(table) ?? []
    queue.push(result as QueryResult)
    fromQueues.set(table, queue)
  }

  function queueRpc<T>(name: string, result: QueryResult<T>) {
    const queue = rpcQueues.get(name) ?? []
    queue.push(result as QueryResult)
    rpcQueues.set(name, queue)
  }

  function makeBuilder(result: QueryResult): PromiseLike<QueryResult> & Record<string, any> {
    const resolved = Promise.resolve(result)
    const builder: Record<string, any> = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      in: vi.fn(() => builder),
      order: vi.fn(() => builder),
      update: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      range: vi.fn(() => builder),
      gte: vi.fn(() => builder),
      single: vi.fn(() => resolved),
      maybeSingle: vi.fn(() => resolved),
      then: resolved.then.bind(resolved),
      catch: resolved.catch.bind(resolved),
    }
    return builder as PromiseLike<QueryResult> & Record<string, any>
  }

  const from = vi.fn((table: string) => {
    const queue = fromQueues.get(table)
    const result = queue?.shift() ?? { data: null, error: null }
    return makeBuilder(result)
  })

  const rpc = vi.fn((name: string) => {
    const queue = rpcQueues.get(name)
    const result = queue?.shift() ?? { data: null, error: null }
    return Promise.resolve(result)
  })

  const supabase = { from, rpc }

  return { supabase, queueFrom, queueRpc }
}
