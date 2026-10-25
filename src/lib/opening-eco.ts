/**
 * Repertori a partire da un codice ECO o dal nome di un'apertura, con le
 * linee del dataset di Lichess (lichess-org/chess-openings, CC0) gia' nel
 * repository: ogni riga e' una posizione con nome, con le mosse dalla
 * posizione iniziale.
 */

export interface EcoLine {
  eco: string
  name: string
  /** Le mosse in SAN, dalla prima. */
  moves: string[]
}

export interface EcoChoice {
  /** 'eco:C50' oppure 'name:Italian Game'. */
  id: string
  kind: 'eco' | 'name'
  /** Il codice ECO o il nome (famiglia, o famiglia e variante). */
  key: string
  /** Per un codice ECO i nomi delle aperture; per un nome i codici ECO. */
  detail: string
  lines: number
}

/** Le righe di un file TSV del dataset (eco, name, pgn), senza intestazione. */
export function parseEcoTsv(text: string): EcoLine[] {
  return text
    .split('\n')
    .slice(1)
    .map((row) => row.split('\t'))
    .filter((cells) => cells.length >= 3)
    .map(([eco, name, pgn]) => ({
      eco,
      name,
      moves: pgn
        .trim()
        .split(/\s+/)
        .filter((token) => !/^\d+\.+$/.test(token)),
    }))
}

/** Tutto il dataset (circa 400 KB, caricato solo quando serve). */
export async function loadEcoLines(): Promise<EcoLine[]> {
  const files = await Promise.all([
    import('../../scripts/openings/lichess-openings/a.tsv?raw'),
    import('../../scripts/openings/lichess-openings/b.tsv?raw'),
    import('../../scripts/openings/lichess-openings/c.tsv?raw'),
    import('../../scripts/openings/lichess-openings/d.tsv?raw'),
    import('../../scripts/openings/lichess-openings/e.tsv?raw'),
  ])
  return files.flatMap((file) => parseEcoTsv(file.default))
}

/**
 * I nomi a cui puo' corrispondere una riga: la famiglia ("Sicilian
 * Defense") e la variante ("Sicilian Defense: Najdorf Variation"), senza le
 * sottovarianti dopo la virgola.
 */
function namePrefixes(name: string): string[] {
  const family = name.split(':')[0]
  const variation = name.split(',')[0]
  return variation === family ? [family] : [family, variation]
}

function belongsTo(line: EcoLine, choice: EcoChoice): boolean {
  if (choice.kind === 'eco') return line.eco === choice.key
  return (
    line.name === choice.key ||
    line.name.startsWith(`${choice.key}:`) ||
    line.name.startsWith(`${choice.key},`)
  )
}

/** Codici ECO, famiglie e varianti del dataset, ognuno con le sue linee. */
export function ecoChoices(lines: EcoLine[]): EcoChoice[] {
  const ecos = new Map<string, Set<string>>()
  const names = new Map<string, Set<string>>()
  const counts = new Map<string, number>()
  const count = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1)
  for (const line of lines) {
    ecos.set(line.eco, (ecos.get(line.eco) ?? new Set()).add(line.name.split(':')[0]))
    count(`eco:${line.eco}`)
    for (const prefix of namePrefixes(line.name)) {
      names.set(prefix, (names.get(prefix) ?? new Set()).add(line.eco))
      count(`name:${prefix}`)
    }
  }
  const choices: EcoChoice[] = []
  for (const [eco, families] of ecos) {
    choices.push({
      id: `eco:${eco}`,
      kind: 'eco',
      key: eco,
      detail: [...families].join(', '),
      lines: counts.get(`eco:${eco}`)!,
    })
  }
  for (const [name, codes] of names) {
    const sorted = [...codes].sort()
    choices.push({
      id: `name:${name}`,
      kind: 'name',
      key: name,
      detail: sorted.length > 1 ? `${sorted[0]}–${sorted.at(-1)}` : sorted[0],
      lines: counts.get(`name:${name}`)!,
    })
  }
  return choices
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Le scelte che corrispondono alla ricerca: i codici ECO che iniziano col
 * testo (es. "C5" -> C50...C59) e i nomi che lo contengono, senza accenti e
 * maiuscole. Prima i codici, poi i nomi piu' generali (famiglie) e con piu'
 * linee.
 */
export function searchEcoChoices(
  choices: EcoChoice[],
  query: string,
  limit = 20,
): EcoChoice[] {
  const q = normalize(query)
  if (!q) return []
  const rank = (c: EcoChoice) => (c.kind === 'eco' ? 0 : c.key.includes(':') ? 2 : 1)
  return choices
    .filter((c) =>
      c.kind === 'eco' ? normalize(c.key).startsWith(q) : normalize(c.key).includes(q),
    )
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.kind === 'eco' ? a.key.localeCompare(b.key) : b.lines - a.lines) ||
        a.key.localeCompare(b.key),
    )
    .slice(0, limit)
}

/**
 * Le linee di una scelta, come testo SAN, nell'ordine dell'albero con prima
 * i rami con piu' varianti: con una sola mossa dell'utente per posizione
 * vince quella con piu' teoria dietro (le altre restano alternative).
 */
export function ecoChoiceLines(lines: EcoLine[], choice: EcoChoice): string[] {
  const chosen = lines.filter((line) => belongsTo(line, choice))
  // Quante linee passano da ogni sequenza di mosse.
  const through = new Map<string, number>()
  for (const line of chosen) {
    for (let i = 1; i <= line.moves.length; i++) {
      const key = line.moves.slice(0, i).join(' ')
      through.set(key, (through.get(key) ?? 0) + 1)
    }
  }
  const order = (a: EcoLine, b: EcoLine) => {
    for (let i = 0; i < Math.min(a.moves.length, b.moves.length); i++) {
      if (a.moves[i] === b.moves[i]) continue
      const count = (line: EcoLine) =>
        through.get(line.moves.slice(0, i + 1).join(' ')) ?? 0
      return count(b) - count(a) || a.moves[i].localeCompare(b.moves[i])
    }
    return a.moves.length - b.moves.length
  }
  return chosen.sort(order).map((line) => line.moves.join(' '))
}
