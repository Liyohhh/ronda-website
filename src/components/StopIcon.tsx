import Icon from './Icon'
import type { IconName } from '../data/icons'
import type { StopIconKind } from '../data/stopIcon'

const NAMES: Record<StopIconKind, IconName> = {
  train: 'trainOutline',
  bus: 'directionsBusOutline',
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
function StopIcon({ kind }: { kind: StopIconKind }) {
  const solid = kind === 'train'
  return (
    <span
      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        solid ? 'bg-[#1C2B4A] text-white' : 'bg-[#1C2B4A]/10 text-[#1C2B4A]'
      }`}
    >
      <Icon name={NAMES[kind]} size={18} />
    </span>
  )
}

export default StopIcon
