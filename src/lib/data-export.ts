import { sinceIsoFor, type EloRange } from '@/lib/elo-history'
import { supabase } from '@/lib/supabase'

export type ExportFormat = 'json' | 'xlsx'

type Row = Record<string, unknown>

export interface UserExportData {
  exportedAt: string
  range: EloRange
  stats: Row | null
  sessions: Row[]
  puzzleAttempts: Row[]
  practiceAttempts: Row[]
  savedPuzzles: Row[]
  openingRepertoires: Row[]
  openingMoves: Row[]
  openingProgress: Row[]
  openingAttempts: Row[]
  openingCycles: Row[]
  openingNotes: Row[]
  hiddenOpeningRepertoires: Row[]
}

// PostgREST restituisce al massimo 1000 righe per richiesta: un utente con
// piu' sessioni completate supera facilmente quella soglia nei soli
// tentativi (200 puzzle x 3 giri = 600 per sessione), quindi si legge a
// pagine finche' una pagina non torna incompleta.
const PAGE_SIZE = 1000

async function fetchAllPages<T>(
  buildPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildPage(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    const page = data ?? []
    all.push(...page)
    if (page.length < PAGE_SIZE) return all
  }
}

interface RawPuzzleAttempt {
  round_number: number
  result: string
  time_seconds: number
  elo_before: number
  elo_after: number
  attempted_at: string
  session_puzzles: {
    session_id: string
    order_index: number
    puzzle_id: string
    lichess_puzzles: { rating: number; themes: string[] } | null
  } | null
}

interface RawPracticeAttempt {
  puzzle_id: string
  session_id: string | null
  result: string
  time_seconds: number
  attempted_at: string
  lichess_puzzles: { rating: number; themes: string[] } | null
}

// Una mossa di un repertorio, per riconoscerla nell'export: repertorio e
// mosse dalla posizione iniziale (percorso in UCI, es. "e2e4.e7e5").
interface RawNodeRef {
  path: string
  ply: number
  san: string
  opening_repertoires: { slug: string; name: string } | null
}

function nodeColumns(node: RawNodeRef | null) {
  return {
    repertoire_slug: node?.opening_repertoires?.slug ?? null,
    repertoire_name: node?.opening_repertoires?.name ?? null,
    path: node?.path ?? null,
    ply: node?.ply ?? null,
    san: node?.san ?? null,
  }
}

const NODE_REF = 'path, ply, san, opening_repertoires(slug, name)'

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

