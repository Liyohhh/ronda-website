import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { Accent, Eyebrow, Reveal } from './Motion'

// Home "Why RONDA?": Malaysia (Peninsula, Sarawak and Sabah) as a dot map. When the section scrolls into view the
// dots fill in from west to east and the cities with published public transport timetables light up. No transit lines on purpose: the
// drawing shows the country, not which services RONDA covers.
// A drawing, not a map (outline simplified from coastline points, about 0.2 degrees per dot). Numbers come from the
// database (14 networks, 6,533 stops, 18,664 OSM places, 17 trails on 15 Oct 2026), rounded down.

// lon/lat -> drawing coordinates (viewBox 1120 x 430)
// (a margin on the left; Borneo drawn closer to the Peninsula than the real sea gap, to fit the page)
const xy = (lon: number, lat: number): [number, number] => [(lon - 99.5) * 60 + 40 - (lon > 108 ? 150 : 0), (7.5 - lat) * 60]

// coastline and land borders, clockwise
const PENINSULA: [number, number][] = [
  [100.13, 6.7], [100.37, 6.6], [100.6, 6.5], [100.85, 6.3], [101.1, 5.95], [101.3, 5.7], [101.6, 5.85], [101.85, 5.8],
  [102.1, 6.22], [102.35, 6.05], [102.75, 5.8], [103.15, 5.3], [103.4, 4.75], [103.45, 4.25], [103.35, 3.8], [103.45, 3.3],
  [103.6, 2.85], [103.95, 2.35], [104.15, 1.75], [104.28, 1.38], [104.05, 1.43], [103.8, 1.45], [103.65, 1.4], [103.5, 1.27],
  [103.35, 1.4], [102.95, 1.8], [102.6, 1.95], [102.25, 2.2], [101.85, 2.45], [101.55, 2.75], [101.3, 3.05], [101.2, 3.55],
  [100.95, 3.95], [100.65, 4.3], [100.6, 4.75], [100.45, 5.1], [100.36, 5.45], [100.35, 5.75], [100.35, 6.1], [100.2, 6.45],
]
const BORNEO: [number, number][] = [
  [109.65, 2.08], [109.95, 1.8], [110.35, 1.75], [110.9, 1.65], [111.3, 2.15], [111.5, 2.6], [112.1, 2.95], [113.05, 3.2],
  [113.6, 3.75], [113.98, 4.4], [114.1, 4.6], [114.45, 4.15], [114.8, 4.3], [115.05, 4.8], [115.3, 4.45], [115.55, 5.0],
  [115.65, 5.5], [116.05, 5.98], [116.5, 6.6], [116.75, 7.0], [117.15, 6.95], [117.7, 6.4], [118.1, 5.85], [118.6, 5.5],
  [119.25, 5.1], [118.6, 4.5], [118.0, 4.4], [117.6, 4.17], [116.8, 4.33], [116.0, 4.3], [115.6, 4.2], [115.4, 3.6],
  [115.1, 2.5], [114.6, 1.45], [113.6, 1.2], [112.5, 1.5], [111.45, 1.05], [110.35, 0.95], [109.95, 1.4], [109.65, 1.9],
]

function inside(x: number, y: number, poly: [number, number][]) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

// the dot grid: every grid point that falls on land
const STEP = 12
const SHAPES = [PENINSULA, BORNEO].map((s) => s.map(([a, b]) => xy(a, b)))
const DOTS: { x: number; y: number }[] = []
for (let y = STEP; y < 430; y += STEP) {
  for (let x = STEP; x < 1120; x += STEP) {
    if (SHAPES.some((s) => inside(x, y, s))) DOTS.push({ x, y })
  }
}

// Cities with an official public transport timetable published as open data on data.gov.my (GTFS: Rapid KL, KTMB,
// Rapid Penang and the BAS.MY cities; checked 15 Oct 2026). Positions from OpenStreetMap (Nominatim, 15 Oct 2026).
// Each city takes the land dot nearest to it, so every dot keeps the same size.
const CITIES: { at: [number, number]; name: string; big?: boolean; left?: boolean }[] = [
  { at: [101.694, 3.152], name: 'Kuala Lumpur', big: true },
  { at: [100.328, 5.414], name: 'George Town', left: true },
  { at: [100.194, 6.439], name: 'Kangar', left: true },
  { at: [100.368, 6.123], name: 'Alor Setar', left: true },
  { at: [102.237, 6.125], name: 'Kota Bharu' },
  { at: [103.138, 5.33], name: 'Kuala Terengganu' },
  { at: [101.09, 4.599], name: 'Ipoh', left: true },
  { at: [101.94, 2.723], name: 'Seremban' },
  { at: [102.248, 2.194], name: 'Melaka', left: true },
  { at: [103.764, 1.458], name: 'Johor Bahru' },
  { at: [110.345, 1.56], name: 'Kuching' },
]
const taken = new Set<number>()
const CITY_DOTS = CITIES.map((c) => {
  const [cx, cy] = xy(...c.at)
  let best = -1
  DOTS.forEach((d, i) => {
    if (!taken.has(i) && (best < 0 || Math.hypot(d.x - cx, d.y - cy) < Math.hypot(DOTS[best].x - cx, DOTS[best].y - cy))) best = i
  })
  taken.add(best)
  return { ...c, x: DOTS[best].x, y: DOTS[best].y }
})

