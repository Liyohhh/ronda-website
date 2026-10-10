// Home page slides ("Travel made effortless"). Copy: s<n>_tag/title/body/p1-3/cta in translations; photos in trailPhotos.ts
import type { SLIDE_PHOTOS } from './trailPhotos'

// action: a button that works on the Home page ('plan' / 'lines'), or a link to another page or a ready-made trip
export type Slide = { key: keyof typeof SLIDE_PHOTOS; n: 1 | 2 | 3 | 4 | 5; action: 'plan' | 'lines' | { to: string } }
export const SLIDES: Slide[] = [
  { key: 'plan', n: 1, action: 'plan' },
  { key: 'ronda300', n: 2, action: { to: '/ronda-300' } },
  { key: 'fares', n: 3, action: 'plan' },
  { key: 'saved', n: 4, action: { to: '/login' } },
  { key: 'airport', n: 5, action: { to: '/?to=ERL%20KLIA%20T1&toName=KLIA%20Terminal%201' } },
]
