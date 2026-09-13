import { useEffect, useState } from 'react'
import { setSoundEnabled } from '@/lib/sound-effects'

const STORAGE_KEY = 'chess-hammer-sound-enabled'

function readStored(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === null ? true : stored === 'true'
}

/** Preferenza per-dispositivo (localStorage), come le impostazioni del motore. */
export function useSoundEnabled() {
  const [enabled, setEnabledState] = useState(readStored)

  useEffect(() => {
    setSoundEnabled(enabled)
  }, [enabled])

  function update(value: boolean) {
    setEnabledState(value)
    window.localStorage.setItem(STORAGE_KEY, String(value))
  }

  return { enabled, setEnabled: update }
}
