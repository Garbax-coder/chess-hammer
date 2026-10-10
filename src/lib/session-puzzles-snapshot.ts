import type { SessionPuzzleResult } from '@/types/training'

// Copia locale della lista puzzle della sessione attiva (dichiarata nella
// privacy policy): alla visita successiva si scarica solo cio' che e'
// cambiato invece dell'intera lista. Una sola sessione alla volta; si
// cancella all'uscita dall'account (vedi signOut).
const PREFIX = 'chess-hammer-session-puzzles:'
const VERSION = 1

interface Snapshot {
  v: number
  puzzles: SessionPuzzleResult[]
}

export function readSnapshot(sessionId: string): SessionPuzzleResult[] | null {
  try {
    const raw = localStorage.getItem(PREFIX + sessionId)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Snapshot
    return parsed.v === VERSION && Array.isArray(parsed.puzzles) ? parsed.puzzles : null
  } catch {
    return null
  }
}

export function writeSnapshot(sessionId: string, puzzles: SessionPuzzleResult[]): void {
  try {
    clearSnapshots(sessionId)
    const snapshot: Snapshot = { v: VERSION, puzzles }
    localStorage.setItem(PREFIX + sessionId, JSON.stringify(snapshot))
  } catch {
    // Memoria piena o non disponibile: si rinuncia alla copia locale.
  }
}

export function clearSnapshots(exceptSessionId?: string): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith(PREFIX) && key !== PREFIX + exceptSessionId) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // localStorage non disponibile: non c'e' nulla da cancellare.
  }
}
