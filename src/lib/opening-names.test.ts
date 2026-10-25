import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { openingNamesSql, parseOpeningNamesTsv } from './opening-names'

const root = join(__dirname, '..', '..')
const tsv = (file: string) =>
  readFileSync(join(root, `scripts/openings/lichess-openings/${file}.tsv`), 'utf8')

describe('parseOpeningNamesTsv', () => {
  it('ties each name to the position its moves reach', () => {
    const names = parseOpeningNamesTsv(
      "eco\tname\tpgn\nC42\tPetrov's Defense\t1. e4 e5 2. Nf3 Nf6\n",
    )
    expect(names).toEqual([
      {
        epd: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -',
        eco: 'C42',
        name: "Petrov's Defense",
      },
    ])
  })

  it('rejects a file with other columns', () => {
    expect(() => parseOpeningNamesTsv('eco\tname\n')).toThrow(/intestazione/)
  })
})

describe('openingNamesSql', () => {
  it('escapes quotes, keeps one row per position and splits the inserts', () => {
    const sql = openingNamesSql(
      [
        { epd: 'a', eco: 'C42', name: "Petrov's Defense" },
        { epd: 'a', eco: 'C42', name: "Petrov's Defense: Classical Attack" },
        { epd: 'b', eco: 'B12', name: 'Caro-Kann Defense' },
      ],
      1,
    )
    expect(sql).toContain("'Petrov''s Defense: Classical Attack'")
    expect(sql).not.toContain("'Petrov''s Defense')")
    expect(sql.match(/insert into public\.opening_names/g)).toHaveLength(2)
  })

  it('keeps the names migration in sync with the Lichess files', () => {
    const names = ['a', 'b', 'c', 'd', 'e'].flatMap((f) => parseOpeningNamesTsv(tsv(f)))
    expect(names.length).toBeGreaterThan(3000)
    const migration = readFileSync(
      join(root, 'supabase/migrations/0102_opening_names.sql'),
      'utf8',
    )
    expect(migration.endsWith(openingNamesSql(names))).toBe(true)
  })
})
