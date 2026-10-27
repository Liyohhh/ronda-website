import type { TranslationKey } from '../i18n/translations'
import type { IconName } from './icons'
import { RONDA300_MAP } from './ronda300Link'

// Feature tiles: each one is a whole-card link (or, for languages, a button that opens the language menu).
// Each feature has its own colour so the tiles stand out; every colour is at least 4.5:1 against the white icon
// square (measured in FeatureGrid.test.tsx). Icons: the site's icon set (src/data/icons.ts).
export const OPEN_LANGUAGE_MENU = 'ronda:open-language'

export type Feature = { key: TranslationKey; icon: IconName; accent: IconName; color: string; to?: string; soon?: boolean }
export const FEATURES: Feature[] = [
  { key: 'feat_directions', icon: 'route', accent: 'directionsWalk', color: '#B45309', to: '/#plan' },
  { key: 'feat_places', icon: 'locationOn', accent: 'search', color: '#E11D48', to: '/#plan-end' },
  { key: 'feat_lines', icon: 'train', accent: 'palette', color: '#0369A1', to: '/?tab=lines' },
  { key: 'feat_fares', icon: 'payments', accent: 'sell', color: '#047857', to: '/help/payments#payFares' },
  { key: 'feat_trails', icon: 'hiking', accent: 'map', color: '#4D7C0F', to: '/trails' },
  { key: 'feat_airport', icon: 'flight', accent: 'luggage', color: '#6D28D9', to: '/?to=ERL%20KLIA%20T1&toName=KLIA%20Terminal%201' },
  { key: 'feat_languages', icon: 'translate', accent: 'chat', color: '#0E7490' },
  { key: 'feat_ronda300', icon: 'myLocation', accent: 'storefront', color: '#C2410C', to: RONDA300_MAP },
  { key: 'feat_saved', icon: 'bookmark', accent: 'favorite', color: '#BE185D', to: '/dashboard' },
  { key: 'feat_alerts', icon: 'notifications', accent: 'scheduleOutline', color: '#B91C1C', to: '/about#about-features', soon: true },
]
