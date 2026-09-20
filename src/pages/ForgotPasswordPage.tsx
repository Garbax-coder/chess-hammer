import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
import { requestPasswordReset } from '@/lib/auth'
import { useTranslations } from '@/lib/language-context'

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await requestPasswordReset(email.trim())
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    // Stesso messaggio con o senza account: non si rivela chi e' registrato.
    setSent(true)
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t.forgotPassword.title}</CardTitle>
          <CardDescription>{t.forgotPassword.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sent ? (
            <p className="text-sm">{t.forgotPassword.sent}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{t.common.email}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" className="w-full" loading={submitting}>
                {t.forgotPassword.submit}
              </Button>
            </form>
          )}

          <p className="text-center text-sm">
            <Link to="/login" className="text-foreground underline underline-offset-4">
              {t.forgotPassword.backToLogin}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
