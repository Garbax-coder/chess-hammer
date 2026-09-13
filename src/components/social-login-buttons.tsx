import type { ComponentType } from 'react'
import { GoogleIcon } from '@/components/social-icons'
import { Button } from '@/components/ui/button'
import { oauthProviders, signInWithOAuth, type OAuthProvider } from '@/lib/auth'
import { useTranslations } from '@/lib/language-context'

const icons: Record<OAuthProvider, ComponentType<{ className?: string }>> = {
  google: GoogleIcon,
  facebook: GoogleIcon, // sostituito quando aggiungiamo il provider Facebook
}

export function SocialLoginButtons({ onError }: { onError: (message: string) => void }) {
  const t = useTranslations()

  async function handleClick(provider: OAuthProvider) {
    const { error } = await signInWithOAuth(provider)
    if (error) onError(error.message)
  }

  return (
    <div className="flex flex-col gap-2">
      {oauthProviders.map(({ id, label }) => {
        const Icon = icons[id]
        return (
          <Button
            key={id}
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleClick(id)}
          >
            <Icon className="size-4" />
            {t.socialLogin.continueWith(label)}
          </Button>
        )
      })}
    </div>
  )
}
