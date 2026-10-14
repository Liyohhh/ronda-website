import { useLanguage } from '../hooks/useLanguage'

// Home "Why RONDA?": a bold, blocky Malaysia (Peninsula, Sarawak and Sabah) with the west-coast rail line and a
// train running on it, pins for places worth the trip, and a magnifying glass over Kuala Lumpur showing its rail
// lines. A drawing, not a map (outline simplified from coastline points). Numbers come from the database
// (14 networks, 6,533 stops, 18,664 OSM places, 17 trails on 15 Oct 2026), rounded down.

// lon/lat -> drawing coordinates (viewBox 1120 x 430)
// (a margin on the left; Borneo drawn closer to the Peninsula than the real sea gap, to fit the page)
const P = (lon: number, lat: number) => `${Math.round((lon - 99.5) * 60 + 40 - (lon > 108 ? 150 : 0))},${Math.round((7.5 - lat) * 60)}`
const poly = (pts: [number, number][]) => pts.map(([a, b]) => P(a, b)).join(' ')

const PENINSULA: [number, number][] = [
  [100.13, 6.7], [101.1, 6.25], [102.3, 6.2], [103.4, 5.1], [103.45, 3.8], [103.85, 2.4], [104.25, 1.4], [103.75, 1.45],
  [103.5, 1.27], [102.25, 2.2], [101.3, 3.0], [100.6, 4.2], [100.35, 5.4], [100.3, 6.0],
]
const BORNEO: [number, number][] = [
  [109.65, 2.08], [110.35, 1.55], [111.45, 1.25], [112.5, 1.5], [113.6, 1.2], [114.6, 1.45], [115.1, 2.5], [115.4, 3.6],
  [115.6, 4.2], [116.0, 4.3], [117.6, 4.17], [118.6, 4.5], [118.3, 5.0], [118.1, 5.85], [116.85, 6.95], [116.07, 5.98],
  [115.2, 5.2], [114.6, 4.6], [113.98, 4.4], [113.05, 3.2], [112.1, 2.9], [111.3, 2.3],
]
// west-coast rail: Padang Besar - Butterworth - Ipoh - KL - Seremban - Gemas - JB Sentral
const RAIL: [number, number][] = [[100.2, 6.62], [100.37, 5.4], [101.08, 4.6], [101.69, 3.14], [101.94, 2.72], [102.6, 2.6], [103.76, 1.46]]
const railPath = 'M' + RAIL.map(([a, b]) => P(a, b)).join(' L')
const KL = P(101.69, 3.14).split(',').map(Number)
// riders who asked for less motion get a train that stands at KL
const STILL = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const PINS: { at: [number, number]; emoji: string; label: string }[] = [
  { at: [100.33, 5.41], emoji: '🍜', label: 'Penang' },
  { at: [102.25, 2.19], emoji: '🏛️', label: 'Melaka' },
  { at: [110.35, 1.55], emoji: '🐱', label: 'Kuching' },
  { at: [116.55, 6.08], emoji: '⛰️', label: 'Kinabalu' },
]

