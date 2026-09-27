import type { ReactNode } from 'react'
import type { StopIconKind } from '../data/stopIcon'

const PATHS: Record<StopIconKind, ReactNode> = {
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M9 21l-2-4M15 21l2-4" />
      <circle cx="9" cy="13.5" r="0.8" fill="currentColor" />
      <circle cx="15" cy="13.5" r="0.8" fill="currentColor" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="3" width="16" height="15" rx="2.5" />
      <path d="M4 11h16M8 18v2M16 18v2" />
      <circle cx="8" cy="14.5" r="0.8" fill="currentColor" />
      <circle cx="16" cy="14.5" r="0.8" fill="currentColor" />
    </>
  ),
  airport: <path d="M10.5 20l1.5-6-6 2.5v-2l6-4V5a1.5 1.5 0 0 1 3 0v5.5l6 4v2l-6-2.5 1.5 6-3-1z" />,
  hospital: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  school: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v5" />
    </>
  ),
  mall: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  mosque: (
    <>
      <path d="M6 12a6 6 0 0 1 12 0" />
      <path d="M4 20V12h16v8M10 20v-4a2 2 0 0 1 4 0v4M12 3v3" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10M10 20v-5h4v5" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
}

// Rail stations use solid RONDA blue; everything else uses the light tint
function StopIcon({ kind }: { kind: StopIconKind }) {
  const solid = kind === 'train'
  return (
    <span
      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        solid ? 'bg-[#002472] text-white' : 'bg-[#002472]/10 text-[#002472]'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[kind]}
      </svg>
    </span>
  )
}

export default StopIcon
