import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Placeholder cover per category until real photos exist: a gradient anchored on RONDA navy,
// tinted per category, plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#0E5C63',
    to: '#C2410C',
    icon: 'restaurant',
  },
  culture: {
    from: '#08333A',
    to: '#1D4ED8',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#0E5C63',
    to: '#BE185D',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#08333A',
    to: '#15803D',
    icon: 'parkOutline',
  },
  'halal-fine-dining': {
    from: '#08333A',
    to: '#B23A22',
    icon: 'restaurant',
  },
  explore: {
    from: '#08333A',
    to: '#A16207',
    icon: 'locationOnOutline',
  },
}
