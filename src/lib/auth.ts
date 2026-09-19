import { supabase } from '@/lib/supabase'

export type OAuthProvider = 'google' | 'facebook'

export const oauthProviders: { id: OAuthProvider; label: string }[] = [
  { id: 'google', label: 'Google' },
  // { id: 'facebook', label: 'Facebook' }, // in arrivo
]

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export function signInWithOAuth(provider: OAuthProvider) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}

// La RPC cancella la riga in auth.users dell'utente corrente: tutte le sue
// tabelle (user_stats, training_sessions, practice_attempts e, a cascata,
// session_puzzles/puzzle_attempts) hanno on delete cascade (vedi
// supabase/migrations/0018_delete_own_account.sql). Poi si chiude la
// sessione locale, che a quel punto punterebbe a un utente inesistente.
export async function deleteOwnAccount() {
  const { error } = await supabase.rpc('delete_own_account')
  if (error) throw error
  await supabase.auth.signOut()
}
