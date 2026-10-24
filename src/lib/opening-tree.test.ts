import { describe, expect, it } from 'vitest'
import {
  buildOpeningTree,
  chooseRun,
  moveState,
  openingCoverage,
  runPath,
  sameMove,
  type OpeningNode,
  type OpeningProgress,
} from './opening-tree'

// Repertorio del Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nf3 (Run 5).
function node(id: number, parent: number | null, ply: number, san: string): OpeningNode {
  return { id, parent_id: parent, ply, uci: san, san, epd: `epd-${id}` }
}
const nodes = [
  node(1, null, 1, 'e4'),
  node(2, 1, 2, 'e5'),
  node(3, 2, 3, 'Nf3'),
  node(4, 1, 2, 'c5'),
  node(5, 4, 3, 'Nf3'),
]
const tree = buildOpeningTree(nodes)
const now = new Date('2026-10-25T12:00:00Z')

function progress(
  nodeId: number,
  streak: number,
  dueAt: string,
  lastSeenAt = '2026-10-24T12:00:00Z',
): OpeningProgress {
  return {
    node_id: nodeId,
    attempts: streak,
    first_try_correct: streak,
    streak,
    last_seen_at: lastSeenAt,
    due_at: dueAt,
  }
}

describe('buildOpeningTree / runPath', () => {
  it('finds the Runs as the leaves, and their moves from the start', () => {
    expect(tree.leaves.map((l) => l.id)).toEqual([3, 5])
    expect(runPath(tree, 5).map((n) => n.san)).toEqual(['e4', 'c5', 'Nf3'])
  })
})

describe('moveState', () => {
  it('tells new, due, learning and mastered moves apart', () => {
    expect(moveState(undefined, now)).toBe('new')
    expect(moveState(progress(1, 0, '2026-10-25T11:00:00Z'), now)).toBe('due')
    expect(moveState(progress(1, 1, '2026-10-25T16:00:00Z'), now)).toBe('learning')
    expect(moveState(progress(1, 3, '2026-10-28T12:00:00Z'), now)).toBe('mastered')
  })
})

describe('chooseRun', () => {
  it('prefers the Run with more moves to do', () => {
    const done = new Map([
      [1, progress(1, 3, '2026-11-01T00:00:00Z')],
      [3, progress(3, 3, '2026-11-01T00:00:00Z')],
    ])
    // Run 3: tutto consolidato; Run 5: Nf3 mai visto.
    expect(chooseRun(tree, done, 'w', now)).toBe(5)
  })

  it('avoids the Run just played when there is another', () => {
    expect(chooseRun(tree, new Map(), 'w', now, 3)).toBe(5)
    expect(chooseRun(tree, new Map(), 'w', now, 5)).toBe(3)
  })

  it('with nothing to do, picks the Run seen least recently', () => {
    const later = '2026-11-01T00:00:00Z'
    const all = new Map([
      [1, progress(1, 3, later, '2026-10-24T10:00:00Z')],
      [3, progress(3, 3, later, '2026-10-24T11:00:00Z')],
      [5, progress(5, 3, later, '2026-10-20T10:00:00Z')],
    ])
    // Run 3: ultima mossa vista alle 11 (Nf3); Run 5: alle 10 (1.e4, in
    // comune; il suo Nf3 e' di giorni prima).
    expect(chooseRun(tree, all, 'w', now)).toBe(5)
    expect(chooseRun(tree, all, 'w', now, 5)).toBe(3)
  })
})

describe('openingCoverage', () => {
  it('counts the user moves and the Runs fully mastered', () => {
    const map = new Map([
      [1, progress(1, 3, '2026-11-01T00:00:00Z')],
      [3, progress(3, 4, '2026-11-01T00:00:00Z')],
      [5, progress(5, 0, '2026-10-25T10:00:00Z')],
    ])
    expect(openingCoverage(tree, map, 'w', now)).toEqual({
      userMoves: 3,
      seen: 3,
      mastered: 2,
      due: 1,
      runs: 2,
      runsMastered: 1,
    })
  })
})

describe('sameMove', () => {
  it('compares UCI moves, promotion included', () => {
    expect(sameMove('e7e8Q', 'e7e8q')).toBe(true)
    expect(sameMove('e7e8n', 'e7e8q')).toBe(false)
  })
})
