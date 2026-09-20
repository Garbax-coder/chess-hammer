import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MIN_PASSWORD_LENGTH, updatePassword } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { useTranslations } from '@/lib/language-context'

// Il link nell'email porta qui con una sessione di recupero: supabase-js la
// legge dall'URL all'avvio. Senza sessione il link e' scaduto o gia' usato.
export default function ResetPasswordPage() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError(t.resetPassword.mismatch)
      return
    }
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/dashboard', { replace: true })
  }

  if (loading) {
    return <main className="flex min-h-svh items-center justify-center" />
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t.resetPassword.title}</CardTitle>
          {session && <CardDescription>{t.resetPassword.subtitle}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {session ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">{t.resetPassword.newPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">{t.resetPassword.confirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" className="w-full" loading={submitting}>
                {t.resetPassword.submit}
              </Button>
            </form>
          ) : (
            <>
              <p className="text-destructive text-sm">{t.resetPassword.invalidLink}</p>
              <Link
                to="/forgot-password"
                className="text-foreground text-sm underline underline-offset-4"
              >
                {t.resetPassword.requestNew}
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
