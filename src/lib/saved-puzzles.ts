import { supabase } from '@/lib/supabase'

// Puzzle "problematici" salvati dall'utente (tabella saved_puzzles,
// migrazione 0031): la RLS limita le righe a quelle di chi chiama.

export async function fetchSavedPuzzleIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from('saved_puzzles').select('puzzle_id')
  if (error) throw error
  return new Set(data.map((r) => r.puzzle_id as string))
}

export async function setPuzzleSaved(userId: string, puzzleId: string, saved: boolean) {
  const { error } = saved
    ? await supabase
        .from('saved_puzzles')
        .upsert({ user_id: userId, puzzle_id: puzzleId }, { ignoreDuplicates: true })
    : await supabase
        .from('saved_puzzles')
        .delete()
        .eq('user_id', userId)
        .eq('puzzle_id', puzzleId)
  if (error) throw error
}
