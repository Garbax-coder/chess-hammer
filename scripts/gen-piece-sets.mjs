// Script una tantum: converte gli SVG scaricati in src/assets/pieces/<set>/*.svg
// in moduli TSX statici (un PieceRenderObject per set). Non fa parte della
// build: va rieseguito solo se si aggiornano/aggiungono set di pezzi.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const piecesDir = join(root, '..', 'src', 'assets', 'pieces')
const outDir = join(root, '..', 'src', 'lib', 'piece-sets')

const CODES = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK']

for (const set of readdirSync(piecesDir)) {
  const entries = CODES.map((code) => {
    const raw = readFileSync(join(piecesDir, set, `${code}.svg`), 'utf8')
    const viewBoxMatch = raw.match(/viewBox="([^"]+)"/)
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 45 45'
    const openTagEnd = raw.indexOf('>') + 1
    const closeTagStart = raw.lastIndexOf('</svg>')
    const inner = raw.slice(openTagEnd, closeTagStart)
    return { code, viewBox, inner }
  })

  const body = entries
    .map(
      ({ code, viewBox, inner }) => `  ${code}: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${viewBox}"
      width="100%"
      height="100%"
      style={props?.svgStyle}
      dangerouslySetInnerHTML={{ __html: ${JSON.stringify(inner)} }}
    />
  ),`,
    )
    .join('\n')

  const source = `// Generato da scripts/gen-piece-sets.mjs a partire dagli SVG in
// src/assets/pieces/${set}/ (lichess-org/lila, public/piece/${set}/, vedi
// src/lib/piece-sets/LICENSES.md per licenza e attribuzione). Non modificare
// a mano: rigenerare con \`node scripts/gen-piece-sets.mjs\`.
import type { PieceRenderObject } from 'react-chessboard'

export const ${set}Pieces: PieceRenderObject = {
${body}
}
`
  writeFileSync(join(outDir, `${set}.tsx`), source)
  console.log(`wrote ${set}.tsx (${entries.length} pieces)`)
}
