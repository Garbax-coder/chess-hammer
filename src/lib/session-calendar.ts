export type RoundNumber = 1 | 2 | 3

export interface CalendarDay {
  date: Date
  round: RoundNumber
}

export interface SessionCalendarResult {
  days: CalendarDay[]
  /** true se la stima e' stata troncata perche' troppo lunga da mostrare. */
  truncated: boolean
}

// Limite di sicurezza sul numero di giorni calcolati: con quote giornaliere
// molto basse la stima potrebbe altrimenti coprire anni di calendario.
const MAX_PREVIEW_DAYS = 366

function addDays(date: Date, amount: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Giorno per giorno, dall'inizio sessione alla fine del 3° giro: stessa
// formula (Math.ceil(totale/quota)) gia' usata per la stima testuale
// "~N giorni" di ogni giro, ma qui applicata giorno-per-giorno per poterla
// disegnare su un calendario reale.
export function computeSessionCalendar(
  startDate: Date,
  totalPuzzles: number,
  dailyTargets: readonly [number, number, number],
): SessionCalendarResult | null {
  if (!Number.isFinite(totalPuzzles) || totalPuzzles < 1) return null
  if (dailyTargets.some((target) => !Number.isFinite(target) || target < 1)) return null

  const days: CalendarDay[] = []
  let cursor = startOfDay(startDate)
  let truncated = false

  outer: for (const [i, target] of dailyTargets.entries()) {
    const round = (i + 1) as RoundNumber
    const roundDays = Math.ceil(totalPuzzles / target)
    for (let d = 0; d < roundDays; d++) {
      if (days.length >= MAX_PREVIEW_DAYS) {
        truncated = true
        break outer
      }
      days.push({ date: cursor, round })
      cursor = addDays(cursor, 1)
    }
  }

  return { days, truncated }
}
