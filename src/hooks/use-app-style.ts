import { useEffect } from 'react'
import { useUserStats } from '@/hooks/use-user-stats'
import { resolveAppStyle, type AppStyleId } from '@/lib/app-styles'
import { useAuth } from '@/lib/auth-context'

export function useAppStyle(): AppStyleId {
  const { user } = useAuth()
  const { data: stats } = useUserStats()
  return resolveAppStyle(!!user, stats?.app_style)
}

// Da chiamare una sola volta, alla radice dell'app: i colori seguono
// l'attributo data-style su <html> (vedi src/index.css) e l'icona della
// scheda il file public/favicon-<stile>.svg corrispondente.
export function useApplyAppStyle() {
  const style = useAppStyle()

  useEffect(() => {
    document.documentElement.dataset.style = style
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (icon) icon.href = `/favicon-${style}.svg`
  }, [style])
}
