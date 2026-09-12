import { useEffect, useState } from 'react'

const STORAGE_KEY = 'chess-hammer-engine-settings'

export interface EngineSettings {
  multiPv: number // 1-5
  depth: number
  showBestMoveArrow: boolean
}

export const DEFAULT_ENGINE_SETTINGS: EngineSettings = {
  multiPv: 3,
  depth: 16,
  showBestMoveArrow: true,
}

function loadEngineSettings(): EngineSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ENGINE_SETTINGS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_ENGINE_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_ENGINE_SETTINGS
  }
}

function saveEngineSettings(settings: EngineSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage non disponibile (es. modalita' privata): ignora.
  }
}

/**
 * Preferenze del pannello di analisi (numero di linee, profondita', freccia
 * mossa migliore). Salvate in localStorage: sono comode "da power user" ma
 * non richiedono, a differenza di auto_advance, di restare consistenti tra
 * dispositivi diversi.
 */
export function useEngineSettings() {
  const [settings, setSettings] = useState<EngineSettings>(() => loadEngineSettings())

  useEffect(() => {
    saveEngineSettings(settings)
  }, [settings])

  function update(patch: Partial<EngineSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  return { settings, update }
}
