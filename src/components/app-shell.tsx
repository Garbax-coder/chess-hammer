import { Moon, Sun, User as UserIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/app-logo'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useAppStyle } from '@/hooks/use-app-style'
import { useTheme } from '@/hooks/use-theme'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const { user } = useAuth()
  const appStyle = useAppStyle()

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined)

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            to="/dashboard"
            className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <AppLogo styleId={appStyle} className="size-6 shrink-0" />
            Chess Hammer
          </Link>
          <nav className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">{t.nav.dashboard}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/train">{t.nav.train}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/sessions">{t.nav.history}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/faq">{t.nav.faq}</Link>
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
            <Button asChild variant="ghost" size="icon-sm">
              <Link to="/profile" aria-label={t.profile.openLabel}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="size-6 rounded-full object-cover" />
                ) : (
                  <UserIcon className="size-4" />
                )}
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  )
}
