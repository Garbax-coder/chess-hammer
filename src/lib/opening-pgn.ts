import { arrowsToPgn, type MoveArrow } from '@/lib/opening-arrows'
import type { OpeningColor } from '@/lib/opening-catalog'
import type { OpeningNode, OpeningTree } from '@/lib/opening-tree'

// Il PGN di un repertorio, con tutte le varianti: si legge su Lichess e in
// ogni programma di scacchi, e si reimporta (pgnLines). I commenti vanno tra
// graffe, con le frecce come [%cal ...]; le mosse che aprono una linea
// sbagliata hanno "?".

const LINE_WIDTH = 80
// Tra numero e mossa: non si va a capo li' (diventa uno spazio alla fine).
const GLUE = '\u00a0'

/**
 * L'ordine delle mosse in una posizione: prima quella principale (la linea
 * che continua), poi le altre linee e le alternative, per ultime le linee
 * sbagliate. A parita', nell'ordine in cui sono state aggiunte.
 */
function ordered(children: OpeningNode[]): OpeningNode[] {
  const rank = (n: OpeningNode) => (n.is_mistake ? 2 : n.is_main ? 0 : 1)
  return [...children].sort((a, b) => rank(a) - rank(b) || a.id - b.id)
}

function moveText(node: OpeningNode, withNumber: boolean): string {
  const number = Math.ceil(node.ply / 2)
  const san = `${node.san}${node.is_mistake ? '?' : ''}`
  if (node.ply % 2 === 1) return `${number}.${GLUE}${san}`
  return withNumber ? `${number}...${GLUE}${san}` : san
}

/** Le righe di al massimo 80 caratteri, spezzate tra una parola e l'altra. */
function wrap(text: string): string {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && line.length + 1 + word.length > LINE_WIDTH) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines.join('\n').replaceAll(GLUE, ' ')
}

export function repertoirePgn({
  name,
  eco,
  color,
  tree,
  comments,
  arrows,
  date = new Date(),
}: {
  name: string
  eco: string | null
  color: OpeningColor
  tree: OpeningTree
  /** Commenti da scrivere, per mossa (gia' risolti: vedi commentOf). */
  comments: Map<number, string>
  arrows: Map<number, MoveArrow[]>
  date?: Date
}): string {
  function annotation(node: OpeningNode): string {
    const text = [comments.get(node.id), arrowsToPgn(arrows.get(node.id) ?? [])]
      .filter(Boolean)
      .join(' ')
      .replace(/[{}]/g, '')
    return text ? `{${text}}` : ''
  }

  // Le mosse dopo `parentId`: la principale, le varianti tra parentesi e poi
  // il seguito della principale. Il numero di una mossa del Nero si scrive a
  // inizio variante e dopo un commento o una variante.
  function movesFrom(parentId: number | null, withNumber: boolean): string[] {
    const [main, ...others] = ordered(tree.children.get(parentId) ?? [])
    if (!main) return []
    const mainNote = annotation(main)
    const out = [moveText(main, withNumber)]
    if (mainNote) out.push(mainNote)
    for (const variation of others) {
      const note = annotation(variation)
      const tokens = [moveText(variation, true), note, ...movesFrom(variation.id, !!note)]
      out.push(`(${tokens.filter(Boolean).join(' ')})`)
    }
    out.push(...movesFrom(main.id, !!mainNote || others.length > 0))
    return out
  }

  const day = date.toISOString().slice(0, 10).replaceAll('-', '.')
  const headers = [
    ['Event', name],
    ['Site', 'https://chesshammer.com'],
    ['Date', day],
    ['White', '?'],
    ['Black', '?'],
    ['Result', '*'],
    ...(eco ? [['ECO', eco]] : []),
    ['Orientation', color === 'w' ? 'white' : 'black'],
  ]
  const tagPairs = headers
    .map(([tag, value]) => `[${tag} "${value.replace(/["\\]/g, '')}"]`)
    .join('\n')
  return `${tagPairs}\n\n${wrap([...movesFrom(null, true), '*'].join(' '))}\n`
}
