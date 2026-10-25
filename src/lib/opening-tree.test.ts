import { describe, expect, it } from 'vitest'
import {
  alternativesTo,
  buildOpeningTree,
  chainFrom,
  chooseLearnRun,
  chooseRun,
  commentOf,
  fastForwardIndex,
  mistakeLine,
  mistakesAt,
  moveLabel,
  moveState,
  nameAt,
  nameChange,
  openingCoverage,
  runMastery,
  runPath,
  sameMove,
  type OpeningNode,
  type OpeningProgress,
} from './opening-tree'

// Repertorio del Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nf3 (Run 5).
function node(id: number, parent: number | null, ply: number, san: string): OpeningNode {
  return { id, parent_id: parent, ply, uci: san, san, epd: `epd-${id}`, is_main: true }
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
  it('lists the Runs in the order of the tree, not of their ids', () => {
    const shuffled = buildOpeningTree([
      node(1, null, 1, 'e4'),
      node(9, 1, 2, 'e5'),
      node(4, 9, 3, 'Nf3'),
      node(2, 1, 2, 'c5'),
      node(3, 2, 3, 'Nf3'),
    ])
    // Fratelli per id (c5 = 2 prima di e5 = 9), poi in profondita'.
    expect(shuffled.leaves.map((l) => l.id)).toEqual([3, 4])
  })

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

  it('avoids the Runs already played in the session while there are others', () => {
    expect(chooseRun(tree, new Map(), 'w', now, new Set([3]))).toBe(5)
    expect(chooseRun(tree, new Map(), 'w', now, new Set([5]))).toBe(3)
    // Tutti gia' giocati: si sceglie comunque.
    expect(chooseRun(tree, new Map(), 'w', now, new Set([3, 5]))).toBe(3)
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
    expect(chooseRun(tree, all, 'w', now, new Set([5]))).toBe(3)
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

describe('chainFrom / moveLabel', () => {
  it('follows a line until it branches', () => {
    // 1.e4 si dirama subito (e5 / c5): la catena e' solo 1.e4.
    expect(chainFrom(tree, tree.byId.get(1)!).map((n) => n.id)).toEqual([1])
    expect(chainFrom(tree, tree.byId.get(2)!).map((n) => n.id)).toEqual([2, 3])
  })

  it('numbers White moves, and Black moves that start a row', () => {
    expect(moveLabel(tree.byId.get(1)!, true)).toBe('1.e4')
    expect(moveLabel(tree.byId.get(2)!, true)).toBe('1...e5')
    expect(moveLabel(tree.byId.get(2)!, false)).toBe('e5')
    expect(moveLabel(tree.byId.get(3)!, false)).toBe('2.Nf3')
  })
})

describe('runMastery', () => {
  it('counts the user moves of one Run', () => {
    const map = new Map([
      [1, progress(1, 3, '2026-11-01T00:00:00Z')],
      [5, progress(5, 0, '2026-10-25T10:00:00Z')],
    ])
    expect(runMastery(tree, 5, map, 'w', now)).toEqual({
      mastered: 1,
      due: 1,
      new: 0,
      total: 2,
    })
    expect(runMastery(tree, 3, map, 'w', now)).toEqual({
      mastered: 1,
      due: 0,
      new: 1,
      total: 2,
    })
  })
})

describe('nameAt / nameChange', () => {
  // 1.e4 (King's Pawn Game) e5 2.Nf3 (Italian Game: Classical Variation)
  // e 1...c5 (Sicilian Defense) 2.Nc3 (Sicilian Defense: Closed).
  const names = new Map([
    [1, { eco: 'B00', name: "King's Pawn Game" }],
    [3, { eco: 'C53', name: 'Italian Game: Classical Variation' }],
    [4, { eco: 'B20', name: 'Sicilian Defense' }],
    [5, { eco: 'B23', name: 'Sicilian Defense: Closed' }],
  ])

  it('takes the name of the last named move on the way', () => {
    expect(nameAt(tree, 2, names)?.name).toBe("King's Pawn Game")
    expect(nameAt(tree, 5, names)?.eco).toBe('B23')
    expect(nameAt(tree, null, names)).toBeUndefined()
  })

  it('writes only what is new, the full name when the family changes', () => {
    const n = (id: number) => tree.byId.get(id)!
    expect(nameChange(tree, n(1), names)).toBe("King's Pawn Game")
    expect(nameChange(tree, n(2), names)).toBeUndefined()
    expect(nameChange(tree, n(3), names)).toBe('Italian Game: Classical Variation')
    expect(nameChange(tree, n(4), names)).toBe('Sicilian Defense')
    expect(nameChange(tree, n(5), names)).toBe('Closed')

    const deeper = new Map([
      [1, { eco: 'C53', name: 'Italian Game: Classical Variation' }],
      [2, { eco: 'C54', name: 'Italian Game: Classical Variation, Greco Gambit' }],
      [3, { eco: 'C50', name: 'Italian Game: Giuoco Piano' }],
      [4, { eco: 'C53', name: 'Italian Game' }],
    ])
    expect(nameChange(tree, n(2), deeper)).toBe('Greco Gambit')
    expect(nameChange(tree, n(3), deeper)).toBe('Giuoco Piano')
    // Piu' generico del nome di prima: niente da aggiungere.
    expect(nameChange(tree, n(4), deeper)).toBeUndefined()
  })
})

describe('chooseLearnRun', () => {
  it('picks the first line in tree order with moves never seen', () => {
    expect(chooseLearnRun(tree, new Map(), 'w')).toBe(3)
    const learned = new Map([
      [1, progress(1, 0, '2026-10-25T16:00:00Z')],
      [3, progress(3, 0, '2026-10-25T16:00:00Z')],
    ])
    expect(chooseLearnRun(tree, learned, 'w')).toBe(5)
    expect(chooseLearnRun(tree, new Map(), 'w', 3)).toBe(5)
    learned.set(5, progress(5, 0, '2026-10-25T16:00:00Z'))
    expect(chooseLearnRun(tree, learned, 'w')).toBeUndefined()
  })
})

describe('fastForwardIndex', () => {
  const path = runPath(tree, 3) // 1.e4 e5 2.Nf3
  it('starts from the first user move not yet known', () => {
    expect(fastForwardIndex(path, 'w', () => false)).toBe(0)
    expect(fastForwardIndex(path, 'w', (n) => n.id === 1)).toBe(2)
  })

  it('keeps at least the last user move to ask', () => {
    expect(fastForwardIndex(path, 'w', () => true)).toBe(2)
  })

  it('also for Black, whose first move comes after the opponent', () => {
    expect(fastForwardIndex(path, 'b', () => false)).toBe(1)
  })
})

describe('alternativesTo', () => {
  it('finds the accepted alternatives in the same position', () => {
    const withAlternative = buildOpeningTree([
      ...nodes,
      { ...node(6, 2, 3, 'Bc4'), is_main: false },
    ])
    expect(
      alternativesTo(withAlternative, withAlternative.byId.get(3)!).map((n) => n.san),
    ).toEqual(['Bc4'])
    // Non e' un Run, e non conta tra le mosse da allenare.
    expect(withAlternative.leaves.map((l) => l.id)).toEqual([3, 5])
    expect(openingCoverage(withAlternative, new Map(), 'w', now).userMoves).toBe(3)
  })

  it('accepts the moves that open other lines from the same position', () => {
    const branched = buildOpeningTree([...nodes, node(6, 2, 3, 'Bc4')])
    expect(alternativesTo(branched, branched.byId.get(3)!).map((n) => n.san)).toEqual([
      'Bc4',
    ])
    expect(alternativesTo(branched, branched.byId.get(6)!).map((n) => n.san)).toEqual([
      'Nf3',
    ])
    expect(branched.leaves.map((l) => l.id)).toEqual([3, 6, 5])
  })
})

describe('commentOf', () => {
  it('prefers the personal note, and an empty one hides the original comment', () => {
    const withComment = { ...node(9, null, 1, 'd4'), comment: 'From the PGN' }
    expect(commentOf(withComment, new Map())).toBe('From the PGN')
    expect(commentOf(withComment, new Map([[9, 'Mine']]))).toBe('Mine')
    expect(commentOf(withComment, new Map([[9, '']]))).toBeUndefined()
    expect(commentOf(node(1, null, 1, 'e4'), new Map())).toBeUndefined()
  })
})

describe('wrong lines', () => {
  // 1.e4 e5 2.Nf3 | 2.Qh5? (segnata) Nc6 3.Bc4 Nf6 | 1...c5 2.Nf3
  const withMistake = buildOpeningTree([
    ...nodes,
    { ...node(6, 2, 3, 'Qh5'), is_mistake: true },
    node(7, 6, 4, 'Nc6'),
    node(8, 7, 5, 'Bc4'),
    node(9, 8, 6, 'Nf6'),
  ])

  it('keeps a wrong line, with all it leads to, out of training', () => {
    expect([...withMistake.mistakes].sort()).toEqual([6, 7, 8, 9])
    expect(withMistake.leaves.map((l) => l.id)).toEqual([3, 5])
    expect(openingCoverage(withMistake, new Map(), 'w', now).userMoves).toBe(3)
    // Giocata nel Drill non e' un'alternativa accettata.
    expect(alternativesTo(withMistake, withMistake.byId.get(3)!)).toEqual([])
  })

  it('finds the wrong lines from a position and their main continuation', () => {
    expect(mistakesAt(withMistake, 2).map((n) => n.san)).toEqual(['Qh5'])
    expect(mistakesAt(withMistake, 1)).toEqual([])
    expect(mistakeLine(withMistake, withMistake.byId.get(6)!).map((n) => n.san)).toEqual([
      'e4',
      'e5',
      'Qh5',
      'Nc6',
      'Bc4',
      'Nf6',
    ])
  })
})
