import { describe, expect, it } from 'vitest'
import {
  ecoChoiceLines,
  ecoChoices,
  loadEcoLines,
  parseEcoTsv,
  searchEcoChoices,
} from './opening-eco'

const TSV = `eco\tname\tpgn
C50\tItalian Game\t1. e4 e5 2. Nf3 Nc6 3. Bc4
C50\tItalian Game: Hungarian Defense\t1. e4 e5 2. Nf3 Nc6 3. Bc4 Be7
C51\tItalian Game: Evans Gambit\t1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4
C53\tItalian Game: Classical Variation, Center Attack\t1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4
C53\tItalian Game: Classical Variation\t1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3
D80\tGrünfeld Defense\t1. d4 Nf6 2. c4 g6 3. Nc3 d5
`
const lines = parseEcoTsv(TSV)
const choices = ecoChoices(lines)
const choice = (id: string) => choices.find((c) => c.id === id)!

describe('parseEcoTsv', () => {
  it('reads code, name and moves without the move numbers', () => {
    expect(lines).toHaveLength(6)
    expect(lines[2]).toEqual({
      eco: 'C51',
      name: 'Italian Game: Evans Gambit',
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'],
    })
  })
})

describe('ecoChoices', () => {
  it('offers every ECO code, family and variation with its lines', () => {
    expect(choice('eco:C53')).toMatchObject({
      kind: 'eco',
      detail: 'Italian Game',
      lines: 2,
    })
    expect(choice('name:Italian Game')).toMatchObject({ detail: 'C50–C53', lines: 5 })
    // La variante raccoglie anche le sue sottovarianti (dopo la virgola).
    expect(choice('name:Italian Game: Classical Variation').lines).toBe(2)
    expect(choices.some((c) => c.key.includes('Center Attack'))).toBe(false)
  })
})

describe('searchEcoChoices', () => {
  it('finds codes by prefix and names without accents or case, codes first', () => {
    expect(searchEcoChoices(choices, 'c5').map((c) => c.key)).toEqual([
      'C50',
      'C51',
      'C53',
    ])
    expect(searchEcoChoices(choices, 'italian').map((c) => c.key)).toEqual([
      'Italian Game',
      'Italian Game: Classical Variation',
      'Italian Game: Evans Gambit',
      'Italian Game: Hungarian Defense',
    ])
    expect(searchEcoChoices(choices, 'grunfeld').map((c) => c.id)).toEqual([
      'name:Grünfeld Defense',
    ])
    expect(searchEcoChoices(choices, '  ')).toEqual([])
  })
})

describe('ecoChoiceLines', () => {
  it('puts first the branches with more variations', () => {
    // Dopo 3...Bc5 il Bianco ha 4.c3 (due varianti) e 4.b4 (una): prima c3.
    expect(ecoChoiceLines(lines, choice('name:Italian Game'))).toEqual([
      'e4 e5 Nf3 Nc6 Bc4',
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3',
      'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4',
      'e4 e5 Nf3 Nc6 Bc4 Bc5 b4',
      'e4 e5 Nf3 Nc6 Bc4 Be7',
    ])
    expect(ecoChoiceLines(lines, choice('eco:C51'))).toEqual(['e4 e5 Nf3 Nc6 Bc4 Bc5 b4'])
  })
})

describe('loadEcoLines', () => {
  it('loads the whole Lichess dataset', async () => {
    const all = await loadEcoLines()
    expect(all.length).toBe(3865)
    expect(new Set(all.map((l) => l.eco)).size).toBe(500)
  })
})
