import { buildOpeningTree, type OpeningNode, type OpeningTree } from '@/lib/opening-tree'

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
export const INITIAL_MOVE_NODES: Record<string, MoveTreeNode> = {
  [ROOT_NODE_ID]: ROOT_NODE,
}

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

/**
 * L'albero delle mosse di un puzzle nella forma della vista ad albero delle
 * aperture. Gli id numerici seguono l'ordine di inserimento dei nodi, che
 * crescono soltanto: restano stabili mentre si aggiungono varianti.
 */
export function moveTreeAsOpeningTree(
  nodes: Record<string, MoveTreeNode>,
  startTurn: 'w' | 'b',
): {
  tree: OpeningTree
  toOpeningId: (id: string) => number | null
  fromOpeningId: (id: number) => string
} {
  const keys = Object.keys(nodes).filter((id) => id !== ROOT_NODE_ID)
  const numbers = new Map(keys.map((id, index) => [id, index + 1]))
  const list: OpeningNode[] = []
  // Il ply delle aperture conta dalla prima mossa del Bianco.
  const visit = (id: string, parentId: number | null, ply: number) => {
    for (const childId of nodes[id].children) {
      const node = nodes[childId]
      const number = numbers.get(childId) as number
      list.push({
        id: number,
        parent_id: parentId,
        ply,
        uci: node.uci ?? '',
        san: node.san ?? '',
        epd: '',
        is_main: true,
      })
      visit(childId, number, ply + 1)
    }
  }
  visit(ROOT_NODE_ID, null, startTurn === 'b' ? 2 : 1)
  return {
    tree: buildOpeningTree(list),
    toOpeningId: (id) => numbers.get(id) ?? null,
    fromOpeningId: (id) => keys[id - 1],
  }
}