function WhyRonda() {
  const { t } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  // the animation starts once a quarter of the map is on screen (checked on scroll and resize, so it also works
  // where IntersectionObserver callbacks are late or missing)
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (play) return
    const check = () => {
      const r = ref.current?.querySelector('svg')?.getBoundingClientRect()
      if (r && r.top < window.innerHeight - r.height * 0.25 && r.bottom > r.height * 0.25) setPlay(true)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    const svg = ref.current?.querySelector('svg')
    const io = typeof IntersectionObserver !== 'undefined' && svg
      ? new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) setPlay(true) }, { threshold: 0.25 })
      : null
    if (io && svg) io.observe(svg)
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); io?.disconnect() }
  }, [play])

  return (
    <section ref={ref} aria-labelledby="why-title" className="wrap pt-24 md:pt-32">
      {/* gold label and serif heading on the left; below, the dot map on a cream card (the numbers are in the navy band above) */}
      <Reveal><Eyebrow>{t('why_tag')}</Eyebrow></Reveal>
      <h2 id="why-title" className="mt-5 max-w-3xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]">
        <Accent text={t('why_title')} />
      </h2>

      <div className="mt-12">
      <figure className="rounded-[32px] bg-[#E8E4E0] px-2 py-8 sm:px-10 flex flex-col justify-center">
        <svg viewBox="0 0 1120 430" role="img" aria-labelledby="why-svg-title" className={`why-map w-full h-auto${play ? ' is-playing' : ''}`}>
          <title id="why-svg-title">{t('why_svg')}</title>
          <defs>
            <linearGradient id="why-land" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="1080" y2="0">
              <stop offset="0" stopColor="#222D52" />
              <stop offset="0.5" stopColor="#3A4A7A" />
              <stop offset="1" stopColor="#5A6A9A" />
            </linearGradient>
          </defs>

          {/* land: one dot per grid point, filling in from west to east */}
          <g fill="url(#why-land)">
            {DOTS.map((d) => (
              <circle key={`${d.x}-${d.y}`} className="why-dot" cx={d.x} cy={d.y} r="4.2"
                style={{ animationDelay: `${(d.x / 1120) * 1.4 + (d.y / 430) * 0.25}s` }} />
            ))}
          </g>

          {/* cities */}
          {CITY_DOTS.map((c, i) => {
            const { x, y } = c
            const r = 4.2
            return (
              <g key={c.name} className="why-city" style={{ animationDelay: `${1.3 + i * 0.12}s` }}>
                <circle className="why-pulse" cx={x} cy={y} r={r} fill="none" stroke="#D2B68A" strokeWidth="1.5" style={{ animationDelay: `${2 + i * 0.35}s` }} />
                <circle cx={x} cy={y} r={r} fill="#D2B68A" />
                <text className={c.big ? 'why-label-big' : 'why-label-small'} x={x + (c.left ? -(r + 6) : r + 6)} y={y} textAnchor={c.left ? 'end' : 'start'} dominantBaseline="central"
                  fontSize={c.big ? 16 : 13} fontWeight={c.big ? 700 : 600} fill="#222D52" paintOrder="stroke" stroke="#F6F3ED" strokeWidth="4" strokeLinejoin="round">
                  {c.name}
                </text>
              </g>
            )
          })}

          {/* country name */}
          <text className="why-name" x="953" y="360" textAnchor="middle" fontSize="20" fontWeight="600" letterSpacing="3" fill="#374151">
            {t('why_country').toUpperCase()}
          </text>
        </svg>
        <p className="mt-1 flex items-center justify-center gap-2 text-xs text-gray-500">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[#D2B68A]" />
          {t('why_legend')}
        </p>
      </figure>
      </div>
    </section>
  )
}

export default WhyRonda
