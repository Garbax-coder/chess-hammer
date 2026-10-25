import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildRepertoire,
  buildRepertoireNodes,
  catalogSql,
  colorAtPly,
  epdOf,
  type RepertoireSource,
} from './opening-catalog'

const root = join(__dirname, '..', '..')
const sources: RepertoireSource[] = JSON.parse(
  readFileSync(join(root, 'scripts/openings/repertoires.json'), 'utf8'),
)

function source(lines: string[], color: 'w' | 'b' = 'w'): RepertoireSource {
  return { slug: 'test', name: 'Test', eco: null, color, source: null, lines }
}

describe('the catalog repertoires', () => {
  it.each(sources.map((s) => [s.slug, s] as const))(
    '%s: every line is legal and becomes one Run, alternatives aside',
    (_slug, repertoire) => {
      const nodes = buildRepertoireNodes(repertoire)
      const parents = new Set(nodes.map((n) => n.parentPath))
      const leaves = nodes.filter((n) => n.isMain && !parents.has(n.path))
      expect(leaves).toHaveLength(repertoire.lines.length)
      // Ogni Run finisce con una domanda all'utente.
      for (const leaf of leaves) expect(colorAtPly(leaf.ply)).toBe(repertoire.color)
      // Le alternative dichiarate ci sono, senza seguito.
      const alternatives = nodes.filter((n) => !n.isMain)
      expect(alternatives).toHaveLength(repertoire.alternatives?.length ?? 0)
      for (const alternative of alternatives) {
        expect(parents.has(alternative.path)).toBe(false)
      }
    },
  )

  it('keeps the catalog migration in sync with the lines', () => {
    const migration = readFileSync(
      join(root, 'supabase/migrations/0101_opening_catalog.sql'),
      'utf8',
    )
    expect(migration.endsWith(catalogSql(sources))).toBe(true)
  })

  it('recognises a transposition by its position', () => {
    // 3.Nc3 dxe4 4.Nxe4 e 3.Nd2 dxe4 4.Nxe4 arrivano alla stessa posizione.
    const nodes = buildRepertoireNodes(sources.find((s) => s.slug === 'caro-kann')!)
    const afterNxe4 = nodes.filter((n) => n.ply === 7 && n.san === 'Nxe4')
    expect(afterNxe4).toHaveLength(2)
    expect(afterNxe4[0].path).not.toBe(afterNxe4[1].path)
    expect(afterNxe4[0].epd).toBe(afterNxe4[1].epd)
  })
})

describe('buildRepertoireNodes', () => {
  it('merges the common start of the lines into the same moves', () => {
    const nodes = buildRepertoireNodes(source(['e4 e5 Nf3', 'e4 c5 Nf3']))
    expect(nodes.map((n) => n.path)).toEqual([
      'e2e4',
      'e2e4.c7c5',
      'e2e4.e7e5',
      'e2e4.c7c5.g1f3',
      'e2e4.e7e5.g1f3',
    ])
    expect(nodes[1]).toMatchObject({ parentPath: 'e2e4', ply: 2, uci: 'c7c5', san: 'c5' })
  })

  it('writes castling and promotions as UCI moves', () => {
    const nodes = buildRepertoireNodes(source(['e4 e5 Nf3 Nc6 Bc4 Nf6 O-O']))
    expect(nodes.at(-1)).toMatchObject({ uci: 'e1g1', san: 'O-O' })
  })

  it('rejects an illegal move, naming the line', () => {
    expect(() => buildRepertoireNodes(source(['e4 e5 Ke3']))).toThrow(/linea 1: mossa 3/)
  })

  it('rejects a line that ends with an opponent move', () => {
    expect(() => buildRepertoireNodes(source(['e4 e5']))).toThrow(/deve finire/)
    expect(() => buildRepertoireNodes(source(['e4 e5 Nf3'], 'b'))).toThrow(/deve finire/)
  })

  it('rejects two different user moves in the same position', () => {
    expect(() => buildRepertoireNodes(source(['e4 e5 Nf3', 'e4 e5 Bc4']))).toThrow(
      /Bc4|Nf3/,
    )
  })
})

