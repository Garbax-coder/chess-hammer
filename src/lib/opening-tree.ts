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
  /** False per un'alternativa accettata: valida nel Drill, mai allenata. */
  is_main: boolean
  /** Commento della mossa (es. dal PGN importato). */
  comment?: string | null
  /**
   * L'inizio di una linea sbagliata (migrazione 0110): con il suo seguito
   * resta fuori dall'allenamento, e lo studio la mostra come errore da
   * evitare.
   */
  is_mistake?: boolean
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
  /** Le mosse delle linee sbagliate: quelle segnate e tutto il loro seguito. */
  mistakes: ReadonlySet<number>
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
      // Le alternative non hanno seguito e non sono Run, come le linee
      // sbagliate.
      if (!child.is_main || child.is_mistake) continue
      if (children.has(child.id)) visit(child.id)
      else leaves.push(child)
    }
  }
  visit(null)
  const mistakes = new Set<number>()
  const mark = (node: OpeningNode) => {
    mistakes.add(node.id)
    for (const child of children.get(node.id) ?? []) mark(child)
  }
  for (const node of nodes) if (node.is_mistake) mark(node)
  return { byId, children, leaves, mistakes }
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
 * (in scadenza o mai viste); a parita', quello visto meno di recente. I Run
 * in `exclude` (gia' giocati nella sessione) si evitano, finche' ce ne sono
 * altri.
 */
export function chooseRun(
  tree: OpeningTree,
  progress: Map<number, OpeningProgress>,
  color: OpeningColor,
  now: Date,
  exclude: ReadonlySet<number> = new Set(),
): number | undefined {
  const fresh = tree.leaves.filter((leaf) => !exclude.has(leaf.id))
  const candidates = fresh.length > 0 ? fresh : tree.leaves
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

/**
 * Avanzamento rapido del tronco: da quale mossa del Run comincia la domanda.
 * Le mosse prima della prima mossa dell'utente non ancora nota (`isKnown`:
 * consolidata nell'allenamento, gia' vista nello studio) si giocano da sole.
 * Se l'utente le conosce tutte si parte dalla sua ultima mossa: il Run non
 * resta mai senza domande.
 */
export function fastForwardIndex(
  path: OpeningNode[],
  color: OpeningColor,
  isKnown: (node: OpeningNode) => boolean,
): number {
  const userIndexes = path.flatMap((n, i) => (isUserMove(n, color) ? [i] : []))
  if (userIndexes.length === 0) return 0
  return userIndexes.find((i) => !isKnown(path[i])) ?? userIndexes[userIndexes.length - 1]
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
  const userNodes = [...tree.byId.values()].filter(
    (n) => n.is_main && !tree.mistakes.has(n.id) && isUserMove(n, color),
  )
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
): { mastered: number; due: number; new: number; total: number } {
  const userMoves = runPath(tree, leafId).filter((n) => isUserMove(n, color))
  const states = userMoves.map((n) => moveState(progress.get(n.id), now))
  return {
    mastered: states.filter((s) => s === 'mastered').length,
    due: states.filter((s) => s === 'due').length,
    new: states.filter((s) => s === 'new').length,
    total: userMoves.length,
  }
}

/**
 * La prossima linea da studiare in modalita' Learn: la prima, nell'ordine
 * dell'albero, con mosse dell'utente mai viste (saltando `skipLeafId`, la
 * linea appena studiata, le cui ultime mosse possono essere ancora in
 * salvataggio). Undefined se sono state studiate tutte.
 */
export function chooseLearnRun(
  tree: OpeningTree,
  progress: Map<number, OpeningProgress>,
  color: OpeningColor,
  skipLeafId?: number,
): number | undefined {
  return tree.leaves.find(
    (leaf) =>
      leaf.id !== skipLeafId &&
      runPath(tree, leaf.id).some((n) => isUserMove(n, color) && !progress.has(n.id)),
  )?.id
}

export interface OpeningName {
  eco: string
  name: string
}

/** Il nome della posizione dopo una mossa: quello dell'ultima mossa con nome lungo il percorso. */
export function nameAt(
  tree: OpeningTree,
  nodeId: number | null,
  names: Map<number, OpeningName>,
): OpeningName | undefined {
  let node = nodeId === null ? undefined : tree.byId.get(nodeId)
  while (node) {
    const name = names.get(node.id)
    if (name) return name
    node = node.parent_id === null ? undefined : tree.byId.get(node.parent_id)
  }
  return undefined
}

/** "Italian Game: Classical Variation, Greco Gambit" -> famiglia e varianti. */
function nameParts(name: string): string[] {
  const [family, variations] = name.split(/:\s*/, 2)
  return [family, ...(variations ? variations.split(/,\s*/) : [])]
}

/**
 * Nell'albero: il nome da scrivere accanto a una mossa, se con lei il nome
 * cambia. Si scrive solo la parte nuova rispetto al nome di prima ("Italian
 * Game: Classical Variation" -> "..., Greco Gambit" diventa "Greco Gambit");
 * il nome intero quando cambia la famiglia. Un nome piu' generico di quello
 * di prima non aggiunge nulla e non si scrive.
 */
export function nameChange(
  tree: OpeningTree,
  node: OpeningNode,
  names: Map<number, OpeningName>,
): string | undefined {
  const name = names.get(node.id)?.name
  if (!name) return undefined
  const before = nameAt(tree, node.parent_id, names)?.name
  if (!before) return name
  const parts = nameParts(name)
  const previous = nameParts(before)
  let common = 0
  while (common < parts.length && parts[common] === previous[common]) common++
  if (common === 0) return name
  const rest = parts.slice(common)
  return rest.length > 0 ? rest.join(', ') : undefined
}

/**
 * Le mosse accettate al posto di `node` (stessa posizione): le alternative e
 * le mosse che aprono altre linee del repertorio. In questa linea si chiede
 * comunque `node`.
 */
export function alternativesTo(tree: OpeningTree, node: OpeningNode): OpeningNode[] {
  return (tree.children.get(node.parent_id) ?? []).filter(
    (n) => n.id !== node.id && !n.is_mistake,
  )
}

/** Le linee sbagliate che partono dalla posizione dopo `parentId`. */
export function mistakesAt(tree: OpeningTree, parentId: number | null): OpeningNode[] {
  return (tree.children.get(parentId) ?? []).filter((n) => n.is_mistake)
}

/**
 * Una linea sbagliata da mostrare: dalla prima mossa fino alla mossa
 * sbagliata, poi il suo seguito principale (il primo ramo a ogni bivio).
 */
export function mistakeLine(tree: OpeningTree, mistake: OpeningNode): OpeningNode[] {
  const line = runPath(tree, mistake.id)
  for (
    let next = (tree.children.get(mistake.id) ?? [])[0];
    next;
    next = (tree.children.get(next.id) ?? [])[0]
  ) {
    line.push(next)
  }
  return line
}

/**
 * Il commento da mostrare su una mossa: quello personale dell'utente se c'e'
 * (anche vuoto: nasconde l'originale), altrimenti quello della mossa (PGN).
 */
export function commentOf(
  node: OpeningNode,
  notes: Map<number, string>,
): string | undefined {
  const text = notes.has(node.id) ? notes.get(node.id) : node.comment
  return text?.trim() || undefined
}
