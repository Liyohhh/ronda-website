import LineBadge from './LineBadge'
import { busLine } from '../data/lines'

// A bus route number as riders read it on the bus: white on a teal chip ("T352"), optionally after a bus icon
const ROUTE_CHIP_COLOR = '#127A78'

type Props = { code: string; icon?: boolean; size?: 'sm' | 'md'; className?: string }

function RouteChip({ code, icon = false, size = 'md', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 flex-shrink-0 ${className}`}>
      {icon && <LineBadge line={busLine(null, code)} size={size === 'sm' ? 16 : 20} decorative />}
      <span
        className={`rounded-md font-semibold text-white tabular-nums leading-tight ${size === 'sm' ? 'px-1.5 py-px text-xs' : 'px-2 py-0.5 text-sm'}`}
        style={{ backgroundColor: ROUTE_CHIP_COLOR }}
      >
        {code}
      </span>
    </span>
  )
}

export default RouteChip
