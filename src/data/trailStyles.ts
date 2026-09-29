import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Placeholder cover per category until real photos exist: a gradient anchored on RONDA navy,
// tinted per category, plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#002472',
    to: '#C2410C',
    icon: 'restaurant',
  },
  culture: {
    from: '#001233',
    to: '#1D4ED8',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#002472',
    to: '#BE185D',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#001233',
    to: '#15803D',
    icon: 'parkOutline',
  },
  explore: {
    from: '#001233',
    to: '#A16207',
    icon: 'locationOnOutline',
  },
}
