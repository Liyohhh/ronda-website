import type { TranslationKey } from '../i18n/translations'
import type { IconName } from './icons'

// Feature tiles: each one is a whole-card link (or, for languages, a button that opens the language menu).
// Icons use a range of blues (clean blue theme); every colour here is at least 3:1 against the white tile
// (measured in FeatureGrid.test.tsx).
export const OPEN_LANGUAGE_MENU = 'ronda:open-language'

export type Feature = { key: TranslationKey; icon: IconName; accent: IconName; color: string; to?: string; soon?: boolean }
export const FEATURES: Feature[] = [
  { key: 'feat_directions', icon: 'route', accent: 'directionsWalk', color: '#1D4ED8', to: '/#plan' },
  { key: 'feat_places', icon: 'locationOn', accent: 'search', color: '#0369A1', to: '/#plan-end' },
  { key: 'feat_lines', icon: 'train', accent: 'palette', color: '#1E40AF', to: '/?tab=lines' },
  { key: 'feat_fares', icon: 'payments', accent: 'sell', color: '#0E7490', to: '/help/payments#payFares' },
  { key: 'feat_trails', icon: 'hiking', accent: 'map', color: '#155E75', to: '/trails' },
  { key: 'feat_airport', icon: 'flight', accent: 'luggage', color: '#4338CA', to: '/?to=ERL%20KLIA%20T1&toName=KLIA%20Terminal%201' },
  { key: 'feat_languages', icon: 'translate', accent: 'chat', color: '#2563EB' },
  { key: 'feat_ronda300', icon: 'myLocation', accent: 'storefront', color: '#1E3A8A', to: '/ronda-300' },
  { key: 'feat_saved', icon: 'bookmark', accent: 'favorite', color: '#3B5BDB', to: '/dashboard' },
  { key: 'feat_alerts', icon: 'notifications', accent: 'scheduleOutline', color: '#0284C7', to: '/about#about-features', soon: true },
]
