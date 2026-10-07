import type { TranslationKey } from '../i18n/translations'
import type { IconName } from './icons'

// Feature tiles: each one is a whole-card link (or, for languages, a button that opens the language menu).
// Icons use rail line colours; every colour here is at least 3:1 against the white tile (measured in
// FeatureGrid.test.tsx). Shah Alam cyan (#00A9E0) and RONDA gold (#F27A5E) are too light on white, so the
// darker KTM Ipoh blue and RONDA dark gold stand in for them.
export const OPEN_LANGUAGE_MENU = 'ronda:open-language'

export type Feature = { key: TranslationKey; icon: IconName; accent: IconName; color: string; to?: string; soon?: boolean }
export const FEATURES: Feature[] = [
  { key: 'feat_directions', icon: 'route', accent: 'directionsWalk', color: '#D50032', to: '/#plan' },
  { key: 'feat_places', icon: 'locationOn', accent: 'search', color: '#E57200', to: '/#plan-end' },
  { key: 'feat_lines', icon: 'train', accent: 'palette', color: '#047940', to: '/?tab=lines' },
  { key: 'feat_fares', icon: 'payments', accent: 'sell', color: '#B23A22', to: '/help/payments#payFares' },
  { key: 'feat_trails', icon: 'hiking', accent: 'map', color: '#00A19A', to: '/trails' },
  { key: 'feat_airport', icon: 'flight', accent: 'luggage', color: '#6B2C91', to: '/?to=ERL%20KLIA%20T1&toName=KLIA%20Terminal%201' },
  { key: 'feat_languages', icon: 'translate', accent: 'chat', color: '#1964B7' },
  { key: 'feat_ronda300', icon: 'myLocation', accent: 'storefront', color: '#76232F', to: '/ronda-300' },
  { key: 'feat_saved', icon: 'bookmark', accent: 'favorite', color: '#3C5A9F', to: '/dashboard' },
  { key: 'feat_alerts', icon: 'notifications', accent: 'scheduleOutline', color: '#D50032', to: '/about#about-features', soon: true },
]