// I dati delle aperture: i repertori personali con le loro mosse, i
// progressi e i tentativi su ogni mossa (anche dei repertori del catalogo),
// i cicli, i commenti personali e i repertori del catalogo tolti dalla
// libreria. Il periodo scelto vale solo per i tentativi.
async function fetchOpeningExportData(userId: string, since: string | null) {
  const [repertoires, moves, progress, attempts, cycles, notes, hidden] =
    await Promise.all([
      fetchAllPages<Row>((from, to) =>
        supabase
          .from('opening_repertoires')
          .select('id, slug, name, eco, color, source, created_at')
          .eq('owner_id', userId)
          .order('created_at', { ascending: true })
          .range(from, to),
      ),
      fetchAllPages<Row & { opening_repertoires: unknown }>(
        (from, to) =>
          supabase
            .from('opening_nodes')
            .select(
              'repertoire_id, path, ply, san, uci, is_main, comment, opening_repertoires!inner(owner_id)',
            )
            .eq('opening_repertoires.owner_id', userId)
            .order('repertoire_id')
            .order('ply')
            .order('id')
            .range(from, to) as unknown as Page<Row & { opening_repertoires: unknown }>,
      ),
      fetchAllPages<Row & { opening_nodes: RawNodeRef | null }>(
        (from, to) =>
          supabase
            .from('opening_node_progress')
            .select(
              `attempts, first_try_correct, streak, last_seen_at, due_at, opening_nodes(${NODE_REF})`,
            )
            .order('node_id')
            .range(from, to) as unknown as Page<Row & { opening_nodes: RawNodeRef | null }>,
      ),
      fetchAllPages<Row & { node: RawNodeRef | null }>((from, to) => {
        let query = supabase
          .from('opening_attempts')
          .select(`created_at, played_uci, result, ms, node:opening_nodes!node_id(${NODE_REF})`)
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
        if (since) query = query.gte('created_at', since)
        return query.range(from, to) as unknown as Page<Row & { node: RawNodeRef | null }>
      }),
      fetchAllPages<Row & { opening_repertoires: { slug: string; name: string } | null }>(
        (from, to) =>
          supabase
            .from('opening_cycles')
            .select(
              'cycle, lines, moves, correct, total_ms, started_at, completed_at, opening_repertoires(slug, name)',
            )
            .order('completed_at', { ascending: true })
            .range(from, to) as unknown as Page<
            Row & { opening_repertoires: { slug: string; name: string } | null }
          >,
      ),
      fetchAllPages<Row & { opening_nodes: RawNodeRef | null }>(
        (from, to) =>
          supabase
            .from('opening_node_notes')
            .select(`note, updated_at, opening_nodes(${NODE_REF})`)
            .order('updated_at', { ascending: true })
            .range(from, to) as unknown as Page<Row & { opening_nodes: RawNodeRef | null }>,
      ),
      fetchAllPages<Row & { opening_repertoires: { slug: string; name: string } | null }>(
        (from, to) =>
          supabase
            .from('opening_hidden_repertoires')
            .select('hidden_at, opening_repertoires(slug, name)')
            .order('hidden_at', { ascending: true })
            .range(from, to) as unknown as Page<
            Row & { opening_repertoires: { slug: string; name: string } | null }
          >,
      ),
    ])

  const repertoire = (r: { slug: string; name: string } | null) => ({
    repertoire_slug: r?.slug ?? null,
    repertoire_name: r?.name ?? null,
  })
  return {
    openingRepertoires: repertoires,
    openingMoves: moves.map(({ opening_repertoires: _owner, ...move }) => move),
    openingProgress: progress.map(({ opening_nodes, ...row }) => ({
      ...nodeColumns(opening_nodes),
      ...row,
    })),
    openingAttempts: attempts.map(({ node, ...row }) => ({ ...nodeColumns(node), ...row })),
    openingCycles: cycles.map(({ opening_repertoires, ...row }) => ({
      ...repertoire(opening_repertoires),
      ...row,
    })),
    openingNotes: notes.map(({ opening_nodes, ...row }) => ({
      ...nodeColumns(opening_nodes),
      ...row,
    })),
    hiddenOpeningRepertoires: hidden.map(({ opening_repertoires, ...row }) => ({
      ...repertoire(opening_repertoires),
      ...row,
    })),
  }
}

