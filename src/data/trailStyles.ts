import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Per category: a blue (each category its own shade, all with white text at 4.5:1 or more: category pills on
// trail cards, the top edge of the home category cards) and the placeholder cover when a trail or stop has no photo:
// a gradient anchored on RONDA navy plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#1F2F5C',
    to: '#1D4ED8',
    icon: 'restaurant',
  },
  culture: {
    from: '#18243F',
    to: '#1E3A8A',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#1F2F5C',
    to: '#0369A1',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#18243F',
    to: '#0E7490',
    icon: 'parkOutline',
  },
  'halal-fine-dining': {
    from: '#18243F',
    to: '#334155',
    icon: 'restaurant',
  },
  family: {
    from: '#18243F',
    to: '#0284C7',
    icon: 'favorite',
  },
  events: {
    from: '#18243F',
    to: '#3B5BDB',
    icon: 'event',
  },
  explore: {
    from: '#18243F',
    to: '#4338CA',
    icon: 'locationOnOutline',
  },
}
