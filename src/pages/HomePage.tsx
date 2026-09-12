import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { session, loading } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">
        Chess Hammer
      </h1>
      <p className="text-muted-foreground">Woodpecker method trainer — setup in corso.</p>
      {!loading && (
        <Button asChild>
          <Link to={session ? '/dashboard' : '/login'}>
            {session ? 'Vai alla dashboard' : 'Inizia allenamento'}
          </Link>
        </Button>
      )}
    </main>
  )
}
