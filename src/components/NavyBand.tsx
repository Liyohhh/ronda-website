import type { ReactNode } from 'react'

// Full-width navy band on the home page. It ends in a soft wave into the light page. Behind the content: flowing contour
// lines, faint "metro map" curves in the real line colours, glows and a dot grid.

// contour lines: gentle S-curves stacked like a topographic map
const CONTOURS = Array.from({ length: 9 }, (_, i) => {
  const y = 90 + i * 34
  return `M-80 ${y} C 320 ${y - 120}, 640 ${y + 160}, 980 ${y + 20} S 1420 ${y - 90}, 1560 ${y - 10}`
})

// metro-map curves: [colour, path, stations along it as [x, y]]
const LINES: [string, string, [number, number][]][] = [
  ['#E57200', 'M-40 520 C 180 520, 260 420, 420 420 S 700 470, 820 360', [[170, 505], [420, 420], [640, 440]]],
  ['#FFCD00', 'M1480 160 C 1300 160, 1240 300, 1080 330 S 820 300, 700 420 S 560 700, 420 760', [[1240, 230], [1010, 330], [760, 380], [520, 660]]],
  ['#047940', 'M1500 620 C 1320 640, 1220 560, 1060 560 S 860 640, 740 760', [[1300, 620], [1060, 560], [860, 660]]],
  ['#D50032', 'M-60 140 C 120 180, 200 280, 360 300', [[120, 175], [300, 290]]],
]

// overlap: the band starts behind the lower part of the section above it (the slides card), like a card
// resting on the edge of the band
function NavyBand({ children, overlap = false }: { children: ReactNode; overlap?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-[#16223B] via-[#1C2B4A] to-[#24375C] text-white ${overlap ? '-mt-40 md:-mt-52' : ''}`}>
      {/* shapes, behind everything */}
      <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5">
          {CONTOURS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="none" strokeWidth="7" strokeLinecap="round" opacity="0.22">
          {LINES.map(([c, d]) => (
            <path key={d} d={d} stroke={c} />
          ))}
        </g>
        <g opacity="0.35">
          {LINES.flatMap(([c, , stops]) =>
            stops.map(([x, y]) => <circle key={`${c}${x}`} cx={x} cy={y} r="7" fill="#14203A" stroke={c} strokeWidth="4" />),
          )}
        </g>
      </svg>
      <div className="pointer-events-none absolute -top-40 -start-40 w-[520px] h-[520px] rounded-full bg-[#1747b8]/35 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute top-1/3 -end-32 w-[560px] h-[560px] rounded-full bg-[#C27C3A]/12 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-10 start-1/4 w-[520px] h-[520px] rounded-full bg-[#1747b8]/25 blur-3xl" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        aria-hidden="true"
      />

      <div className={`relative ${overlap ? 'pt-44 md:pt-56' : ''}`}>{children}</div>

      {/* soft wave into the light page below */}
      <svg className="relative block w-full h-14 md:h-20 text-gray-50" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 48 C 240 8, 480 8, 720 36 S 1200 80, 1440 28 V 80 H 0 Z" />
      </svg>
    </div>
  )
}

export default NavyBand
