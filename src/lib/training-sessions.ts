import { supabase } from '@/lib/supabase'
import type { NewTrainingSessionInput, TrainingSession } from '@/types/training'

export async function fetchActiveSession(
  userId: string,
): Promise<TrainingSession | null> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createTrainingSession(
  userId: string,
  input: NewTrainingSessionInput,
): Promise<TrainingSession> {
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({ user_id: userId, ...input })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export function daysForRound(totalPuzzles: number, dailyTarget: number): number {
  return Math.ceil(totalPuzzles / dailyTarget)
}
