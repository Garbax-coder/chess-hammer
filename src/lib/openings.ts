import type { CatalogNode, OpeningColor } from '@/lib/opening-catalog'
import type { OpeningNode, OpeningProgress } from '@/lib/opening-tree'
import { supabase } from '@/lib/supabase'

// Lettura e scrittura dell'allenamento sulle aperture (migrazioni 0100 e
// 0101). Il catalogo e' piccolo: un repertorio arriva intero, con tutte le
// sue mosse, in una richiesta.

export interface OpeningRepertoire {
  id: string
  slug: string
  name: string
  eco: string | null
  color: OpeningColor
  /** null per i repertori del catalogo; l'utente per quelli importati. */
  owner_id: string | null
}

export interface RepertoireWithNodes extends OpeningRepertoire {
  nodes: OpeningNode[]
}

const NODE_COLUMNS = 'id, parent_id, ply, uci, san, epd, is_main, comment'

/** Tutti i repertori leggibili, con le mosse (servono per la copertura). */
export async function fetchRepertoires(): Promise<RepertoireWithNodes[]> {
  const { data, error } = await supabase
    .from('opening_repertoires')
    .select(`id, slug, name, eco, color, owner_id, opening_nodes(${NODE_COLUMNS})`)
    .order('name')
  if (error) throw error
  return (data as (OpeningRepertoire & { opening_nodes: OpeningNode[] })[]).map(
    ({ opening_nodes, ...repertoire }) => ({ ...repertoire, nodes: opening_nodes }),
  )
}

/** I progressi dell'utente su tutte le mosse (la RLS limita alle sue righe). */
export async function fetchOpeningProgress(): Promise<OpeningProgress[]> {
  const { data, error } = await supabase
    .from('opening_node_progress')
    .select('node_id, attempts, first_try_correct, streak, last_seen_at, due_at')
  if (error) throw error
  return data
}

/** La prima risposta dell'utente a una sua mossa; restituisce il progresso aggiornato. */
export async function recordOpeningMove(params: {
  nodeId: number
  runLeafId: number
  playedUci: string
  result: 'correct' | 'alternative' | 'wrong'
  ms: number
}): Promise<OpeningProgress> {
  const { data, error } = await supabase.rpc('record_opening_move', {
    p_node_id: params.nodeId,
    p_run_leaf_id: params.runLeafId,
    p_played_uci: params.playedUci,
    p_result: params.result,
    p_ms: params.ms,
  })
  if (error) throw error
  return data as OpeningProgress
}

export interface OpeningNameRow {
  node_id: number
  eco: string
  name: string
}

/** I nomi delle mosse dei repertori leggibili (vista opening_node_names, 0102). */
export async function fetchOpeningNames(): Promise<OpeningNameRow[]> {
  const { data, error } = await supabase
    .from('opening_node_names')
    .select('node_id, eco, name')
  if (error) throw error
  return data
}

/** Una mossa studiata in modalita' Learn (migrazione 0103); restituisce il progresso. */
export async function learnOpeningMove(nodeId: number): Promise<OpeningProgress> {
  const { data, error } = await supabase.rpc('learn_opening_move', { p_node_id: nodeId })
  if (error) throw error
  return data as OpeningProgress
}

export interface OpeningCycle {
  id: string
  repertoire_id: string
  cycle: number
  lines: number
  moves: number
  correct: number
  total_ms: number
  started_at: string
  completed_at: string
}

/** I cicli Woodpecker completati su un repertorio (migrazione 0104), dal primo. */
export async function fetchOpeningCycles(repertoireId: string): Promise<OpeningCycle[]> {
  const { data, error } = await supabase
    .from('opening_cycles')
    .select(
      'id, repertoire_id, cycle, lines, moves, correct, total_ms, started_at, completed_at',
    )
    .eq('repertoire_id', repertoireId)
    .order('cycle')
  if (error) throw error
  return data
}

export async function saveOpeningCycle(params: {
  userId: string
  repertoireId: string
  cycle: number
  lines: number
  moves: number
  correct: number
  totalMs: number
  startedAt: string
}): Promise<OpeningCycle> {
  const { data, error } = await supabase
    .from('opening_cycles')
    .insert({
      user_id: params.userId,
      repertoire_id: params.repertoireId,
      cycle: params.cycle,
      lines: params.lines,
      moves: params.moves,
      correct: params.correct,
      total_ms: params.totalMs,
      started_at: params.startedAt,
    })
    .select(
      'id, repertoire_id, cycle, lines, moves, correct, total_ms, started_at, completed_at',
    )
    .single()
  if (error) throw error
  return data
}

/** Importa un repertorio personale (migrazione 0105); restituisce lo slug. */
export async function importOpeningRepertoire(params: {
  name: string
  color: OpeningColor
  nodes: CatalogNode[]
}): Promise<{ id: string; slug: string }> {
  const { data, error } = await supabase.rpc('import_opening_repertoire', {
    p_name: params.name,
    p_color: params.color,
    p_nodes: params.nodes.map((n) => ({
      path: n.path,
      parent_path: n.parentPath,
      ply: n.ply,
      uci: n.uci,
      san: n.san,
      epd: n.epd,
      is_main: n.isMain,
      comment: n.comment ?? null,
    })),
  })
  if (error) throw error
  return data as { id: string; slug: string }
}

/** Cancella un repertorio personale, con mosse, progressi e cicli. */
export async function deleteOpeningRepertoire(id: string): Promise<void> {
  const { error } = await supabase.from('opening_repertoires').delete().eq('id', id)
  if (error) throw error
}

/** I commenti personali dell'utente sulle mosse (migrazione 0106). */
export async function fetchOpeningNotes(): Promise<{ node_id: number; note: string }[]> {
  const { data, error } = await supabase
    .from('opening_node_notes')
    .select('node_id, note')
  if (error) throw error
  return data
}

/** Salva il commento personale su una mossa; null lo toglie. */
export async function saveOpeningNote(params: {
  userId: string
  nodeId: number
  note: string | null
}): Promise<void> {
  const { error } =
    params.note === null
      ? await supabase.from('opening_node_notes').delete().eq('node_id', params.nodeId)
      : await supabase.from('opening_node_notes').upsert({
          user_id: params.userId,
          node_id: params.nodeId,
          note: params.note,
          updated_at: new Date().toISOString(),
        })
  if (error) throw error
}
