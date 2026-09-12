import { LogOut, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { signOut } from '@/lib/auth'

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            to="/dashboard"
            className="text-foreground text-sm font-semibold tracking-tight"
          >
            Chess Hammer
          </Link>
          <nav className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/sessions">Storico</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label="Cambia tema"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSignOut}
              aria-label="Esci"
            >
              <LogOut className="size-4" />
            </Button>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
