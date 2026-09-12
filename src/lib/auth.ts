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
