import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SocialLoginButtons } from '@/components/social-login-buttons'
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
import { Separator } from '@/components/ui/separator'
import { signUpWithEmail } from '@/lib/auth'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signUpWithEmail(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Crea account</CardTitle>
          <CardDescription>
            Inizia a tracciare i tuoi allenamenti Woodpecker
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {done ? (
            <p className="text-sm">
              Controlla la tua email per confermare l'account prima di accedere.
            </p>
          ) : (
            <>
              <SocialLoginButtons onError={setError} />

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs">oppure</span>
                <Separator className="flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Creazione account…' : 'Registrati'}
                </Button>
              </form>
            </>
          )}

          <p className="text-muted-foreground text-center text-sm">
            Hai già un account?{' '}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Accedi
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
