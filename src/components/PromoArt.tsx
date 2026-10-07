import type { PromoArt as Art } from '../data/promotions'

// Flat ad-style drawings for the promotion banners (decorative: hidden from screen readers)
const common = { 'aria-hidden': true, focusable: false } as const

export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg {...common} viewBox="0 0 24 24" className={className}>
      <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="currentColor" />
    </svg>
  )
}

export function TrainArt({ className = '' }: { className?: string }) {
  return (
    <svg {...common} viewBox="0 0 160 110" className={className}>
      <path d="M8 96 C50 80 110 80 152 96" stroke="#ffffff" strokeOpacity=".5" strokeWidth="3" strokeDasharray="6 6" fill="none" />
      <rect x="30" y="14" width="100" height="70" rx="18" fill="#ffffff" />
      <rect x="30" y="58" width="100" height="10" fill="#E3242B" />
      <rect x="42" y="24" width="34" height="24" rx="5" fill="#9CC8FF" />
      <rect x="84" y="24" width="34" height="24" rx="5" fill="#9CC8FF" />
      <circle cx="50" cy="76" r="4" fill="#FFC72C" />
      <circle cx="110" cy="76" r="4" fill="#FFC72C" />
      <rect x="44" y="84" width="14" height="8" rx="2" fill="#18243F" />
      <rect x="102" y="84" width="14" height="8" rx="2" fill="#18243F" />
    </svg>
  )
}

export function PinArt({ className = '' }: { className?: string }) {
  return (
    <svg {...common} viewBox="0 0 48 64" className={className}>
      <path d="M24 62C24 62 4 38 4 24a20 20 0 0 1 40 0c0 14-20 38-20 38z" fill="#E3242B" />
      <circle cx="24" cy="24" r="8" fill="#ffffff" />
    </svg>
  )
}

export function PercentTicket({ className = '' }: { className?: string }) {
  return (
    <svg {...common} viewBox="0 0 60 40" className={className}>
      <path d="M4 4h52v10a6 6 0 0 0 0 12v10H4V26a6 6 0 0 0 0-12z" fill="#ffffff" />
      <text x="30" y="27" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1E6FE8">%</text>
    </svg>
  )
}

function Cafe() {
  return (
    <svg {...common} viewBox="0 0 140 120" className="h-full w-full">
      <path d="M48 20c-6 8 6 12 0 20M64 16c-6 8 6 12 0 20M80 20c-6 8 6 12 0 20" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".8" />
      <path d="M30 48h68l-8 52a10 10 0 0 1-10 8H48a10 10 0 0 1-10-8z" fill="#ffffff" />
      <path d="M98 58h8a12 12 0 0 1 0 24h-11" stroke="#ffffff" strokeWidth="7" fill="none" />
      <rect x="34" y="62" width="60" height="12" fill="#8B4A1F" />
      <ellipse cx="64" cy="112" rx="50" ry="6" fill="#000000" opacity=".12" />
      <g transform="translate(104 6)"><path d="M14 40S0 24 0 14a14 14 0 0 1 28 0c0 10-14 26-14 26z" fill="#E3242B" /><circle cx="14" cy="14" r="5" fill="#ffffff" /></g>
    </svg>
  )
}

function Hotel() {
  return (
    <svg {...common} viewBox="0 0 140 120" className="h-full w-full">
      <rect x="22" y="22" width="64" height="88" rx="6" fill="#ffffff" />
      {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={32 + c * 18} y={32 + r * 16} width="10" height="9" rx="2" fill="#7FD8D0" />
      )))}
      <rect x="46" y="94" width="16" height="16" rx="2" fill="#0F766E" />
      <rect x="90" y="62" width="40" height="48" rx="6" fill="#ffffff" opacity=".9" />
      <path d="M96 94h28v8H96zM96 84h10v10H96z" fill="#0F766E" />
      <g fill="#FFC72C"><path d="M40 8l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" /><path d="M64 4l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" /></g>
    </svg>
  )
}

function Trail() {
  return (
    <svg {...common} viewBox="0 0 140 120" className="h-full w-full">
      <path d="M10 26l36-12 40 12 44-12v82l-44 12-40-12-36 12z" fill="#ffffff" />
      <path d="M46 14v82M86 26v82" stroke="#F3C7BE" strokeWidth="2" />
      <path d="M24 88C40 70 50 80 66 60s34-6 50-30" stroke="#E3242B" strokeWidth="4" strokeDasharray="7 6" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="88" r="7" fill="#18243F" />
      <g transform="translate(104 4)"><path d="M12 34S0 20 0 12a12 12 0 0 1 24 0c0 8-12 22-12 22z" fill="#E3242B" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></g>
    </svg>
  )
}

function Tickets() {
  return <TrainArt className="h-full w-full" />
}

export default function PromoArtwork({ art }: { art: Art }) {
  if (art === 'cafe') return <Cafe />
  if (art === 'hotel') return <Hotel />
  if (art === 'trail') return <Trail />
  return <Tickets />
}
