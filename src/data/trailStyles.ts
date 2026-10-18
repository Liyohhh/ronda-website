import type { TrailCategory } from './trails'
import type { IconName } from './icons'

// Per category: a blue (each category its own shade, all with white text at 4.5:1 or more: category pills on
// trail cards, the top edge of the home category cards) and the placeholder cover when a trail or stop has no photo:
// a gradient anchored on RONDA navy plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: IconName }> = {
  food: {
    from: '#14213D',
    to: '#14213D',
    icon: 'restaurant',
  },
  culture: {
    from: '#14213D',
    to: '#1E3A8A',
    icon: 'accountBalanceOutline',
  },
  shopping: {
    from: '#14213D',
    to: '#0369A1',
    icon: 'shoppingBagOutline',
  },
  nature: {
    from: '#14213D',
    to: '#0E7490',
    icon: 'parkOutline',
  },
  'halal-fine-dining': {
    from: '#14213D',
    to: '#334155',
    icon: 'restaurant',
  },
  family: {
    from: '#14213D',
    to: '#0369A1',
    icon: 'favorite',
  },
  events: {
    from: '#14213D',
    to: '#3B5BDB',
    icon: 'event',
  },
  activities: {
    from: '#14213D',
    to: '#2563EB',
    icon: 'hiking',
  },
  explore: {
    from: '#14213D',
    to: '#4338CA',
    icon: 'locationOnOutline',
  },
}
