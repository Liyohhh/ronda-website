import type { ReactNode } from 'react'
import LineBadge from './LineBadge'
import { busLine } from '../data/lines'

// A bus stop written the way it reads at the pole: bus logo, the stop code ("KL1483"), then the name.
// No code (rail, or the operator gives none): just the name. `logo` off where a bus badge is already next to it.
type Props = { code?: string | null; name: ReactNode; logo?: boolean; logoSize?: number; className?: string }

function BusStopName({ code, name, logo = false, logoSize = 18, className = '' }: Props) {
  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-1.5 ${className}`}>
      {logo && <LineBadge line={busLine(null, 'Bus stop')} size={logoSize} decorative className="flex-shrink-0" />}
      {code && (
        <span className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-px text-[0.8em] font-bold leading-snug tracking-wide text-gray-700 tabular-nums">
          {code}
        </span>
      )}
      <span className="min-w-0 truncate">{name}</span>
    </span>
  )
}

export default BusStopName
