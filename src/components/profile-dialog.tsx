import { LogOut, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useUserStats } from '@/hooks/use-user-stats'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import type { Language } from '@/lib/i18n/translations'
import { useLanguage } from '@/lib/language-context'

const LANGUAGE_FLAGS: Record<Language, string> = {
  it: '🇮🇹',
  en: '🇬🇧',
}

const LANGUAGES: Language[] = ['it', 'en']

export function ProfileDialog() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { data: stats } = useUserStats()
  const navigate = useNavigate()

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t.profile.openLabel}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-6 rounded-full object-cover" />
          ) : (
            <UserIcon className="size-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.profile.title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-full">
              <UserIcon className="text-muted-foreground size-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">{user?.email}</p>
            {stats && (
              <p className="text-muted-foreground text-xs">{t.profile.elo(stats.current_elo)}</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-sm">{t.language.label}</span>
          <div className="flex gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-label={t.language[lang]}
                aria-pressed={language === lang}
                className={`flex size-8 items-center justify-center rounded-md text-lg transition-colors ${
                  language === lang ? 'bg-primary/10 ring-primary ring-2' : 'hover:bg-muted'
                }`}
              >
                {LANGUAGE_FLAGS[lang]}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
          <LogOut className="size-4" />
          {t.nav.signOut}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
