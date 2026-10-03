import { describe, expect, it } from 'vitest'
import {
  addMoveNode,
  INITIAL_MOVE_NODES,
  isWhiteMove,
  moveNumberFor,
  pathFromRoot,
  ROOT_NODE_ID,
} from './move-tree'

describe('addMoveNode', () => {
  it('adds a new child under the given parent', () => {
    const { nodes, id } = addMoveNode(INITIAL_MOVE_NODES, ROOT_NODE_ID, 'e2e4', 'e4', 'n1')
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

describe('isWhiteMove', () => {
  it('alternates starting from White', () => {
    expect(isWhiteMove(1, 'w')).toBe(true)
    expect(isWhiteMove(2, 'w')).toBe(false)
    expect(isWhiteMove(3, 'w')).toBe(true)
  })

  it('alternates starting from Black (puzzle solver plays Black)', () => {
    expect(isWhiteMove(1, 'b')).toBe(false)
    expect(isWhiteMove(2, 'b')).toBe(true)
  })
})

describe('moveNumberFor', () => {
  it('counts move pairs starting from White', () => {
    expect(moveNumberFor(1, 'w')).toBe(1)
    expect(moveNumberFor(2, 'w')).toBe(1)
    expect(moveNumberFor(3, 'w')).toBe(2)
  })

  it('counts move pairs starting from Black', () => {
    expect(moveNumberFor(1, 'b')).toBe(1)
    expect(moveNumberFor(2, 'b')).toBe(2)
    expect(moveNumberFor(3, 'b')).toBe(2)
    expect(moveNumberFor(4, 'b')).toBe(3)
  })
})
