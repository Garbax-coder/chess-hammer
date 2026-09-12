import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'chess-hammer-theme'

function resolveInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage non disponibile (es. modalita' privata): ignora.
    }
  }, [theme])

  function toggleTheme() {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}
