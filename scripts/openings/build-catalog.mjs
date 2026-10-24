// Genera la migrazione del catalogo delle aperture dalle linee scritte a mano
// in scripts/openings/repertoires.json:
//   node scripts/openings/build-catalog.mjs
// Controlla ogni mossa con chess.js (vedi src/lib/opening-catalog.ts) e
// sovrascrive supabase/migrations/0101_opening_catalog.sql. Dopo una modifica
// alle linee: rigenerare, applicare in sviluppo e ricontrollare i test.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogSql } from '../../src/lib/opening-catalog.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const sources = JSON.parse(
  readFileSync(join(root, 'scripts/openings/repertoires.json'), 'utf8'),
)

const header = `-- Catalogo dei repertori di apertura (branch feature/opening-training).
-- GENERATO da scripts/openings/build-catalog.mjs a partire da
-- scripts/openings/repertoires.json: non modificare a mano.
`

const target = join(root, 'supabase/migrations/0101_opening_catalog.sql')
writeFileSync(target, `${header}\n${catalogSql(sources)}`)
console.log(`Scritto ${target}`)
