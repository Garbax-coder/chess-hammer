import { describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '@/test/supabase-mock'
import { makeAttempt } from '@/test/fixtures'

const { supabase, queueRpc } = createSupabaseMock()
vi.mock('@/lib/supabase', () => ({ supabase }))

const { fetchThemePuzzles, themePracticePath } = await import('./theme-puzzles')

function row(puzzleId: string, sessionPuzzleId: string | null, sessionId: string | null) {
  return {
    puzzle_id: puzzleId,
    session_id: sessionId,
    session_puzzle_id: sessionPuzzleId,
    rating: 1500,
    fen: 'fen',
    moves: ['e2e4', 'e7e5'],
    themes: ['fork'],
    attempts: sessionPuzzleId
      ? [makeAttempt({ session_puzzle_id: sessionPuzzleId, round_number: 1 })]
      : [],
  }
}

describe('fetchThemePuzzles', () => {
  it('turns the rows into a list numbered from the first attempted', async () => {
    queueRpc('my_theme_puzzles', {
      data: [row('p1', 'sp1', 's1'), row('p2', null, null)],
      error: null,
    })

    const puzzles = await fetchThemePuzzles('fork', 'practice')

    expect(supabase.rpc).toHaveBeenCalledWith('my_theme_puzzles', {
      p_theme: 'fork',
      p_source: 'practice',
    })
    expect(puzzles.map((p) => [p.orderIndex, p.puzzleId, p.sessionId])).toEqual([
      [1, 'p1', 's1'],
      [2, 'p2', null],
    ])
    expect(puzzles[0].attempts[1]?.session_puzzle_id).toBe('sp1')
    // Senza sessione resta in lista, con una chiave ricavata dal puzzle.
    expect(puzzles[1].sessionPuzzleId).toBe('puzzle-p2')
    expect(puzzles[1].attempts).toEqual({})
  })

  it('throws the database error', async () => {
    queueRpc('my_theme_puzzles', { data: null, error: { message: 'boom' } })
    await expect(fetchThemePuzzles('fork', 'training')).rejects.toMatchObject({
      message: 'boom',
    })
  })
})

describe('themePracticePath', () => {
  it('keeps the source of the statistics tab', () => {
    expect(themePracticePath('mateIn2', 'training')).toBe('/stats/themes/mateIn2')
    expect(themePracticePath('mateIn2', 'practice')).toBe(
      '/stats/themes/mateIn2?source=practice',
    )
  })
})
