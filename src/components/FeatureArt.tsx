import { LINES_BY_ID } from '../data/lines'
import Icon from './Icon'

// Clean drawings for the feature cards, one per feature (RONDA 300 uses the site's icons), in the site's palette: navy and champagne on the cream
// block, champagne and white on the navy block. Lines keep their official colours.
export type ArtKind = 'directions' | 'lines' | 'ronda300' | 'trails'

const KJ = LINES_BY_ID['lrt-kelana-jaya'].color
const MRT = LINES_BY_ID['mrt-kajang'].color
const KTM = LINES_BY_ID['ktm-port-klang'].color

function FeatureArt({ kind, dark = false }: { kind: ArtKind; dark?: boolean }) {
  const ink = dark ? '#E2CBA4' : '#222D52'
  const bg = dark ? '#222D52' : '#EEE5D9'
  const gold = dark ? '#FFFFFF' : '#D2B68A'
  // RONDA 300 reads best with real icons: the station in the middle, places around it, the 300 m walk on the ring
  if (kind === 'ronda300') {
    const chip = 'absolute flex h-[17%] w-[17%] items-center justify-center rounded-full bg-white shadow-[0_8px_20px_-8px_rgb(34_45_82/0.35)]'
    return (
      <div aria-hidden="true" className="relative h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
        <div className={`absolute inset-[12%] rounded-full border-[2.5px] border-dashed ${dark ? 'border-gold-light/60 bg-white/5' : 'border-[#222D52]/35 bg-[#222D52]/[0.05]'}`} />
        <div className={`absolute left-1/2 top-1/2 flex h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${dark ? 'bg-gold text-[#222D52]' : 'bg-[#222D52] text-white'}`}>
          <Icon name="train" size={34} />
        </div>
        <span className={`${chip} start-[10%] top-[22%] text-[#E8590C]`}><Icon name="restaurant" size={22} /></span>
        <span className={`${chip} end-[8%] top-[34%] text-[#C2255C]`}><Icon name="shoppingBagOutline" size={22} /></span>
        <span className={`${chip} start-[20%] bottom-[10%] text-[#2B8A3E]`}><Icon name="parkOutline" size={22} /></span>
        <span className="absolute bottom-[6%] end-[14%] inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-sm font-bold text-[#222D52] shadow-[0_8px_20px_-8px_rgb(34_45_82/0.35)]">
          <Icon name="directionsWalk" size={16} />
          <span dir="ltr">300 m</span>
        </span>
      </div>
    )
  }
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" aria-hidden="true" focusable="false">
      {kind === 'directions' && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* a short walk, then the train, to the pin */}
          <path d="M62 176 V140" stroke={ink} strokeWidth="7" strokeDasharray="0 14" />
          <path d="M62 126 Q62 108 80 108 H162 Q180 108 180 90 V86" stroke={ink} strokeWidth="9" />
          <circle cx="62" cy="186" r="13" stroke={ink} strokeWidth="7" fill={bg} />
          <circle cx="121" cy="108" r="9" fill={bg} stroke={ink} strokeWidth="5" />
          <path d="M180 26 a28 28 0 0 1 28 28 c0 22 -28 50 -28 50 s-28 -28 -28 -50 a28 28 0 0 1 28 -28z" fill={gold} stroke="none" />
          <circle cx="180" cy="54" r="10" fill={bg} />
        </g>
      )}
      {kind === 'lines' && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="11">
          {/* three lines side by side, stations on each */}
          <path d="M28 72 H96 L150 126 H212" stroke={KJ} />
          <path d="M28 94 H87 L141 148 H212" stroke={MRT} />
          <path d="M28 116 H78 L132 170 H212" stroke={KTM} />
          {[[52, 72], [178, 126], [52, 94], [178, 148], [52, 116], [178, 170]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="none" />
          ))}
        </g>
      )}
      {kind === 'trails' && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* a winding day out with stops, ending at a flag */}
          <path d="M46 196 C 46 150, 120 170, 120 124 S 186 104, 186 66" stroke={ink} strokeWidth="7" strokeDasharray="0 15" />
          {[[46, 196], [120, 124]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="11" fill={bg} stroke={gold} strokeWidth="6" />
          ))}
          <path d="M186 70 V24" stroke={ink} strokeWidth="5" />
          <path d="M188 26 L222 38 L188 50 Z" fill={gold} stroke="none" />
        </g>
      )}
    </svg>
  )
}

export default FeatureArt
