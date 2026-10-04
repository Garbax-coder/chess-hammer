// Script una tantum: legge le licenze delle dipendenze di produzione
// installate (license-checker-rseidelsohn) e scrive un elenco statico in
// src/lib/third-party-licenses.ts, mostrato nella pagina /credits. Non fa
// parte della build: va rieseguito solo dopo aver aggiunto/rimosso/
// aggiornato una dipendenza di produzione.
//
//   node scripts/gen-third-party-licenses.mjs
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outFile = join(root, 'src', 'lib', 'third-party-licenses.ts')

const raw = execFileSync(
  'npx',
  [
    '--yes',
    'license-checker-rseidelsohn',
    '--production',
    '--json',
    '--excludePackages',
    'chess-hammer@0.0.0',
  ],
  { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 * 20 },
)

const data = JSON.parse(raw)

const packages = Object.entries(data)
  .map(([nameVersion, info]) => {
    const at = nameVersion.lastIndexOf('@')
    return {
      name: nameVersion.slice(0, at),
      version: nameVersion.slice(at + 1),
      license: Array.isArray(info.licenses) ? info.licenses.join(' / ') : info.licenses,
      repository: info.repository ?? null,
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const source = `// Generato da scripts/gen-third-party-licenses.mjs a partire dalle
// dipendenze di produzione installate. Non modificare a mano: rigenerare con
// \`node scripts/gen-third-party-licenses.mjs\` dopo aver cambiato le
// dipendenze. Mostrato in /credits.
export interface ThirdPartyPackage {
  name: string
  version: string
  license: string
  repository: string | null
}

export const THIRD_PARTY_PACKAGES: ThirdPartyPackage[] = ${JSON.stringify(packages, null, 2)}
`

writeFileSync(outFile, source)
console.log(`wrote ${packages.length} packages to ${outFile}`)
