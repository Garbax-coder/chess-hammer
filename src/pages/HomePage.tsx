import { Link } from 'react-router-dom'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useTranslations } from '@/lib/language-context'

export default function HomePage() {
  const { session, loading } = useAuth()
  const t = useTranslations()

  return (
    <main className="flex min-h-svh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Chess Hammer
        </h1>
        <p className="text-muted-foreground max-w-md px-4">{t.home.subtitle}</p>
        {!loading && (
          <Button asChild>
            <Link to={session ? '/dashboard' : '/login'}>
              {session ? t.home.goToDashboard : t.home.startTraining}
            </Link>
          </Button>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
