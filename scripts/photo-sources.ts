// Writes docs/PHOTO_SOURCES.md: where every station photo in the trip steps came from. The site shows no credit for
// these demo photos (owner, 4 Nov 2026), so this list is the record; all of them are replaced after launch.
// Run: npm run photo-sources   (Node 22.18+ runs TypeScript directly)
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SIGN_PHOTOS } from '../src/data/stationPhotos.ts'
import { PLATFORM_PHOTOS } from '../src/data/platformPhotos.ts'

const cell = (s: string) => s.replace(/\|/g, '\\|')
const row = (key: string, p: { src: string; author: string; license: string; page: string; owner?: boolean }) =>
  `| ${cell(key)} | ${p.owner ? 'Supplied by the owner' : cell(p.page || p.src)} | ${cell(p.author)} | ${cell(p.license)} |`

const lines = [
  '# Station photo sources',
  '',
  'Demo photos shown in the trip steps. The site shows no credit for them (owner, 4 Nov 2026); this list records where',
  'each one came from. All of them are to be replaced with our own photos after launch. Do not edit by hand: run',
  '`npm run photo-sources`.',
  '',
  `## Platform sign photos (${Object.keys(PLATFORM_PHOTOS).length})`,
  '',
  'Shown for one direction at a station ("feed:stop>towards"), zoomed in on the sign and turned to face the camera.',
  '',
  '| Station | Source | Author | Licence |',
  '|---|---|---|---|',
  ...Object.entries(PLATFORM_PHOTOS).map(([k, p]) => row(k, p)),
  '',
  `## Station photos (${Object.keys(SIGN_PHOTOS).length})`,
  '',
  'Shown when there is no platform sign photo for that direction.',
  '',
  '| Station | Source | Author | Licence |',
  '|---|---|---|---|',
  ...Object.entries(SIGN_PHOTOS).map(([k, p]) => row(k, p)),
  '',
]
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'PHOTO_SOURCES.md'), lines.join('\n'))
console.log('wrote docs/PHOTO_SOURCES.md')
