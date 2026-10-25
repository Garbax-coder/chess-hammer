import {
  buildOpeningTree,
  isUserMove,
  moveLabel,
  openingCoverage,
  runPath,
  type OpeningProgress,
} from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'

/** Quello che restituisce opening_stats (migrazione 0109). */
export interface OpeningStatsData {
  nodes: { node_id: number; attempts: number; wrong: number; avg_ms: number | null }[]
  days: { day: string; attempts: number; correct: number }[]
  cycles: { repertoire_id: string; cycles: number; best_ms: number }[]
}

/** Tentativi minimi su una mossa perche' conti tra le piu' difficili. */
export const MIN_HARD_ATTEMPTS = 3
const HARDEST_COUNT = 5
export const ACTIVITY_DAYS = 30

interface Tries {
  tries: number
  wrong: number
  totalMs: number
  timedTries: number
}

export interface RepertoireStats extends Tries {
  repertoire: RepertoireWithNodes
  userMoves: number
  mastered: number
  due: number
  lines: number
  linesMastered: number
  cycles: number
}

export interface HardMove {
  repertoire: RepertoireWithNodes
  nodeId: number
  /** Le mosse fino a quella difficile, in notazione (es. "1.e4 e5 2.Nf3"). */
  line: string
  tries: number
  accuracy: number
}

export interface OpeningStatsSummary {
  overview: Tries & {
    userMoves: number
    mastered: number
    lines: number
    linesMastered: number
    cycles: number
  }
  byRepertoire: RepertoireStats[]
  hardest: HardMove[]
  /** Gli ultimi giorni, dal piu' vecchio a oggi (UTC), anche quelli vuoti. */
  activity: { day: string; attempts: number; correct: number }[]
}

const NO_TRIES: Tries = { tries: 0, wrong: 0, totalMs: 0, timedTries: 0 }

/** Percentuale di risposte giuste al primo tentativo (0 senza tentativi). */
export function accuracyOf({ tries, wrong }: Tries): number {
  return tries > 0 ? ((tries - wrong) / tries) * 100 : 0
}

/** Tempo medio di risposta in secondi, o null se non c'e' nessun tempo. */
export function averageSecondsOf({ totalMs, timedTries }: Tries): number | null {
  return timedTries > 0 ? totalMs / timedTries / 1000 : null
}

function addTries(a: Tries, n: OpeningStatsData['nodes'][number]): Tries {
  return {
    tries: a.tries + n.attempts,
    wrong: a.wrong + n.wrong,
    totalMs: a.totalMs + (n.avg_ms ?? 0) * n.attempts,
    timedTries: a.timedTries + (n.avg_ms === null ? 0 : n.attempts),
  }
}

/**
 * Le statistiche delle aperture: per tutta la libreria, per repertorio, le
 * mosse con piu' errori e l'attivita' degli ultimi giorni. Conta solo il
 * primo tentativo di ogni mossa (come i progressi).
 */
export function summarizeOpenings(
  repertoires: RepertoireWithNodes[],
  progress: Map<number, OpeningProgress>,
  stats: OpeningStatsData,
  now: Date,
): OpeningStatsSummary {
  const byNode = new Map(stats.nodes.map((n) => [n.node_id, n]))
  const cycles = new Map(stats.cycles.map((c) => [c.repertoire_id, c.cycles]))
  const byRepertoire: RepertoireStats[] = []
  const hard: HardMove[] = []

  for (const repertoire of repertoires) {
    const tree = buildOpeningTree(repertoire.nodes)
    const coverage = openingCoverage(tree, progress, repertoire.color, now)
    let tries = NO_TRIES
    for (const node of repertoire.nodes) {
      const row = byNode.get(node.id)
      if (!row) continue
      tries = addTries(tries, row)
      if (
        isUserMove(node, repertoire.color) &&
        row.attempts >= MIN_HARD_ATTEMPTS &&
        row.wrong > 0
      ) {
        hard.push({
          repertoire,
          nodeId: node.id,
          line: runPath(tree, node.id)
            .map((n, i) => moveLabel(n, i === 0))
            .join(' '),
          tries: row.attempts,
          accuracy: ((row.attempts - row.wrong) / row.attempts) * 100,
        })
      }
    }
    byRepertoire.push({
      repertoire,
      ...tries,
      userMoves: coverage.userMoves,
      mastered: coverage.mastered,
      due: coverage.due,
      lines: coverage.runs,
      linesMastered: coverage.runsMastered,
      cycles: cycles.get(repertoire.id) ?? 0,
    })
  }

  const overview = byRepertoire.reduce(
    (sum, r) => ({
      tries: sum.tries + r.tries,
      wrong: sum.wrong + r.wrong,
      totalMs: sum.totalMs + r.totalMs,
      timedTries: sum.timedTries + r.timedTries,
      userMoves: sum.userMoves + r.userMoves,
      mastered: sum.mastered + r.mastered,
      lines: sum.lines + r.lines,
      linesMastered: sum.linesMastered + r.linesMastered,
      cycles: sum.cycles + r.cycles,
    }),
    { ...NO_TRIES, userMoves: 0, mastered: 0, lines: 0, linesMastered: 0, cycles: 0 },
  )

  const days = new Map(stats.days.map((d) => [d.day, d]))
  const activity = Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() - (ACTIVITY_DAYS - 1 - i))
    const day = date.toISOString().slice(0, 10)
    return {
      day,
      attempts: days.get(day)?.attempts ?? 0,
      correct: days.get(day)?.correct ?? 0,
    }
  })

  return {
    overview,
    // Prima i repertori allenati, poi per numero di tentativi.
    byRepertoire: byRepertoire.sort((a, b) => b.tries - a.tries),
    hardest: hard
      .sort((a, b) => a.accuracy - b.accuracy || b.tries - a.tries)
      .slice(0, HARDEST_COUNT),
    activity,
  }
}
