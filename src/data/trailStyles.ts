import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Placeholder cover per category until real photos exist: a gradient anchored on RONDA navy,
// tinted per category, plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#1C2B4A',
    to: '#C2410C',
    icon: 'restaurant',
  },
  culture: {
    from: '#16223B',
    to: '#1D4ED8',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#1C2B4A',
    to: '#BE185D',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#16223B',
    to: '#15803D',
    icon: 'parkOutline',
  },
  'halal-fine-dining': {
    from: '#16223B',
    to: '#8E5320',
    icon: 'restaurant',
  },
  explore: {
    from: '#16223B',
    to: '#A16207',
    icon: 'locationOnOutline',
  },
}
