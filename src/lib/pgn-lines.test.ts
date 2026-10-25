import { describe, expect, it } from 'vitest'
import { pgnLines } from './pgn-lines'

describe('pgnLines', () => {
  it('turns every variation into a line, the main line first', () => {
    const { lines } = pgnLines(
      '1. e4 e5 (1... c5 2. Nf3 (2. Nc3 Nc6) d6) 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 *',
    )
    expect(lines).toEqual([
      'e4 e5 Nf3 Nc6 Bc4',
      'e4 c5 Nf3 d6',
      'e4 c5 Nc3 Nc6',
      'e4 e5 Nf3 d6 d4',
    ])
  })

  it('ignores comments, annotations, move numbers and results', () => {
    const { lines } = pgnLines(
      '1.e4!? {the best} e5 $1 2. Nf3 ; a comment\n2... Nc6?! 3. 0-0?? 1-0',
    )
    expect(lines).toEqual(['e4 e5 Nf3 Nc6 O-O'])
  })

  it('reads the tags and every game of a study', () => {
    const { lines, headers, skipped } = pgnLines(`[Event "My repertoire: Italian"]
[Opening "Italian Game"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 *

[Event "My repertoire: Petrov"]

1. e4 e5 2. Nf3 Nf6 3. Nxe5 *

[Event "From a position"]
[SetUp "1"]
[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"]

1. Ka2 *
`)
    expect(headers.Event).toBe('My repertoire: Italian')
    expect(lines).toEqual(['e4 e5 Nf3 Nc6 Bc4', 'e4 e5 Nf3 Nf6 Nxe5'])
    expect(skipped).toBe(1)
  })

  it('drops the same line found twice', () => {
    expect(pgnLines('1. e4 e5 *\n\n1. e4 e5 *').lines).toEqual(['e4 e5'])
  })

  it('gives no lines for an empty text', () => {
    expect(pgnLines('  ').lines).toEqual([])
  })

  it('ties each comment to the move before it, without the Lichess annotations', () => {
    const { comments } = pgnLines(
      '{Intro} 1. e4 {Best by test [%cal Ge2e4]} e5 2. Nf3 (2. Bc4 {Bishop opening} Nf6) Nc6 {Main} {line} *',
    )
    expect(comments).toEqual({
      e4: 'Best by test',
      'e4 e5 Bc4': 'Bishop opening',
      'e4 e5 Nf3 Nc6': 'Main line',
    })
  })
})
