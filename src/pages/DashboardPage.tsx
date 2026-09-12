import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { signOut } from '@/lib/auth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Accesso effettuato come {user?.email ?? 'utente'}
      </p>
      <Button variant="outline" onClick={() => signOut()}>
        Esci
      </Button>
    </main>
  )
}
