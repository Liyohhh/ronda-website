// Writes public/lines/<id>.svg for every line, plus public/lines/lines.json (names + colours),
// so the Flutter app and other repos can use the same badges.
// Run: npm run lines:export   (Node 22.18+ runs TypeScript directly)
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LINES, lineBadgeSvg } from '../src/data/lines.ts'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'lines')
mkdirSync(out, { recursive: true })

for (const line of LINES) writeFileSync(join(out, `${line.id}.svg`), lineBadgeSvg(line) + '\n')

const manifest = LINES.map(({ id, name, mode, code, color, textColor, colorSource, gtfs }) => ({
  id, name, mode, code: code ?? null, color, textColor, colorSource, gtfs, svg: `/lines/${id}.svg`,
}))
writeFileSync(join(out, 'lines.json'), JSON.stringify(manifest, null, 2) + '\n')

console.log(`wrote ${LINES.length} badges + lines.json to ${out}`)
