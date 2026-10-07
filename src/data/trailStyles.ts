import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Placeholder cover per category until real photos exist: a gradient anchored on RONDA navy,
// tinted per category, plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#5B1A3A',
    to: '#C2410C',
    icon: 'restaurant',
  },
  culture: {
    from: '#3E1027',
    to: '#1D4ED8',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#5B1A3A',
    to: '#BE185D',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#3E1027',
    to: '#15803D',
    icon: 'parkOutline',
  },
  'halal-fine-dining': {
    from: '#3E1027',
    to: '#7A5A12',
    icon: 'restaurant',
  },
  explore: {
    from: '#3E1027',
    to: '#A16207',
    icon: 'locationOnOutline',
  },
}
