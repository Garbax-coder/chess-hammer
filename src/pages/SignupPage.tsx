import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '@/components/site-footer'
import { SocialLoginButtons } from '@/components/social-login-buttons'
import { captchaRequired, TurnstileWidget } from '@/components/turnstile-widget'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { signUpWithEmail } from '@/lib/auth'
import { useTranslations } from '@/lib/language-context'
import { findPasswordProblem, MIN_PASSWORD_LENGTH } from '@/lib/password-policy'
import { SITE_LEGAL_VERSION } from '@/lib/site-info'

// Un solo checkbox copre sia l'accettazione di Termini/Privacy sia la
// conferma di avere almeno 14 anni (l4/l5 del dossier di lancio): la frase
// e' spezzata in translations.ts attorno ai due link.
function LegalAcceptanceLabel() {
  const t = useTranslations()
  const linkClass = 'text-primary underline underline-offset-4'
  // Un unico <span>: Label e' flex, e testo e link sciolti diventerebbero colonne.
  return (
    <span>
      {t.signup.legalBefore}{' '}
      <Link to="/terms" target="_blank" className={linkClass}>
        {t.footer.terms}
      </Link>{' '}
      {t.signup.legalAnd}{' '}
      <Link to="/privacy" target="_blank" className={linkClass}>
        {t.footer.privacy}
      </Link>
      {t.signup.legalAfter}
    </span>
  )
}

export default function SignupPage() {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function resetCaptcha() {
    // Un token Turnstile e' utilizzabile una sola volta: dopo un tentativo
    // fallito va richiesto un nuovo token, non riusato quello scaduto.
    setCaptchaToken(null)
    setCaptchaResetKey((k) => k + 1)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!legalAccepted || (captchaRequired && !captchaToken)) return
    setSubmitting(true)
    const problem = await findPasswordProblem(password, email)
    if (problem) {
      setSubmitting(false)
      setError(t.passwordPolicy[problem])
      resetCaptcha()
      return
    }
    const { error } = await signUpWithEmail(
      email,
      password,
      SITE_LEGAL_VERSION,
      captchaToken ?? undefined,
    )
    setSubmitting(false)
    if (error) {
      setError(error.message)
      resetCaptcha()
      return
    }
    setDone(true)
  }

  return (
    <main className="flex min-h-svh flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{t.signup.title}</CardTitle>
            <CardDescription>{t.signup.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {done ? (
              <p className="text-sm">{t.signup.checkEmail}</p>
            ) : (
              <>
                <SocialLoginButtons onError={setError} disabled={!legalAccepted} />

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs">{t.common.or}</span>
                  <Separator className="flex-1" />
                </div>

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
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">{t.common.password}</Label>
                    <Input
                      id="password"
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

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="legal-acceptance"
                      checked={legalAccepted}
                      onCheckedChange={(checked) => setLegalAccepted(checked === true)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="legal-acceptance"
                      className="text-muted-foreground text-xs leading-snug font-normal"
                    >
                      <LegalAcceptanceLabel />
                    </Label>
                  </div>

                  <TurnstileWidget
                    onVerify={setCaptchaToken}
                    resetKey={captchaResetKey}
                  />

                  {error && <p className="text-destructive text-sm">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full"
                    loading={submitting}
                    disabled={!legalAccepted || (captchaRequired && !captchaToken)}
                  >
                    {t.signup.submit}
                  </Button>
                </form>
              </>
            )}

            <p className="text-muted-foreground text-center text-sm">
              {t.signup.haveAccount}{' '}
              <Link to="/login" className="text-foreground underline underline-offset-4">
                {t.signup.login}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </main>
  )
}
