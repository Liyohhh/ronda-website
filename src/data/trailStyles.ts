import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Placeholder cover per category until real photos exist: a gradient anchored on RONDA navy,
// tinted per category, plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#0F4D3A',
    to: '#C2410C',
    icon: 'restaurant',
  },
  culture: {
    from: '#0B3A2C',
    to: '#1D4ED8',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#0F4D3A',
    to: '#BE185D',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#0B3A2C',
    to: '#15803D',
    icon: 'parkOutline',
  },
  'halal-fine-dining': {
    from: '#0B3A2C',
    to: '#8A5A0F',
    icon: 'restaurant',
  },
  explore: {
    from: '#0B3A2C',
    to: '#A16207',
    icon: 'locationOnOutline',
  },
}
