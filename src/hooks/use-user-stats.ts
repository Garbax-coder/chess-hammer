import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppStyleId } from '@/lib/app-styles'
import { useAuth } from '@/lib/auth-context'
import type { BoardThemeId } from '@/lib/board-themes'
import type { Language } from '@/lib/i18n/translations'
import type { PieceSetId } from '@/lib/piece-sets'
import type { FailedPuzzleScope } from '@/lib/session-progress'
import { supabase } from '@/lib/supabase'

interface UserStats {
  current_elo: number
  puzzles_solved: number
  puzzles_failed: number
  auto_advance: boolean
  language: Language | null
  board_theme: BoardThemeId
  piece_set: PieceSetId
  practice_only_failed: boolean
  practice_failed_scope: FailedPuzzleScope
  practice_only_saved: boolean
  app_style: AppStyleId
  // Versione di Termini/Privacy accettata (null: mai accettata, ad es. chi
  // si e' registrato con Google): vedi LegalUpdateBanner.
  legal_version: string | null
}

export function userStatsKey(userId: string | undefined) {
  return ['user-stats', userId]
}

export function useUserStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: userStatsKey(user?.id),
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await supabase
        .from('user_stats')
        .select(
          'current_elo, puzzles_solved, puzzles_failed, auto_advance, language, board_theme, piece_set, practice_only_failed, practice_failed_scope, practice_only_saved, app_style, legal_version',
        )
        .eq('user_id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

// Tutte le preferenze si salvano allo stesso modo: il valore nuovo va subito
// in cache (l'interfaccia lo mostra senza aspettare il database) e dopo il
// salvataggio NON si rilegge user_stats, che tornerebbe identica a quella
// gia' in cache: era una richiesta in piu' a ogni modifica. Solo se il
// salvataggio fallisce si rilegge, per rimettere il valore vero.
function useUpdateUserStats<T>(toPatch: (value: T) => Partial<UserStats>) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = userStatsKey(user?.id)

  return useMutation({
    mutationFn: async (value: T) => {
      const patch = toPatch(value)
      const { error } = await supabase
        .from('user_stats')
        .update(
          // Con la versione accettata si registra anche quando (solo nel
          // database: in cache non serve).
          'legal_version' in patch
            ? { ...patch, legal_accepted_at: new Date().toISOString() }
            : patch,
        )
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onMutate: (value) => {
      queryClient.setQueryData<UserStats>(queryKey, (current) =>
        current ? { ...current, ...toPatch(value) } : current,
      )
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useUpdateAutoAdvance() {
  return useUpdateUserStats((autoAdvance: boolean) => ({ auto_advance: autoAdvance }))
}

type PracticeFilterPatch = Partial<
  Pick<
    UserStats,
    'practice_only_failed' | 'practice_failed_scope' | 'practice_only_saved'
  >
>

// Il filtro decide subito il puzzle di "Continua in pratica libera", che non
// deve partire col valore vecchio: per questo la cache si aggiorna prima del
// salvataggio (vale per tutte le preferenze, vedi useUpdateUserStats).
export function useUpdatePracticeFilter() {
  return useUpdateUserStats((patch: PracticeFilterPatch) => patch)
}

// Lo stile ricolora subito tutta l'interfaccia.
export function useUpdateAppStyle() {
  return useUpdateUserStats((appStyle: AppStyleId) => ({ app_style: appStyle }))
}

export function useUpdateLanguage() {
  return useUpdateUserStats((language: Language) => ({ language }))
}

export function useUpdateBoardTheme() {
  return useUpdateUserStats((boardTheme: BoardThemeId) => ({ board_theme: boardTheme }))
}

export function useUpdatePieceSet() {
  return useUpdateUserStats((pieceSet: PieceSetId) => ({ piece_set: pieceSet }))
}

// Accettazione della versione attuale di Termini/Privacy dall'avviso
// nell'app (la registrazione con email la salva gia' dal trigger handle_new_user).
export function useAcceptLegalTerms() {
  return useUpdateUserStats((version: string) => ({ legal_version: version }))
}
