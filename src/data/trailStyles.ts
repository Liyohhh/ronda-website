import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Placeholder cover per category until real photos exist: a gradient anchored on RONDA navy,
// tinted per category, plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#1F2F5C',
    to: '#C2410C',
    icon: 'restaurant',
  },
  culture: {
    from: '#18243F',
    to: '#1D4ED8',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#1F2F5C',
    to: '#BE185D',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#18243F',
    to: '#15803D',
    icon: 'parkOutline',
  },
  'halal-fine-dining': {
    from: '#18243F',
    to: '#8A5A3B',
    icon: 'restaurant',
  },
  explore: {
    from: '#18243F',
    to: '#A16207',
    icon: 'locationOnOutline',
  },
}