describe('catalogSql', () => {
  it('escapes quotes and inserts the moves one ply at a time', () => {
    const sql = catalogSql([{ ...source(['e4 e5 Nf3']), name: "King's Test" }])
    expect(sql).toContain("'King''s Test'")
    expect(sql.match(/insert into public\.opening_nodes/g)).toHaveLength(3)
  })

  it('stores the position without move counters', () => {
    expect(epdOf('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -',
    )
  })
})

describe('alternatives', () => {
  it('adds a declared alternative next to the repertoire move', () => {
    const nodes = buildRepertoireNodes({
      ...source(['e4 e5 Nf3']),
      alternatives: ['e4 e5 Bc4'],
    })
    expect(nodes.find((n) => n.san === 'Bc4')).toMatchObject({
      parentPath: 'e2e4.e7e5',
      isMain: false,
    })
    expect(nodes.find((n) => n.san === 'Nf3')?.isMain).toBe(true)
  })

  it('rejects an alternative with no repertoire move to stand beside', () => {
    expect(() =>
      buildRepertoireNodes({ ...source(['e4 e5 Nf3']), alternatives: ['e4 c5 Nf3'] }),
    ).toThrow(/alternativa 1/)
  })

  it('rejects a line that continues after an alternative', () => {
    expect(() =>
      buildRepertoireNodes({
        ...source(['e4 e5 Nf3', 'e4 e5 Bc4 Nc6 Nf3']),
        alternatives: ['e4 e5 Bc4'],
      }),
    ).toThrow()
  })
})

describe('buildRepertoire in lenient mode (PGN import)', () => {
  it('trims a trailing opponent move and keeps a second user move as an alternative', () => {
    const report = buildRepertoire(
      source(['e4 e5 Nf3 Nc6', 'e4 e5 Bc4 Bc5 c3', 'e4 c5 Nf3']),
      { lenient: true },
    )
    expect(report.trimmed).toBe(1)
    expect(report.alternatives).toBe(1)
    const bc4 = report.nodes.find((n) => n.san === 'Bc4')!
    expect(bc4.isMain).toBe(false)
    // Il seguito dell'alternativa si lascia cadere.
    expect(report.nodes.some((n) => n.parentPath === bc4.path)).toBe(false)
    expect(report.nodes.filter((n) => n.isMain).map((n) => n.san)).toEqual([
      'e4',
      'c5',
      'e5',
      'Nf3',
      'Nf3',
    ])
  })

  it('opens a new line with a second user move when asked (branches)', () => {
    const report = buildRepertoire(
      source(['e4 e5 Nf3 Nc6', 'e4 e5 Bc4 Bc5 c3', 'e4 c5 Nf3']),
      { lenient: true, branches: true },
    )
    expect(report.alternatives).toBe(0)
    expect(report.nodes.every((n) => n.isMain)).toBe(true)
    // 2.Bc4 tiene il suo seguito.
    expect(report.nodes.map((n) => n.san)).toContain('c3')
  })

  it('keeps a trailing opponent move when asked (keepOpponentEnds)', () => {
    const report = buildRepertoire(source(['e4 e5 Nf3 Nc6', 'e4 c5']), {
      lenient: true,
      keepOpponentEnds: true,
    })
    expect(report.trimmed).toBe(0)
    expect(report.nodes.map((n) => n.san)).toEqual(['e4', 'c5', 'e5', 'Nf3', 'Nc6'])
  })

  it('keeps a wrong line with its refutation, and more user moves inside it', () => {
    const report = buildRepertoire(
      {
        ...source(['e4 e5 Nf3', 'e4 e5 Qh5 Nc6 Bc4 Nf6', 'e4 e5 Qh5 Nc6 Qxf7+']),
        mistakes: ['e4 e5 Qh5'],
      },
      { lenient: true },
    )
    const qh5 = report.nodes.find((n) => n.san === 'Qh5')!
    expect(qh5.isMistake).toBe(true)
    expect(qh5.isMain).toBe(true)
    expect(report.mistakes).toBe(1)
    // La confutazione 4...Nf6 resta, e dentro la linea sbagliata 3.Bc4 e
    // 3.Qxf7 sono entrambe linee, non alternative.
    expect(report.trimmed).toBe(0)
    expect(report.alternatives).toBe(0)
    expect(report.nodes.map((n) => n.san)).toEqual(
      expect.arrayContaining(['Nf6', 'Bc4', 'Qxf7+']),
    )
  })

  it('still rejects an illegal move', () => {
    expect(() => buildRepertoire(source(['e4 e5 Ke3']), { lenient: true })).toThrow(
      /non legale/,
    )
  })
})
