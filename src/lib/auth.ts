import type { Language } from '@/lib/i18n/translations'
import { clearSnapshots } from '@/lib/session-puzzles-snapshot'
import { supabase } from '@/lib/supabase'

export type OAuthProvider = 'google' | 'facebook'

export const oauthProviders: { id: OAuthProvider; label: string }[] = [
  { id: 'google', label: 'Google' },
  // { id: 'facebook', label: 'Facebook' }, // in arrivo
]

// captchaToken e' richiesto solo se CAPTCHA e' abilitato lato Supabase
// (Authentication -> Attack Protection): undefined quando il sito non ha
// VITE_TURNSTILE_SITE_KEY configurata, vedi turnstile-widget.tsx.
export function signInWithEmail(email: string, password: string, captchaToken?: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  })
}

// legalVersion finisce nei metadata dell'utente auth e viene letto dal
// trigger handle_new_user (supabase/migrations/0021_legal_acceptance.sql)
// per salvare data e versione dell'accettazione: e' l'unico modo per
// scriverlo in modo atomico, anche prima che esista una sessione
// autenticata (richiesta di conferma email).
export function signUpWithEmail(
  email: string,
  password: string,
  legalVersion: string,
  language: Language,
  captchaToken?: string,
) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { legal_version: legalVersion, language }, captchaToken },
  })
}

// Le email di Supabase Auth (conferma, recupero password, cambio email)
// scelgono la lingua da user_metadata.language: vedi
// supabase/email-templates/README.md.
export function saveEmailLanguage(language: Language) {
  return supabase.auth.updateUser({ data: { language } })
}

export function signInWithOAuth(provider: OAuthProvider) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
}

export function signOut() {
  clearSnapshots()
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
  clearSnapshots()
  await supabase.auth.signOut()
}

// redirectTo deve essere tra i Redirect URLs consentiti in Supabase
// (Authentication -> URL Configuration), altrimenti il link porta al Site URL.
export function requestPasswordReset(email: string, captchaToken?: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
    captchaToken,
  })
}

// Dopo un cambio password si chiudono le sessioni degli altri dispositivi:
// chi avesse la vecchia password (o un dispositivo rubato) resta fuori.
// Best-effort: la password e' gia' cambiata, un errore qui non la annulla.
export async function updatePassword(password: string) {
  const result = await supabase.auth.updateUser({ password })
  if (!result.error) {
    await supabase.auth.signOut({ scope: 'others' }).catch(() => {})
  }
  return result
}

export type ChangePasswordResult =
  { ok: true } | { ok: false; reason: 'wrong-current' | 'other'; message: string }

// updateUser da solo non chiede la password attuale: la si verifica prima con
// un login, cosi' una sessione lasciata aperta non basta per cambiarla.
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const verify = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (verify.error) {
    return {
      ok: false,
      reason: verify.error.code === 'invalid_credentials' ? 'wrong-current' : 'other',
      message: verify.error.message,
    }
  }
  const { error } = await updatePassword(newPassword)
  if (error) return { ok: false, reason: 'other', message: error.message }
  return { ok: true }
}

export function changeEmail(newEmail: string) {
  return supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${window.location.origin}/profile` },
  )
}
