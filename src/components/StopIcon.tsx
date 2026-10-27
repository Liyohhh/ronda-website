import Icon from './Icon'
import type { IconName } from './Icon'
import type { StopIconKind } from '../data/stopIcon'

const NAMES: Record<StopIconKind, IconName> = {
  train: 'trainOutline',
  bus: 'bus', // MyRapid's bus icon
  airport: 'flight',
  hospital: 'localHospitalOutline',
  school: 'schoolOutline',
  mall: 'shoppingBagOutline',
  mosque: 'mosqueOutline',
  home: 'homeOutline',
  building: 'apartment',
  place: 'locationOnOutline',
}

// Rail stations use solid RONDA blue; everything else uses the light tint
// compact: the smaller size used in the live map's search list
function StopIcon({ kind, compact = false }: { kind: StopIconKind; compact?: boolean }) {
  const solid = kind === 'train'
  return (
    <span
      className={`${compact ? 'w-6 h-6 rounded-md' : 'w-9 h-9 rounded-lg'} flex items-center justify-center flex-shrink-0 ${
        solid ? 'bg-[#222D52] text-white' : 'bg-[#222D52]/10 text-[#222D52]'
      }`}
    >
      <Icon name={NAMES[kind]} size={compact ? 14 : 18} />
    </span>
  )
}

export default StopIcon