function WhyRonda() {
  const { t } = useLanguage()
  const stats: [string, string][] = [['14', t('why_lines')], ['6,500+', t('why_stops')], ['18,000+', t('why_places')], ['17', t('why_trails')]]
  const [kx, ky] = KL
  const lens = { x: kx + 175, y: ky - 70, r: 92 }
  return (
    <section aria-labelledby="why-title" className="max-w-6xl mx-auto px-4 sm:px-6 pt-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">{t('why_tag')}</p>
        <h2 id="why-title" className="mt-2 text-3xl md:text-4xl font-bold text-[#1F2F5C] max-w-3xl mx-auto">{t('why_title')}</h2>
      </div>

      <figure className="mt-8">
        <svg viewBox="0 0 1120 430" role="img" aria-labelledby="why-svg-title" className="w-full h-auto">
          <title id="why-svg-title">{t('why_svg')}</title>
          <defs>
            <clipPath id="why-lens"><circle cx={lens.x} cy={lens.y} r={lens.r - 6} /></clipPath>
            <path id="why-rail" d={railPath} />
          </defs>
          {/* offset shadow outline, then the land */}
          {[PENINSULA, BORNEO].map((shape, i) => (
            <g key={i}>
              <polygon points={poly(shape)} transform="translate(14 16)" fill="none" stroke="#1F2F5C" strokeWidth="14" strokeLinejoin="miter" />
              <polygon points={poly(shape)} fill={i ? '#2563EB' : '#1D4ED8'} stroke="#1F2F5C" strokeWidth="14" strokeLinejoin="miter" />
            </g>
          ))}
          {/* rail line with sleepers and a train on it */}
          <path d={railPath} fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={railPath} fill="none" stroke="#1F2F5C" strokeWidth="7" strokeDasharray="2 9" />
          <g transform={STILL ? `translate(${KL[0]} ${KL[1] - 22})` : undefined}>
            <rect x="-15" y="-8" width="30" height="16" rx="5" fill="#FACC15" stroke="#1F2F5C" strokeWidth="3" />
            <rect x="-9" y="-4" width="7" height="6" rx="1.5" fill="#1F2F5C" />
            <rect x="2" y="-4" width="7" height="6" rx="1.5" fill="#1F2F5C" />
            {!STILL && <animateMotion dur="9s" repeatCount="indefinite" rotate="auto"><mpath href="#why-rail" /></animateMotion>}
          </g>
          {/* pins */}
          {PINS.map((p) => {
            const [x, y] = P(...p.at).split(',').map(Number)
            return (
              <g key={p.label} transform={`translate(${x} ${y})`}>
                <circle r="21" fill="#FFFFFF" stroke="#1F2F5C" strokeWidth="3" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="20">{p.emoji}</text>
              </g>
            )
          })}
          {/* magnifying glass over Kuala Lumpur: the city's rail lines inside */}
          <line x1={kx} y1={ky} x2={lens.x - lens.r * 0.7} y2={lens.y + lens.r * 0.7} stroke="#1F2F5C" strokeWidth="3" strokeDasharray="4 5" />
          <circle cx={kx} cy={ky} r="9" fill="#FFFFFF" stroke="#1F2F5C" strokeWidth="4" />
          <g clipPath="url(#why-lens)">
            <rect x={lens.x - lens.r} y={lens.y - lens.r} width={lens.r * 2} height={lens.r * 2} fill="#F4F6FB" />
            {[
              { c: '#047940', d: `M${lens.x - 90} ${lens.y + 30} C ${lens.x - 30} ${lens.y + 10}, ${lens.x + 20} ${lens.y - 10}, ${lens.x + 90} ${lens.y - 40}` },
              { c: '#D50032', d: `M${lens.x - 40} ${lens.y - 90} C ${lens.x - 20} ${lens.y - 20}, ${lens.x + 10} ${lens.y + 30}, ${lens.x + 30} ${lens.y + 90}` },
              { c: '#E57200', d: `M${lens.x - 90} ${lens.y - 30} L ${lens.x + 10} ${lens.y + 5} L ${lens.x + 90} ${lens.y + 45}` },
              { c: '#84BD00', d: `M${lens.x + 5} ${lens.y - 90} L ${lens.x + 25} ${lens.y - 10} L ${lens.x + 60} ${lens.y + 90}` },
              { c: '#FFCD00', d: `M${lens.x - 90} ${lens.y + 70} L ${lens.x - 10} ${lens.y + 40} L ${lens.x + 90} ${lens.y + 10}` },
            ].map((l) => <path key={l.c} d={l.d} fill="none" stroke={l.c} strokeWidth="7" strokeLinecap="round" />)}
            {[[-13, 13], [12, -2], [24, -12], [-40, 6]].map(([dx, dy], i) => (
              <circle key={i} cx={lens.x + dx} cy={lens.y + dy} r="6" fill="#FFFFFF" stroke="#1F2F5C" strokeWidth="3" />
            ))}
          </g>
          <circle cx={lens.x} cy={lens.y} r={lens.r - 3} fill="none" stroke="#1F2F5C" strokeWidth="10" />
          <line x1={lens.x + lens.r * 0.68} y1={lens.y + lens.r * 0.68} x2={lens.x + lens.r * 1.15} y2={lens.y + lens.r * 1.15} stroke="#1F2F5C" strokeWidth="18" strokeLinecap="round" />
          <text x={lens.x} y={lens.y - lens.r - 14} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1F2F5C">Kuala Lumpur</text>
        </svg>
        <figcaption className="mt-6 text-center text-lg italic text-gray-600 max-w-3xl mx-auto">{t('why_caption')}</figcaption>
      </figure>

      <ul className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(([n, label]) => (
          <li key={label} className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <span className="block text-2xl md:text-3xl font-bold text-[#1F2F5C]">{n}</span>
            <span className="mt-1 block text-sm text-gray-600">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default WhyRonda
