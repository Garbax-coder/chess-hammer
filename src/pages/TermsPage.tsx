import { Link } from 'react-router-dom'
import { useTranslations } from '@/lib/language-context'

// Pagina pubblica (fuori da ProtectedRoute/AppShell): chi non ha ancora un
// account deve poter leggere i termini prima di registrarsi. Il testo vero
// arrivera' dopo: per ora solo un segnaposto.
export default function TermsPage() {
  const t = useTranslations()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <h1 className="text-foreground text-lg font-semibold tracking-tight">
        {t.terms.title}
      </h1>
      <p className="text-muted-foreground text-sm">{t.terms.placeholder}</p>
      <Link to="/profile" className="text-primary w-fit text-sm underline-offset-4 hover:underline">
        {t.terms.backToProfile}
      </Link>
    </main>
  )
}
