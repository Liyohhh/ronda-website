import { useMemo } from 'react'

// Small isometric city scenes for the home page promotion cards, in place of photos: a block of streets with a
// park and the river, a train on its viaduct (in the line's official colour), buildings, and what the card is about
// marked with a gold pin (navy while the card is pointed at, index.css .pm-pin). Decorative (the card's words say it all).
// ronda300: a station block with its dashed 300 m ring; partners: twin towers and hotels by the line;
// offers: the walk from the viaduct to a row of stalls.

export type PromoMapKind = 'ronda300' | 'partners' | 'offers'

const NAVY = '#222D52'
const GOLD = '#D2B68A'
const LINE = { kelanaJaya: '#D50032', kajang: '#047940', monorail: '#84BD00' }

// plan coordinates (x, y on the ground, z up) to the picture
const S = 6.2 // pixels per plan unit
const iso = (x: number, y: number, z: number): [number, number] => [200 + (x - y) * S, 78 + (x + y) * S * 0.58 - z * S]
const pts = (p: [number, number][]) => p.map((q) => q.join(',')).join(' ')

function box(x: number, y: number, w: number, d: number, h: number, top: string, left: string, right: string) {
  const a = iso(x, y, h), b = iso(x + w, y, h), c = iso(x + w, y + d, h), e = iso(x, y + d, h)
  const b0 = iso(x + w, y, 0), c0 = iso(x + w, y + d, 0), e0 = iso(x, y + d, 0)
  return `<polygon points="${pts([a, b, c, e])}" fill="${top}"/><polygon points="${pts([e, c, c0, e0])}" fill="${left}"/><polygon points="${pts([b, c, c0, b0])}" fill="${right}"/>`
}
const ground = (x: number, y: number, w: number, d: number, fill: string) =>
  `<polygon points="${pts([iso(x, y, 0), iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x, y + d, 0)])}" fill="${fill}"/>`
// building colours: plain, warm, cool
const house = (x: number, y: number, w: number, d: number, h: number) => box(x, y, w, d, h, '#FFFFFF', '#D8D2C6', '#ECE7DD')
const warm = (x: number, y: number, w: number, d: number, h: number) => box(x, y, w, d, h, '#F7E6D8', '#D9C2AE', '#EAD5C3')
const cool = (x: number, y: number, w: number, d: number, h: number) => box(x, y, w, d, h, '#E6EEF8', '#B9C8DC', '#D2DEEC')

function tree(x: number, y: number) {
  const [p, q] = iso(x, y, 0)
  return `<rect x="${p - 0.8}" y="${q - 6}" width="1.6" height="6" fill="#6B5A3A"/><circle cx="${p}" cy="${q - 8}" r="4" fill="#5E8C3A"/>`
}
function pin(x: number, y: number) {
  return `<ellipse cx="${x}" cy="${y + 1}" rx="5" ry="1.8" fill="#000" opacity=".18"/>` +
    `<path d="M${x} ${y}c-5.5-7-9.5-10-9.5-15.5a9.5 9.5 0 0 1 19 0c0 5.5-4 8.5-9.5 15.5z" fill="${GOLD}" stroke="${NAVY}" stroke-width="1.8" class="pm-pin"/>` +
    `<circle cx="${x}" cy="${y - 15.5}" r="3.2" fill="${NAVY}" class="pm-pin-dot"/>`
}
// the viaduct along y, with its pillars, and a train of cars on it (the first car in the line's colour)
function viaduct(y: number) {
  let s = ground(-6, y - 0.3, 30, 1.8, '#D9D3C7')
  for (let x = -4; x < 24; x += 3) {
    const [a, b] = iso(x, y + 0.6, 0)
    const [, top] = iso(x, y + 0.6, 1.4)
    s += `<rect x="${a - 1}" y="${top}" width="2" height="${b - top}" fill="#B9B2A5"/>`
  }
  return s + box(-6, y - 0.3, 30, 1.8, 1.6, '#E8E2D6', '#CFC8BB', '#DDD6C9')
}
function train(x: number, y: number, cars: number, color: string) {
  let s = ''
  for (let i = 0; i < cars; i++) s += box(x + i * 4, y, 3.6, 1.2, 2.4, i === 0 ? color : '#FFFFFF', '#9AA3BF', '#C9CEE0')
  return s
}
// the ground under every scene: the block, two streets, a park with trees, the river, and a back row of buildings
const base = () =>
  ground(-6, -6, 32, 32, '#EAE5DB') + ground(-6, 8, 32, 1.6, '#FFFFFF') + ground(6, -6, 1.6, 32, '#FFFFFF') +
  ground(14, 12, 10, 10, '#D5E3C4') + ground(-6, 16, 8, 10, '#CFE0E4') +
  house(-4, -5, 3, 3, 4) + warm(17, -4, 3, 3, 5) + house(21, -3, 3, 2, 3) + cool(-5, -1, 2, 2, 5) +
  tree(17, 15) + tree(21, 19) + tree(18, 20) + tree(22, 14) + tree(2, 7.2) + tree(13, 7.2)

function scene(kind: PromoMapKind) {
  if (kind === 'ronda300') {
    const [rx, ry] = iso(8, 5, 0)
    return base() + house(0, 0, 4, 4, 5) + box(9, 1, 4, 3, 8, '#F3EFE6', '#D2CBBE', '#E5DFD3') + tree(16, 14) + tree(19, 16) +
      viaduct(4) + train(-2, 4.2, 4, LINE.kelanaJaya) + house(2, 10, 5, 4, 3) + warm(10, 10, 3, 3, 4) +
      `<ellipse cx="${rx}" cy="${ry}" rx="44" ry="25" fill="${NAVY}" fill-opacity=".04" stroke="${NAVY}" stroke-opacity=".45" stroke-dasharray="4 5"/>` +
      pin(...iso(12, 11, 4.6))
  }
  if (kind === 'partners') {
    const towers = cool(1, 0, 2, 2, 9) + cool(4, 0, 2, 2, 9)
    return base() + towers + house(9, 1, 5, 3, 6) + viaduct(5) + train(4, 5.2, 3, LINE.kajang) + cool(2, 10, 6, 4, 5) +
      house(11, 11, 4, 4, 3) + tree(16, 15) + tree(20, 18) + pin(...iso(5, 12, 5.4))
  }
  const stall = (x: number, top: string, left: string, right: string) => box(x, 10.2, 3, 2, 1.4, top, left, right)
  return base() + house(0, 0, 4, 3, 4) + box(10, 0, 3, 3, 6, '#F3EFE6', '#D2CBBE', '#E5DFD3') + viaduct(4) +
    train(-4, 4.2, 3, LINE.monorail) + stall(5, '#99691A', '#764F12', '#865D17') + stall(9, '#B4492A', '#8E3720', '#A2402A') +
    stall(13, '#2C6B66', '#1F4F4B', '#255D59') + tree(4, 14) +
    `<polyline points="${pts([iso(8, 6, 0), iso(8, 9.6, 0), iso(10.5, 9.6, 0)])}" fill="none" stroke="${NAVY}" stroke-width="2.6" stroke-dasharray=".1 6" stroke-linecap="round"/>` +
    pin(...iso(10.5, 11.2, 1.6))
}

function PromoMap({ kind, className = '' }: { kind: PromoMapKind; className?: string }) {
  // markup built from our own fixed drawing code, never user input
  const html = useMemo(() => `<rect width="400" height="200" fill="#F4EFE6"/>${scene(kind)}`, [kind])
  return <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export default PromoMap
