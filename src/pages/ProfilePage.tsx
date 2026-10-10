import { LogOut, User as UserIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AccountSecurityPanel } from '@/components/account-security-panel'
import { AppLogo } from '@/components/app-logo'
import { DataExportPanel } from '@/components/data-export-panel'
import { DeleteAccountDialog } from '@/components/delete-account-dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppStyle } from '@/hooks/use-app-style'
import {
  useUpdateAppStyle,
  useUpdateBoardTheme,
  useUpdatePieceSet,
  useUserStats,
} from '@/hooks/use-user-stats'
import { APP_STYLES } from '@/lib/app-styles'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { BOARD_THEMES, DEFAULT_BOARD_THEME } from '@/lib/board-themes'
import { LANGUAGE_NAMES, LANGUAGES, type Language } from '@/lib/i18n/translations'
import { useLanguage } from '@/lib/language-context'
import { DEFAULT_PIECE_SET, PIECE_SETS } from '@/lib/piece-sets'

const LANGUAGE_FLAGS: Record<Language, string> = {
  it: '🇮🇹',
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { data: stats } = useUserStats()
  const updateBoardTheme = useUpdateBoardTheme()
  const updatePieceSet = useUpdatePieceSet()
  const updateAppStyle = useUpdateAppStyle()
  const appStyle = useAppStyle()
  const navigate = useNavigate()

  const boardTheme = stats?.board_theme ?? DEFAULT_BOARD_THEME
  const pieceSet = stats?.piece_set ?? DEFAULT_PIECE_SET

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-foreground text-lg font-semibold tracking-tight">
        {t.profile.title}
      </h1>

      <div className="flex min-w-0 items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-12 shrink-0 rounded-full object-cover" />
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

      <section className="flex flex-col gap-4">
        <h2 className="text-foreground text-base font-medium">{t.profile.appearanceTitle}</h2>

        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">{t.appearance.appStyle}</span>
          <div className="flex flex-wrap gap-2">
            {APP_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => updateAppStyle.mutate(style.id)}
                aria-pressed={appStyle === style.id}
                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors ${
                  appStyle === style.id
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <AppLogo styleId={style.id} className="size-6 shrink-0" />
                {t.appearance.appStyles[style.id]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-sm">{t.language.label}</span>
          <div className="flex gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-label={LANGUAGE_NAMES[lang]}
                title={LANGUAGE_NAMES[lang]}
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

        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">{t.appearance.boardTheme}</span>
          <div className="flex flex-wrap gap-2">
            {BOARD_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => updateBoardTheme.mutate(theme.id)}
                aria-label={t.appearance.themes[theme.id]}
                aria-pressed={boardTheme === theme.id}
                title={t.appearance.themes[theme.id]}
                className={`ring-offset-background flex size-8 overflow-hidden rounded-md ring-offset-2 transition-all ${
                  boardTheme === theme.id
                    ? 'ring-primary ring-2'
                    : 'hover:ring-muted-foreground/40 hover:ring-1'
                }`}
              >
                <span className="h-full w-1/2" style={{ backgroundColor: theme.light }} />
                <span className="h-full w-1/2" style={{ backgroundColor: theme.dark }} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">{t.appearance.pieceSet}</span>
          <div className="flex flex-wrap gap-2">
            {PIECE_SETS.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => updatePieceSet.mutate(set.id)}
                aria-label={set.label}
                aria-pressed={pieceSet === set.id}
                title={set.label}
                className={`bg-muted/40 flex size-8 items-center justify-center rounded-md p-1 transition-colors ${
                  pieceSet === set.id ? 'ring-primary ring-2' : 'hover:bg-muted'
                }`}
              >
                {set.pieces.wN()}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-foreground text-base font-medium">{t.profile.accountTitle}</h2>
        <AccountSecurityPanel />
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-foreground text-base font-medium">{t.profile.legalTitle}</h2>
        <div className="flex flex-col gap-1 text-sm">
          <Link to="/terms" className="text-primary w-fit underline-offset-4 hover:underline">
            {t.profile.termsLink}
          </Link>
          <Link to="/privacy" className="text-primary w-fit underline-offset-4 hover:underline">
            {t.profile.privacyLink}
          </Link>
          <Link to="/credits" className="text-primary w-fit underline-offset-4 hover:underline">
            {t.footer.credits}
          </Link>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-base font-medium">{t.profile.exportTitle}</h2>
        <DataExportPanel />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-destructive text-base font-medium">{t.profile.dangerTitle}</h2>
        <p className="text-muted-foreground text-sm">{t.profile.deleteAccountDescription}</p>
        <div>
          <DeleteAccountDialog />
        </div>
      </section>

      <Separator />

      <Button variant="outline" size="sm" className="w-full sm:w-fit" onClick={handleSignOut}>
        <LogOut className="size-4" />
        {t.nav.signOut}
      </Button>
    </main>
  )
}
