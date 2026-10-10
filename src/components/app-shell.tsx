import { Menu, Moon, Sun, User as UserIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/app-logo'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppStyle } from '@/hooks/use-app-style'
import { useTheme } from '@/hooks/use-theme'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const { user } = useAuth()
  const appStyle = useAppStyle()
  // Il menu mobile va chiuso a mano al click su una voce, altrimenti resta
  // aperto sopra la pagina di destinazione.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined)

  const navItems = (
    <>
      <Button asChild variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
        <Link to="/dashboard">{t.nav.dashboard}</Link>
      </Button>
      <Button asChild variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
        <Link to="/train">{t.nav.train}</Link>
      </Button>
      <Button asChild variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
        <Link to="/sessions">{t.nav.history}</Link>
      </Button>
      <Button asChild variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
        <Link to="/faq">{t.nav.faq}</Link>
      </Button>
    </>
  )

  const themeButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={t.nav.toggleTheme}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )

  const avatarButton = (
    <Button asChild variant="ghost" size="icon-sm">
      <Link to="/profile" aria-label={t.profile.openLabel}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-6 rounded-full object-cover" />
        ) : (
          <UserIcon className="size-4" />
        )}
      </Link>
    </Button>
  )

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <Link
            to="/dashboard"
            className="text-foreground flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <AppLogo styleId={appStyle} className="size-6 shrink-0" />
            Chess Hammer
          </Link>

          {/* Le 4 voci di testo + tema + avatar non stanno nella larghezza di
              un telefono: sforavano e trascinavano in scroll orizzontale
              l'intera pagina. Sotto sm: le voci passano in un menu. */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems}
            {themeButton}
            {avatarButton}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:hidden">
            {themeButton}
            {avatarButton}
            <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t.nav.menu}>
                  <Menu className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.nav.menu}</DialogTitle>
                </DialogHeader>
                <nav className="flex flex-col items-start gap-1">{navItems}</nav>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  )
}
