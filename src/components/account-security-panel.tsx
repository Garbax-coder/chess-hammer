import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changeEmail, changePassword } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { useTranslations } from '@/lib/language-context'
import { findPasswordProblem, MIN_PASSWORD_LENGTH } from '@/lib/password-policy'

function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const t = useTranslations()
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSentTo(null)
    const target = newEmail.trim()
    if (target.toLowerCase() === currentEmail.toLowerCase()) {
      setError(t.profile.sameEmail)
      return
    }
    setSubmitting(true)
    const { error } = await changeEmail(target)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setSentTo(target)
    setNewEmail('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
      <h3 className="text-foreground text-sm font-medium">
        {t.profile.changeEmailTitle}
      </h3>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-email">{t.profile.newEmail}</Label>
        <Input
          id="new-email"
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {sentTo && <p className="text-sm">{t.profile.changeEmailSent(sentTo)}</p>}
      <div>
        <Button type="submit" size="sm" loading={submitting}>
          {t.profile.changeEmailSubmit}
        </Button>
      </div>
    </form>
  )
}

function ChangePasswordForm({ email }: { email: string }) {
  const t = useTranslations()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setDone(false)
    if (password !== confirm) {
      setError(t.resetPassword.mismatch)
      return
    }
    setSubmitting(true)
    const problem = await findPasswordProblem(password, email)
    if (problem) {
      setSubmitting(false)
      setError(t.passwordPolicy[problem])
      return
    }
    const result = await changePassword(email, current, password)
    setSubmitting(false)
    if (!result.ok) {
      setError(
        result.reason === 'wrong-current'
          ? t.profile.wrongCurrentPassword
          : result.message,
      )
      return
    }
    setDone(true)
    setCurrent('')
    setPassword('')
    setConfirm('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
      <h3 className="text-foreground text-sm font-medium">
        {t.profile.changePasswordTitle}
      </h3>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="current-password">{t.profile.currentPassword}</Label>
        <Input
          id="current-password"
          type="password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-new-password">{t.profile.newPassword}</Label>
        <Input
          id="profile-new-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <p className="text-muted-foreground text-xs">
          {t.passwordPolicy.hint(MIN_PASSWORD_LENGTH)}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-confirm-password">{t.profile.confirmPassword}</Label>
        <Input
          id="profile-confirm-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {done && <p className="text-sm">{t.profile.passwordChanged}</p>}
      <div>
        <Button type="submit" size="sm" loading={submitting}>
          {t.profile.changePasswordSubmit}
        </Button>
      </div>
    </form>
  )
}

// Solo per chi ha un accesso con email e password: chi entra solo con Google
// ha email e credenziali gestite da Google.
export function AccountSecurityPanel() {
  const { user } = useAuth()
  const hasPasswordLogin = user?.identities?.some((i) => i.provider === 'email') ?? false
  if (!user?.email || !hasPasswordLogin) return null

  return (
    <div className="flex flex-col gap-6">
      <ChangeEmailForm currentEmail={user.email} />
      <ChangePasswordForm email={user.email} />
    </div>
  )
}
