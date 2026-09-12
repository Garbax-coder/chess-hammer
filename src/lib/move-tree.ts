export interface MoveTreeNode {
  id: string
  parentId: string | null
  uci: string | null
  san: string | null
  children: string[]
}

export const ROOT_NODE_ID = 'root'

const ROOT_NODE: MoveTreeNode = {
  id: ROOT_NODE_ID,
  parentId: null,
  uci: null,
  san: null,
  children: [],
}

// Riferimento stabile (non un nuovo oggetto ad ogni render) da usare come
// albero delle mosse "effettivo" nel render in cui il puzzle e' appena
// cambiato, prima che il reset dello state sia stato applicato.
export const INITIAL_MOVE_NODES: Record<string, MoveTreeNode> = { [ROOT_NODE_ID]: ROOT_NODE }

/**
 * Aggiunge una mossa come figlio di parentId. Se un figlio con la stessa
 * mossa UCI esiste gia' (l'utente ha rigiocato una variante nota), viene
 * riutilizzato invece di crearne uno duplicato.
 */
export function addMoveNode(
  nodes: Record<string, MoveTreeNode>,
  parentId: string,
  uci: string,
  san: string,
  newId: string,
): { nodes: Record<string, MoveTreeNode>; id: string } {
  const parent = nodes[parentId]
  const existingId = parent.children.find((childId) => nodes[childId].uci === uci)
  if (existingId) return { nodes, id: existingId }

  const node: MoveTreeNode = { id: newId, parentId, uci, san, children: [] }
  return {
    nodes: {
      ...nodes,
      [parentId]: { ...parent, children: [...parent.children, newId] },
      [newId]: node,
    },
    id: newId,
  }
}

/** Percorso dalla radice (esclusa) fino al nodo dato. */
export function pathFromRoot(
  nodes: Record<string, MoveTreeNode>,
  id: string,
): MoveTreeNode[] {
  const path: MoveTreeNode[] = []
  let current: MoveTreeNode | undefined = nodes[id]
  while (current && current.parentId !== null) {
    path.unshift(current)
    current = nodes[current.parentId]
  }
  return path
}

export function isWhiteMove(ply: number, startTurn: 'w' | 'b'): boolean {
  return startTurn === 'w' ? ply % 2 === 1 : ply % 2 === 0
}

/** Numero di mossa "semplificato" (non usa il fullmove number della FEN). */
export function moveNumberFor(ply: number, startTurn: 'w' | 'b'): number {
  if (startTurn === 'w') return Math.ceil(ply / 2)
  return ply === 1 ? 1 : 1 + Math.ceil((ply - 1) / 2)
}
