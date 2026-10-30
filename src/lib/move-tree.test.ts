import { describe, expect, it } from 'vitest'
import {
  addMoveNode,
  INITIAL_MOVE_NODES,
  moveTreeAsOpeningTree,
  pathFromRoot,
  ROOT_NODE_ID,
} from './move-tree'

describe('addMoveNode', () => {
  it('adds a new child under the given parent', () => {
    const { nodes, id } = addMoveNode(
      INITIAL_MOVE_NODES,
      ROOT_NODE_ID,
      'e2e4',
      'e4',
      'n1',
    )
    expect(id).toBe('n1')
    expect(nodes[ROOT_NODE_ID].children).toEqual(['n1'])
    expect(nodes.n1).toMatchObject({ parentId: ROOT_NODE_ID, uci: 'e2e4', san: 'e4' })
  })

  it('reuses an existing child with the same UCI move instead of duplicating it', () => {
    const first = addMoveNode(INITIAL_MOVE_NODES, ROOT_NODE_ID, 'e2e4', 'e4', 'n1')
    const second = addMoveNode(first.nodes, ROOT_NODE_ID, 'e2e4', 'e4', 'n2')

    expect(second.id).toBe('n1')
    expect(second.nodes[ROOT_NODE_ID].children).toEqual(['n1'])
    expect(second.nodes.n2).toBeUndefined()
  })

  it('does not mutate the input tree', () => {
    const before = JSON.parse(JSON.stringify(INITIAL_MOVE_NODES))
    addMoveNode(INITIAL_MOVE_NODES, ROOT_NODE_ID, 'e2e4', 'e4', 'n1')
    expect(INITIAL_MOVE_NODES).toEqual(before)
  })
})

describe('pathFromRoot', () => {
  it('returns the chain of moves from root (excluded) to the given node', () => {
    const step1 = addMoveNode(INITIAL_MOVE_NODES, ROOT_NODE_ID, 'e2e4', 'e4', 'n1')
    const step2 = addMoveNode(step1.nodes, 'n1', 'e7e5', 'e5', 'n2')

    const path = pathFromRoot(step2.nodes, 'n2')

    expect(path.map((n) => n.san)).toEqual(['e4', 'e5'])
  })

  it('returns an empty path for the root itself', () => {
    expect(pathFromRoot(INITIAL_MOVE_NODES, ROOT_NODE_ID)).toEqual([])
  })
})

describe('moveTreeAsOpeningTree', () => {
  function sample() {
    const first = addMoveNode(INITIAL_MOVE_NODES, ROOT_NODE_ID, 'a7a6', 'a6', 'n0')
    const second = addMoveNode(first.nodes, first.id, 'd1d8', 'Rd8', 'n1')
    return addMoveNode(second.nodes, first.id, 'e1e8', 'Re8', 'n2').nodes
  }

  it('numbers the plies from the side that starts, with the variations', () => {
    const { tree, toOpeningId, fromOpeningId } = moveTreeAsOpeningTree(sample(), 'b')
    const a6 = tree.byId.get(toOpeningId('n0')!)!
    expect(a6.ply).toBe(2)
    expect(a6.parent_id).toBeNull()
    expect(tree.children.get(a6.id)!.map((n) => n.san)).toEqual(['Rd8', 'Re8'])
    expect(fromOpeningId(a6.id)).toBe('n0')
    expect(toOpeningId(ROOT_NODE_ID)).toBeNull()
  })

  it('keeps the ids of the moves when a variation is added', () => {
    const before = moveTreeAsOpeningTree(sample(), 'w')
    const nodes = addMoveNode(sample(), 'n1', 'g8h7', 'Kh7', 'n3').nodes
    const after = moveTreeAsOpeningTree(nodes, 'w')
    for (const id of ['n0', 'n1', 'n2']) {
      expect(after.toOpeningId(id)).toBe(before.toOpeningId(id))
    }
  })
})
