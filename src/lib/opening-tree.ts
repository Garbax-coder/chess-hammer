import { colorAtPly, type OpeningColor } from '@/lib/opening-catalog'

// L'albero di un repertorio sul client: si carica tutto (poche centinaia di
// mosse) e qui si ricavano i Run, la scelta del prossimo da allenare e la
// copertura. Un Run e' il cammino dalla radice a una foglia e si identifica
// con l'id della foglia (vedi docs/opening-training.md).

export interface OpeningNode {
  id: number
  parent_id: number | null
  ply: number
  uci: string
  san: string
  epd: string
}

export interface OpeningProgress {
  node_id: number
  attempts: number
  first_try_correct: number
  streak: number
  last_seen_at: string | null
  due_at: string | null
}

export interface OpeningTree {
  byId: Map<number, OpeningNode>
  children: Map<number | null, OpeningNode[]>
  leaves: OpeningNode[]
}

export function buildOpeningTree(nodes: OpeningNode[]): OpeningTree {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const children = new Map<number | null, OpeningNode[]>()
  for (const node of nodes) {
    children.set(node.parent_id, [...(children.get(node.parent_id) ?? []), node])
  }
  for (const list of children.values()) list.sort((a, b) => a.id - b.id)
  // Le foglie nell'ordine dell'albero (dall'alto in basso), come si leggono
  // nella vista ad albero.
  const leaves: OpeningNode[] = []
  const visit = (parentId: number | null) => {
    for (const child of children.get(parentId) ?? []) {
      if (children.has(child.id)) visit(child.id)
      else leaves.push(child)
    }
  }
  visit(null)
  return { byId, children, leaves }
}

/** Le mosse di un Run, dalla prima alla foglia. */
export function runPath(tree: OpeningTree, leafId: number): OpeningNode[] {
  const path: OpeningNode[] = []
  let node = tree.byId.get(leafId)
  while (node) {
    path.unshift(node)
    node = node.parent_id === null ? undefined : tree.byId.get(node.parent_id)
  }
  return path
}

export function isUserMove(node: OpeningNode, color: OpeningColor): boolean {
  return colorAtPly(node.ply) === color
}

/** Una mossa e' consolidata dopo 3 risposte giuste al primo colpo di fila. */
export const MASTERED_STREAK = 3

export type MoveState = 'new' | 'due' | 'learning' | 'mastered'

export function moveState(progress: OpeningProgress | undefined, now: Date): MoveState {
  if (!progress) return 'new'
  if (progress.due_at && Date.parse(progress.due_at) <= now.getTime()) return 'due'
  return progress.streak >= MASTERED_STREAK ? 'mastered' : 'learning'
}

/**
 * Il prossimo Run da allenare: quello con piu' mosse dell'utente da fare
 * (in scadenza o mai viste); a parita', quello visto meno di recente. Il Run
 * appena giocato si evita, se ce n'e' un altro.
 */
export function chooseRun(
  tree: OpeningTree,
  progress: Map<number, OpeningProgress>,
  color: OpeningColor,
  now: Date,
  previousLeafId?: number,
): number | undefined {
  const candidates = tree.leaves.filter(
    (leaf) => tree.leaves.length === 1 || leaf.id !== previousLeafId,
  )
  let best: { leafId: number; pending: number; lastSeen: number } | undefined
  for (const leaf of candidates) {
    const userMoves = runPath(tree, leaf.id).filter((n) => isUserMove(n, color))
    const pending = userMoves.filter((n) => {
      const state = moveState(progress.get(n.id), now)
      return state === 'new' || state === 'due'
    }).length
    const lastSeen = Math.max(
      0,
      ...userMoves.map((n) => Date.parse(progress.get(n.id)?.last_seen_at ?? '') || 0),
    )
    if (
      !best ||
      pending > best.pending ||
      (pending === best.pending && lastSeen < best.lastSeen)
    ) {
      best = { leafId: leaf.id, pending, lastSeen }
    }
  }
  return best?.leafId
}

export interface OpeningCoverage {
  userMoves: number
  seen: number
  mastered: number
  due: number
  runs: number
  runsMastered: number
}

export function openingCoverage(
  tree: OpeningTree,
  progress: Map<number, OpeningProgress>,
  color: OpeningColor,
  now: Date,
): OpeningCoverage {
  const userNodes = [...tree.byId.values()].filter((n) => isUserMove(n, color))
  const states = new Map(userNodes.map((n) => [n.id, moveState(progress.get(n.id), now)]))
  const count = (state: MoveState) =>
    [...states.values()].filter((s) => s === state).length
  return {
    userMoves: userNodes.length,
    seen: userNodes.length - count('new'),
    mastered: count('mastered'),
    due: count('due'),
    runs: tree.leaves.length,
    runsMastered: tree.leaves.filter((leaf) =>
      runPath(tree, leaf.id)
        .filter((n) => isUserMove(n, color))
        .every((n) => states.get(n.id) === 'mastered'),
    ).length,
  }
}

/** La mossa giocata corrisponde a quella del repertorio (promozione compresa). */
export function sameMove(playedUci: string, expectedUci: string): boolean {
  return playedUci.toLowerCase() === expectedUci.toLowerCase()
}

/**
 * Le mosse da `node` in avanti finche' la linea non si dirama: nella vista ad
 * albero una catena di mosse senza alternative sta su una riga sola, e le
 * diramazioni dell'ultima mossa diventano rami annidati.
 */
export function chainFrom(tree: OpeningTree, node: OpeningNode): OpeningNode[] {
  const chain = [node]
  let children = tree.children.get(node.id) ?? []
  while (children.length === 1) {
    chain.push(children[0])
    children = tree.children.get(children[0].id) ?? []
  }
  return chain
}

/**
 * La mossa in notazione: "1.e4", "1...e5" quando una riga comincia con una
 * mossa del Nero, altrimenti solo "e5".
 */
export function moveLabel(node: OpeningNode, startsRow: boolean): string {
  const number = Math.ceil(node.ply / 2)
  if (node.ply % 2 === 1) return `${number}.${node.san}`
  return startsRow ? `${number}...${node.san}` : node.san
}

/** Padronanza di un Run: quante mosse dell'utente sono consolidate. */
export function runMastery(
  tree: OpeningTree,
  leafId: number,
  progress: Map<number, OpeningProgress>,
  color: OpeningColor,
  now: Date,
): { mastered: number; due: number; total: number } {
  const userMoves = runPath(tree, leafId).filter((n) => isUserMove(n, color))
  const states = userMoves.map((n) => moveState(progress.get(n.id), now))
  return {
    mastered: states.filter((s) => s === 'mastered').length,
    due: states.filter((s) => s === 'due').length,
    total: userMoves.length,
  }
}
