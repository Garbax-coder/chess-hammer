import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ProfileDialog } from '@/components/profile-dialog'
import { useTheme } from '@/hooks/use-theme'
import { useLanguage } from '@/lib/language-context'

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

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
              <Link to="/dashboard">{t.nav.dashboard}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/sessions">{t.nav.history}</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={t.nav.toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <ProfileDialog />
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
