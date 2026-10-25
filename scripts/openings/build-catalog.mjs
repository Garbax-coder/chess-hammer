// Genera le migrazioni del catalogo delle aperture:
//   node scripts/openings/build-catalog.mjs
// - 0101_opening_catalog.sql dalle linee scritte a mano in
//   scripts/openings/repertoires.json (ogni mossa controllata con chess.js,
//   vedi src/lib/opening-catalog.ts);
// - 0102_opening_names.sql dai nomi delle aperture di Lichess in
//   scripts/openings/lichess-openings (vedi src/lib/opening-names.ts).
// Dopo una modifica: rigenerare, applicare in sviluppo e ricontrollare i test.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogSql } from '../../src/lib/opening-catalog.ts'
import { openingNamesSql, parseOpeningNamesTsv } from '../../src/lib/opening-names.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function write(file, header, body) {
  const target = join(root, 'supabase/migrations', file)
  writeFileSync(target, `${header}\n${body}`)
  console.log(`Scritto ${target}`)
}

const sources = JSON.parse(
  readFileSync(join(root, 'scripts/openings/repertoires.json'), 'utf8'),
)
write(
  '0101_opening_catalog.sql',
  `-- Catalogo dei repertori di apertura (branch feature/opening-training).
-- GENERATO da scripts/openings/build-catalog.mjs a partire da
-- scripts/openings/repertoires.json: non modificare a mano.
`,
  catalogSql(sources),
)

const names = ['a', 'b', 'c', 'd', 'e'].flatMap((file) =>
  parseOpeningNamesTsv(
    readFileSync(join(root, `scripts/openings/lichess-openings/${file}.tsv`), 'utf8'),
  ),
)
write(
  '0102_opening_names.sql',
  `-- Nomi delle aperture (branch feature/opening-training), dal dataset CC0
-- lichess-org/chess-openings: una riga per posizione, e la vista che li lega
-- alle mosse dei repertori. GENERATO da scripts/openings/build-catalog.mjs a
-- partire da scripts/openings/lichess-openings: non modificare a mano.
`,
  openingNamesSql(names),
)
