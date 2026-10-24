import type { OpeningColor } from '@/lib/opening-catalog'
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
}

export interface RepertoireWithNodes extends OpeningRepertoire {
  nodes: OpeningNode[]
}

const NODE_COLUMNS = 'id, parent_id, ply, uci, san, epd'

/** Tutti i repertori leggibili, con le mosse (servono per la copertura). */
export async function fetchRepertoires(): Promise<RepertoireWithNodes[]> {
  const { data, error } = await supabase
    .from('opening_repertoires')
    .select(`id, slug, name, eco, color, opening_nodes(${NODE_COLUMNS})`)
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
  result: 'correct' | 'wrong'
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
