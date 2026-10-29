// Flat drawings for the home page promotion cards (decorative; the card's words say it all). Drawn on a coloured
// card, so the shapes are mostly white with RONDA's colours for the details.
// station: a station with shops around it and its 300 m ring; hotel: a hotel, a suitcase and a passing train;
// offer: a market stall with a price tag.

export type PromoArtKind = 'station' | 'hotel' | 'offer'

const SPARK = 'l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z'

function Station() {
  return (
    <>
      <ellipse cx="130" cy="140" rx="118" ry="26" fill="#fff" opacity=".22" />
      <ellipse cx="130" cy="122" rx="96" ry="40" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="6 7" opacity=".9" />
      <rect x="92" y="62" width="76" height="58" rx="8" fill="#fff" /><rect x="92" y="62" width="76" height="14" rx="7" fill="#8AB4F8" />
      <rect x="104" y="84" width="22" height="36" rx="3" fill="#222D52" /><rect x="134" y="86" width="22" height="16" rx="3" fill="#C9D6EA" />
      <path d="M112 54 h36 l10 8 h-56z" fill="#D50032" />
      <rect x="24" y="92" width="44" height="40" rx="6" fill="#fff" /><path d="M20 92 h52 l-4 -12 h-44z" fill="#2C6B66" /><rect x="34" y="104" width="24" height="28" rx="3" fill="#F3B13E" />
      <rect x="194" y="86" width="44" height="46" rx="6" fill="#fff" /><path d="M190 86 h52 l-4 -12 h-44z" fill="#B4492A" /><rect x="204" y="98" width="24" height="12" rx="3" fill="#C9D6EA" />
      <g transform="translate(118 8)"><path d="M12 0 C5 0 0 5 0 12 c0 9 12 22 12 22 s12-13 12-22 C24 5 19 0 12 0z" fill="#8AB4F8" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="12" r="5" fill="#222D52" /></g>
      <circle cx="44" cy="40" r="3" fill="#fff" /><circle cx="214" cy="36" r="2.5" fill="#fff" /><path d={`M232 54 ${SPARK}`} fill="#fff" />
    </>
  )
}

function Hotel() {
  return (
    <>
      <ellipse cx="130" cy="146" rx="118" ry="20" fill="#fff" opacity=".3" />
      <rect x="96" y="22" width="70" height="120" rx="8" fill="#fff" />
      {[36, 56, 76].map((y, r) => [108, 128, 148].map((x, c) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={c === 2 ? 10 : 14} height="12" rx="2" fill={(r + c) % 3 === 2 ? '#F3B13E' : '#C9D6EA'} />
      )))}
      <rect x="120" y="110" width="22" height="32" rx="3" fill="#222D52" /><rect x="108" y="14" width="46" height="12" rx="4" fill="#8AB4F8" />
      <g transform="translate(176 92)"><rect x="0" y="10" width="46" height="44" rx="8" fill="#B4492A" /><rect x="14" y="0" width="18" height="12" rx="4" fill="none" stroke="#7A2E1A" strokeWidth="4" /><rect x="0" y="26" width="46" height="5" fill="#7A2E1A" /><circle cx="10" cy="56" r="4" fill="#222D52" /><circle cx="36" cy="56" r="4" fill="#222D52" /></g>
      <g transform="translate(6 116)"><rect width="82" height="22" rx="8" fill="#fff" /><rect width="26" height="22" rx="8" fill="#047940" /><rect x="34" y="6" width="12" height="8" rx="2" fill="#C9D6EA" /><rect x="52" y="6" width="12" height="8" rx="2" fill="#C9D6EA" /></g>
      <path d={`M40 40 ${SPARK}`} fill="#fff" /><circle cx="214" cy="40" r="3" fill="#fff" />
    </>
  )
}

function Offer() {
  return (
    <>
      <ellipse cx="130" cy="146" rx="118" ry="20" fill="#fff" opacity=".22" />
      <rect x="60" y="78" width="120" height="62" rx="8" fill="#fff" />
      <path d="M52 78 h136 l-10 -30 h-116z" fill="#fff" />
      <path d="M62 48 h19.3 l-4 30 h-21.3z" fill="#D50032" /><path d="M100.6 48 h19.3 l-1 30 h-21.3z" fill="#D50032" /><path d="M139.3 48 h19.3 l2 30 h-21.3z" fill="#D50032" />
      <rect x="74" y="96" width="30" height="20" rx="4" fill="#F3B13E" /><rect x="110" y="96" width="30" height="20" rx="4" fill="#5E8C3A" /><rect x="146" y="96" width="22" height="20" rx="4" fill="#C0392B" />
      <g transform="translate(176 20) rotate(14)"><path d="M0 0 h50 l14 18 -14 18 h-50z" fill="#222D52" /><circle cx="52" cy="18" r="4" fill="#8AB4F8" /><text x="8" y="24" fontFamily="Nunito Sans, sans-serif" fontWeight="900" fontSize="15" fill="#fff">%</text></g>
      <circle cx="40" cy="44" r="3" fill="#fff" /><path d={`M28 112 ${SPARK}`} fill="#fff" />
    </>
  )
}

function PromoArt({ kind, className = '' }: { kind: PromoArtKind; className?: string }) {
  return (
    <svg viewBox="0 0 260 170" aria-hidden="true" className={className}>
      {kind === 'station' ? <Station /> : kind === 'hotel' ? <Hotel /> : <Offer />}
    </svg>
  )
}

export default PromoArt
