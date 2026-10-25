import { useState } from 'react'

function readStored(key: string, fallback: boolean): boolean {
  try {
    const stored = window.localStorage.getItem(key)
    return stored === null ? fallback : stored === 'true'
  } catch {
    return fallback
  }
}

/**
 * Un interruttore ricordato su questo dispositivo (localStorage), come i
 * suoni. Senza localStorage (es. modalita' privata) vale solo finche' la
 * pagina resta aperta.
 */
export function useLocalToggle(key: string, fallback: boolean) {
  const [value, setValue] = useState(() => readStored(key, fallback))

  function update(next: boolean) {
    setValue(next)
    try {
      window.localStorage.setItem(key, String(next))
    } catch {
      // localStorage non disponibile: resta la scelta in memoria.
    }
  }

  return [value, update] as const
}
