import { describe, expect, it } from 'vitest'
import { buildOpeningTree, type OpeningNode } from './opening-tree'
import { repertoirePgn } from './opening-pgn'
import { buildRepertoire } from './opening-catalog'
import { pgnLines } from './pgn-lines'

function node(
  id: number,
  parent: number | null,
  ply: number,
  san: string,
  extra: Partial<OpeningNode> = {},
): OpeningNode {
  return {
    id,
    parent_id: parent,
    ply,
    uci: san,
    san,
    epd: `epd-${id}`,
    is_main: true,
    ...extra,
  }
}

// 1.e4 e5 2.Nf3 (2.Bc4 accettata) (2.Qh5? Nc6) Nc6 ; 1...c5 2.Nf3
const tree = buildOpeningTree([
  node(1, null, 1, 'e4'),
  node(2, 1, 2, 'e5'),
  node(3, 2, 3, 'Nf3'),
  node(4, 3, 4, 'Nc6'),
  node(5, 1, 2, 'c5'),
  node(6, 5, 3, 'Nf3'),
  node(7, 2, 3, 'Qh5', { is_mistake: true }),
  node(8, 7, 4, 'Nc6'),
  node(9, 2, 3, 'Bc4', { is_main: false }),
])

describe('repertoirePgn', () => {
  const pgn = repertoirePgn({
    name: 'Italian "mine"',
    eco: 'C50',
    color: 'w',
    tree,
    comments: new Map([
      [3, 'Il cavallo {prima}'],
      [7, 'Troppo presto'],
    ]),
    arrows: new Map([[3, [{ from: 'f1', to: 'c4', color: 'G' }]]]),
    date: new Date('2026-10-25T12:00:00Z'),
  })

  it('writes the tags, the variations, comments with arrows and mistakes with ?', () => {
    expect(pgn).toBe(`[Event "Italian mine"]
[Site "https://chesshammer.com"]
[Date "2026.10.25"]
[White "?"]
[Black "?"]
[Result "*"]
[ECO "C50"]
[Orientation "white"]

1. e4 e5 (1... c5 2. Nf3) 2. Nf3 {Il cavallo prima [%cal Gf1c4]} (2. Bc4)
(2. Qh5? {Troppo presto} 2... Nc6) 2... Nc6 *
`)
  })

  it('reads back as the same lines, with the comments and the mistake', () => {
    const back = pgnLines(pgn)
    expect(back.lines.sort()).toEqual(
      ['e4 e5 Nf3 Nc6', 'e4 c5 Nf3', 'e4 e5 Bc4', 'e4 e5 Qh5 Nc6'].sort(),
    )
    expect(back.mistakes).toEqual(['e4 e5 Qh5'])
    expect(back.comments['e4 e5 Nf3']).toBe('Il cavallo prima')
  })
})

describe('repertoirePgn round trip', () => {
  it('keeps every wrong line, also nested ones, and every comment when imported back', () => {
    // 1.e4 e5 2.Nf3 Nc6 3.Bc4 (2.Qh5? Nc6 3.Bc4 (3.Qxf7+?? Kxf7) Nf6) ;
    // commenti sulla mossa principale, dentro la linea sbagliata e
    // sull'errore annidato.
    const nested = buildOpeningTree([
      node(1, null, 1, 'e4'),
      node(2, 1, 2, 'e5'),
      node(3, 2, 3, 'Nf3'),
      node(4, 3, 4, 'Nc6'),
      node(11, 4, 5, 'Bc4'),
      node(5, 2, 3, 'Qh5', { is_mistake: true }),
      node(6, 5, 4, 'Nc6'),
      node(7, 6, 5, 'Bc4'),
      node(8, 7, 6, 'Nf6'),
      node(9, 6, 5, 'Qxf7+', { is_mistake: true }),
      node(10, 9, 6, 'Kxf7'),
    ])
    const pgn = repertoirePgn({
      name: 'Prova',
      eco: null,
      color: 'w',
      tree: nested,
      comments: new Map([
        [3, 'Sviluppo'],
        [5, 'Troppo presto'],
        [9, 'Perde un pezzo'],
        [10, 'Il re riprende'],
      ]),
      arrows: new Map(),
      date: new Date('2026-10-29T12:00:00Z'),
    })

    const back = pgnLines(pgn)
    expect(back.mistakes.sort()).toEqual(['e4 e5 Qh5', 'e4 e5 Qh5 Nc6 Qxf7+'])
    expect(back.comments).toEqual({
      'e4 e5 Nf3': 'Sviluppo',
      'e4 e5 Qh5': 'Troppo presto',
      'e4 e5 Qh5 Nc6 Qxf7+': 'Perde un pezzo',
      'e4 e5 Qh5 Nc6 Qxf7+ Kxf7': 'Il re riprende',
    })

    // E reimportato diventa lo stesso repertorio, confutazioni comprese.
    const report = buildRepertoire(
      {
        slug: 'import',
        name: '',
        eco: null,
        color: 'w',
        source: null,
        lines: back.lines,
        comments: back.comments,
        mistakes: back.mistakes,
      },
      { lenient: true },
    )
    expect(report.nodes).toHaveLength(11)
    expect(
      report.nodes
        .filter((n) => n.isMistake)
        .map((n) => n.san)
        .sort(),
    ).toEqual(['Qh5', 'Qxf7+'])
    expect(report.nodes.filter((n) => n.comment)).toHaveLength(4)
  })
})