// RLS su tutte queste tabelle restringe gia' alle sole righe dell'utente
// corrente (stesso schema di fetchEloHistory in elo-history.ts): il filtro
// esplicito su user_id serve solo dove le query esistenti lo fanno gia'
// (user_stats, training_sessions).
export async function fetchUserExportData(
  userId: string,
  range: EloRange,
): Promise<UserExportData> {
  const since = sinceIsoFor(range)

  const openingsPromise = fetchOpeningExportData(userId, since)
  const [statsResult, sessions, puzzleAttempts, practiceAttempts, savedPuzzles] = await Promise.all([
    supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle(),
    fetchAllPages<Row>((from, to) =>
      supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to),
    ),
    fetchAllPages<RawPuzzleAttempt>((from, to) => {
      let query = supabase
        .from('puzzle_attempts')
        .select(
          'round_number, result, time_seconds, elo_before, elo_after, attempted_at, session_puzzles(session_id, order_index, puzzle_id, lichess_puzzles(rating, themes))',
        )
        .order('attempted_at', { ascending: false })
        .order('id', { ascending: true })
      if (since) query = query.gte('attempted_at', since)
      return query.range(from, to) as unknown as PromiseLike<{
        data: RawPuzzleAttempt[] | null
        error: { message: string } | null
      }>
    }),
    fetchAllPages<RawPracticeAttempt>((from, to) => {
      let query = supabase
        .from('practice_attempts')
        .select(
          'puzzle_id, session_id, result, time_seconds, attempted_at, lichess_puzzles(rating, themes)',
        )
        .order('attempted_at', { ascending: false })
        .order('id', { ascending: true })
      if (since) query = query.gte('attempted_at', since)
      return query.range(from, to) as unknown as PromiseLike<{
        data: RawPracticeAttempt[] | null
        error: { message: string } | null
      }>
    }),
    // Tutti, qualunque sia il periodo: e' una lista, non uno storico.
    fetchAllPages<Row>((from, to) =>
      supabase
        .from('saved_puzzles')
        .select('puzzle_id, created_at')
        .order('created_at', { ascending: false })
        .range(from, to),
    ),
  ])
  if (statsResult.error) throw new Error(statsResult.error.message)
  const openings = await openingsPromise

  return {
    exportedAt: new Date().toISOString(),
    range,
    stats: statsResult.data,
    sessions,
    // Appiattiti (niente oggetti annidati) cosi' lo stesso formato serve sia
    // al JSON che ai fogli Excel, dove una cella non puo' contenere un oggetto.
    puzzleAttempts: puzzleAttempts.map((a) => ({
      attempted_at: a.attempted_at,
      session_id: a.session_puzzles?.session_id ?? null,
      order_index: a.session_puzzles?.order_index ?? null,
      puzzle_id: a.session_puzzles?.puzzle_id ?? null,
      puzzle_rating: a.session_puzzles?.lichess_puzzles?.rating ?? null,
      puzzle_themes: a.session_puzzles?.lichess_puzzles?.themes ?? [],
      round_number: a.round_number,
      result: a.result,
      time_seconds: a.time_seconds,
      elo_before: a.elo_before,
      elo_after: a.elo_after,
    })),
    practiceAttempts: practiceAttempts.map((a) => ({
      attempted_at: a.attempted_at,
      session_id: a.session_id,
      puzzle_id: a.puzzle_id,
      puzzle_rating: a.lichess_puzzles?.rating ?? null,
      puzzle_themes: a.lichess_puzzles?.themes ?? [],
      result: a.result,
      time_seconds: a.time_seconds,
    })),
    savedPuzzles,
    ...openings,
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Una cella Excel non puo' contenere un array: le liste (temi) diventano
// testo separato da virgole.
function flattenArraysForSheet(rows: Row[]): Row[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(', ') : value,
      ]),
    ),
  )
}

export async function downloadUserData(
  userId: string,
  range: EloRange,
  format: ExportFormat,
): Promise<void> {
  const data = await fetchUserExportData(userId, range)
  const day = data.exportedAt.slice(0, 10)
  const baseName = `chess-hammer-dati-${range}-${day}`

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    triggerDownload(blob, `${baseName}.json`)
    return
  }

  // Import dinamico: SheetJS e' pesante e serve solo qui, non deve finire
  // nel bundle principale caricato da ogni pagina.
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  const sheets: [string, Row[]][] = [
    ['stats', data.stats ? [data.stats] : []],
    ['sessions', data.sessions],
    ['puzzle_attempts', data.puzzleAttempts],
    ['practice_attempts', data.practiceAttempts],
    ['saved_puzzles', data.savedPuzzles],
    ['opening_repertoires', data.openingRepertoires],
    ['opening_moves', data.openingMoves],
    ['opening_progress', data.openingProgress],
    ['opening_attempts', data.openingAttempts],
    ['opening_cycles', data.openingCycles],
    ['opening_notes', data.openingNotes],
    ['opening_hidden', data.hiddenOpeningRepertoires],
  ]
  for (const [name, rows] of sheets) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(flattenArraysForSheet(rows)),
      name,
    )
  }
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  triggerDownload(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `${baseName}.xlsx`,
  )
}
