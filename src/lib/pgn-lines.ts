// Le linee di un PGN con varianti, per importarlo come repertorio: ogni
// percorso dalla posizione iniziale alla fine di una variante diventa una
// linea (mosse SAN separate da spazi), la linea principale per prima. Un PGN
// con piu' partite (es. i capitoli di uno studio Lichess) da' le linee di
// tutte. Commenti, annotazioni ($1, !, ?), numeri di mossa e risultati si
// ignorano; le partite che non partono dalla posizione iniziale (tag FEN) si
// saltano. La legalita' delle mosse la controlla chi costruisce il
// repertorio (buildRepertoire).

export interface PgnLines {
  lines: string[]
  /** Valori dei tag della prima partita (es. Event, Opening). */
  headers: Record<string, string>
  /** Partite saltate perche' partono da un'altra posizione. */
  skipped: number
}

const RESULT = /^(1-0|0-1|1\/2-1\/2|\*)$/
const MOVE_NUMBER = /^\d+\.+$/

/** Le partite di un PGN: tag e testo delle mosse di ciascuna. */
function splitGames(text: string): { headers: Record<string, string>; moves: string }[] {
  const games: { headers: Record<string, string>; moves: string }[] = []
  let current: { headers: Record<string, string>; moves: string } | null = null
  for (const rawLine of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trim()
    const tag = /^\[(\w+)\s+"(.*)"\]$/.exec(line)
    if (tag) {
      // Un tag dopo delle mosse apre una partita nuova.
      if (!current || current.moves.trim() !== '') {
        current = { headers: {}, moves: '' }
        games.push(current)
      }
      current.headers[tag[1]] = tag[2]
      continue
    }
    if (!current) {
      current = { headers: {}, moves: '' }
      games.push(current)
    }
    current.moves += `${line}\n`
  }
  return games.filter((g) => g.moves.trim() !== '')
}

/** Segnaposto del risultato: chiude una partita (anche senza tag dopo). */
const END = '#end'

/** Le mosse e le parentesi delle varianti, senza commenti e annotazioni. */
function tokenize(moves: string): string[] {
  const clean = moves
    .replace(/\{[^}]*\}/g, ' ') // commenti tra graffe
    .replace(/;[^\n]*/g, ' ') // commenti fino a fine riga
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
  const tokens: string[] = []
  for (const raw of clean.split(/\s+/)) {
    if (RESULT.test(raw)) {
      tokens.push(END)
      continue
    }
    if (!raw || MOVE_NUMBER.test(raw) || /^\$\d+$/.test(raw)) continue
    if (raw === '(' || raw === ')') {
      tokens.push(raw)
      continue
    }
    // "12.Nf3" scritto attaccato, annotazioni "!?" in coda, arrocco con lo zero.
    const san = raw
      .replace(/^\d+\.+/, '')
      .replace(/[!?]+$/, '')
      .replace(/^0-0-0/, 'O-O-O')
      .replace(/^0-0/, 'O-O')
    if (san) tokens.push(san)
  }
  return tokens
}

/**
 * Le linee di una sequenza di mosse con varianti, da `start` (indice nei
 * token) fino alla parentesi che la chiude. Una variante si apre dopo la
 * mossa che sostituisce: parte dalla posizione prima di quella mossa.
 */
function walk(
  tokens: string[],
  start: number,
  prefix: string[],
): { lines: string[][]; end: number } {
  const main = [...prefix]
  const variations: string[][] = []
  let i = start
  while (i < tokens.length) {
    const token = tokens[i]
    if (token === ')') return { lines: [main, ...variations], end: i + 1 }
    if (token === '(') {
      const sub = walk(tokens, i + 1, main.slice(0, -1))
      variations.push(...sub.lines)
      i = sub.end
      continue
    }
    main.push(token)
    i++
  }
  return { lines: [main, ...variations], end: i }
}

export function pgnLines(text: string): PgnLines {
  const games = splitGames(text)
  let skipped = 0
  const lines: string[] = []
  for (const game of games) {
    if (game.headers.FEN || game.headers.SetUp === '1') {
      skipped++
      continue
    }
    // Piu' partite senza tag tra loro: le separa il risultato.
    const tokens = tokenize(game.moves)
    let start = 0
    for (let i = 0; i <= tokens.length; i++) {
      if (i < tokens.length && tokens[i] !== END) continue
      for (const line of walk(tokens.slice(start, i), 0, []).lines) {
        if (line.length > 0) lines.push(line.join(' '))
      }
      start = i + 1
    }
  }
  return { lines: [...new Set(lines)], headers: games[0]?.headers ?? {}, skipped }
}
