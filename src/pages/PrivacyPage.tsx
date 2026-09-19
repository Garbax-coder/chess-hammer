import { Link } from 'react-router-dom'
import { useTranslations } from '@/lib/language-context'

// Pagina pubblica (fuori da ProtectedRoute/AppShell), stesso motivo di
// TermsPage. Il testo vero arrivera' dopo: per ora solo un segnaposto.
export default function PrivacyPage() {
  const t = useTranslations()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <h1 className="text-foreground text-lg font-semibold tracking-tight">
        {t.privacy.title}
      </h1>
      <p className="text-muted-foreground text-sm">{t.privacy.placeholder}</p>
      <Link to="/profile" className="text-primary w-fit text-sm underline-offset-4 hover:underline">
        {t.privacy.backToProfile}
      </Link>
    </main>
  )
}
