// Le linee di un PGN con varianti, per importarlo come repertorio: ogni
// percorso dalla posizione iniziale alla fine di una variante diventa una
// linea (mosse SAN separate da spazi), la linea principale per prima. Un PGN
// con piu' partite (es. i capitoli di uno studio Lichess) da' le linee di
// tutte. I commenti {…} si legano alla mossa che li precede (senza le
// annotazioni tecniche di Lichess come [%cal …] o [%clk …]); le mosse con ?
// o ?? (o $2, $4) sono errori, che aprono una linea sbagliata; le altre
// annotazioni ($1, !, !?), numeri di mossa e risultati si ignorano; le partite che non
// partono dalla posizione iniziale (tag FEN) si saltano. La legalita' delle mosse la controlla chi costruisce il
// repertorio (buildRepertoire).

export interface PgnLines {
  lines: string[]
  /** Valori dei tag della prima partita (es. Event, Opening). */
  headers: Record<string, string>
  /** Partite saltate perche' partono da un'altra posizione. */
  skipped: number
  /** Commenti per mossa: chiave = mosse SAN dall'inizio fino a quella. */
  comments: Record<string, string>
  /** Le mosse segnate come errore (stessa chiave dei commenti). */
  mistakes: string[]
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

type Token =
  | { kind: 'move'; san: string; mistake: boolean }
  | { kind: 'open' | 'close' | 'end' }
  | { kind: 'comment'; text: string }

/** Il testo di un commento, senza le annotazioni [%…] di Lichess. */
function cleanComment(raw: string): string {
  return raw
    .replace(/\[%[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Mosse, parentesi delle varianti, commenti e fine partita. */
function tokenize(moves: string): Token[] {
  const comments: string[] = []
  const clean = moves
    // Ogni commento diventa un segnaposto, per non spezzarlo negli spazi.
    .replace(/\{([^}]*)\}/g, (_match, text: string) => {
      comments.push(text)
      return ` \u0001${comments.length - 1} `
    })
    .replace(/;[^\n]*/g, ' ') // commenti fino a fine riga
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
  const tokens: Token[] = []
  for (const raw of clean.split(/\s+/)) {
    if (raw.startsWith('\u0001')) {
      const text = cleanComment(comments[Number(raw.slice(1))])
      if (text) tokens.push({ kind: 'comment', text })
      continue
    }
    if (RESULT.test(raw)) {
      tokens.push({ kind: 'end' })
      continue
    }
    // $2 (?) e $4 (??) dopo una mossa la segnano come errore.
    if (raw === '$2' || raw === '$4') {
      const last = tokens[tokens.length - 1]
      if (last?.kind === 'move') last.mistake = true
      continue
    }
    if (!raw || MOVE_NUMBER.test(raw) || /^\$\d+$/.test(raw)) continue
    if (raw === '(' || raw === ')') {
      tokens.push({ kind: raw === '(' ? 'open' : 'close' })
      continue
    }
    // "12.Nf3" scritto attaccato, annotazioni "!?" in coda, arrocco con lo zero.
    const suffix = /[!?]+$/.exec(raw)?.[0]
    const san = raw
      .replace(/^\d+\.+/, '')
      .replace(/[!?]+$/, '')
      .replace(/^0-0-0/, 'O-O-O')
      .replace(/^0-0/, 'O-O')
    if (san)
      tokens.push({ kind: 'move', san, mistake: suffix === '?' || suffix === '??' })
  }
  return tokens
}

/**
 * Le linee di una sequenza di mosse con varianti, da `start` (indice nei
 * token) fino alla parentesi che la chiude. Una variante si apre dopo la
 * mossa che sostituisce: parte dalla posizione prima di quella mossa. Un
 * commento va alla mossa appena giocata in questa sequenza.
 */
function walk(
  tokens: Token[],
  start: number,
  prefix: string[],
  comments: Record<string, string>,
  mistakes: Set<string>,
): { lines: string[][]; end: number } {
  const main = [...prefix]
  const variations: string[][] = []
  let played = 0
  let i = start
  while (i < tokens.length) {
    const token = tokens[i]
    if (token.kind === 'close') return { lines: [main, ...variations], end: i + 1 }
    if (token.kind === 'open') {
      const sub = walk(tokens, i + 1, main.slice(0, -1), comments, mistakes)
      variations.push(...sub.lines)
      i = sub.end
      continue
    }
    if (token.kind === 'comment') {
      if (played > 0) {
        const key = main.join(' ')
        comments[key] = comments[key] ? `${comments[key]} ${token.text}` : token.text
      }
    } else if (token.kind === 'move') {
      main.push(token.san)
      if (token.mistake) mistakes.add(main.join(' '))
      played++
    }
    i++
  }
  return { lines: [main, ...variations], end: i }
}

export function pgnLines(text: string): PgnLines {
  const games = splitGames(text)
  let skipped = 0
  const lines: string[] = []
  const comments: Record<string, string> = {}
  const mistakes = new Set<string>()
  for (const game of games) {
    if (game.headers.FEN || game.headers.SetUp === '1') {
      skipped++
      continue
    }
    // Piu' partite senza tag tra loro: le separa il risultato.
    const tokens = tokenize(game.moves)
    let start = 0
    for (let i = 0; i <= tokens.length; i++) {
      if (i < tokens.length && tokens[i].kind !== 'end') continue
      for (const line of walk(tokens.slice(start, i), 0, [], comments, mistakes).lines) {
        if (line.length > 0) lines.push(line.join(' '))
      }
      start = i + 1
    }
  }
  return {
    lines: [...new Set(lines)],
    headers: games[0]?.headers ?? {},
    skipped,
    comments,
    mistakes: [...mistakes],
  }
}
